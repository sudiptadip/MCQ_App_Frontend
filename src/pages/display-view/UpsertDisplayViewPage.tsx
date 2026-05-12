import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Monitor, Plus } from 'lucide-react';
import {
  getDisplayViews,
  getDisplayViewTree,
  upsertDisplayView,
  deleteDisplayView,
} from '../../features/display-view/api/displayView.api';
import {
  deleteDisplayViewTest,
} from '../../features/display-view/api/displayViewTest.api';
import DisplayViewTree from '../../features/display-view/components/DisplayViewTree';
import AssignTestModal from '../../features/display-view/components/AssignTestModal';
import { showToast } from '../../utils/toast';
import Loading from '../../components/common/Loading';
import Error from '../../components/common/Error';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '../../components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '../../components/ui/dialog';
import type DisplayView from '../../types/database/DisplayView';

const schema = z.object({
  display_name: z.string().min(2, 'At least 2 characters required'),
});
type FormData = z.infer<typeof schema>;

// ─────────────────────────────────────────────────────────────────────────────
const UpsertDisplayViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isEditMode = !!id;
  const editRootId = id ? Number(id) : null;
  const effectiveRootId = editRootId;

  const [selectedItem, setSelectedItem] = useState<Partial<DisplayView> | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [assignNode, setAssignNode] = useState<DisplayView | null>(null);

  // ── Edit mode: get root name from roots list ──────────────────────────
  const { data: allRoots = [], isLoading: loadingRoots, isError: rootsError } = useQuery({
    queryKey: ['displayViews'],
    queryFn: getDisplayViews,
    enabled: isEditMode,
  });

  // ── ONE API call: SpDisplayView/4 returns full flat tree at once ──────
  const {
    data: treeItems = [],
    isLoading: loadingTree,
    isError: treeError,
  } = useQuery({
    queryKey: ['displayViewTree', effectiveRootId],
    queryFn: () => getDisplayViewTree(effectiveRootId!),
    enabled: !!effectiveRootId,
  });

  // Map assignments directly from the single-API tree response
  const assignmentsMap: Record<number, { id: number; test_id: number; test_name: string }[]> = {};
  treeItems.forEach((item) => {
    if (item.assigned_tests) {
      try {
        assignmentsMap[item.id] = typeof item.assigned_tests === 'string'
          ? JSON.parse(item.assigned_tests)
          : item.assigned_tests;
      } catch (e) {
        console.error(`Failed to parse assigned_tests for item ${item.id}`, e);
        assignmentsMap[item.id] = [];
      }
    }
  });

  // Look for root in both the global list and the specific tree response
  const currentRoot = isEditMode
    ? (allRoots.find((r) => r.id === editRootId) || treeItems.find(item => item.id === editRootId))
    : null;

  // treeItems is the complete flat list (root + all descendants) — use directly
  const flatItems: DisplayView[] = treeItems;

  // ── Form ─────────────────────────────────────────────────────────────
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { display_name: '' },
  });

  useEffect(() => {
    reset({ display_name: selectedItem?.display_name || '' });
  }, [selectedItem, reset]);

  // ── Mutations ─────────────────────────────────────────────────────────
  const upsertMutation = useMutation({
    mutationFn: upsertDisplayView,
    onSuccess: (res, variables) => {
      if (res.isSuccess && res.data) {
        showToast.success(res.message || 'Saved');
        if (!variables.parent_id && !isEditMode) {
          // Root just created in create mode → redirect to edit page
          queryClient.invalidateQueries({ queryKey: ['displayViews'] });
          // Give a tiny moment for invalidation to start
          setTimeout(() => {
            navigate(`/display-view/edit/${res.data.id}`, { replace: true });
          }, 100);
        } else {
          // Child added/edited → just refresh the tree
          queryClient.invalidateQueries({ queryKey: ['displayViewTree', effectiveRootId ?? res.data.id] });
          queryClient.invalidateQueries({ queryKey: ['displayViews'] });
          setSelectedItem(null);
        }
      } else {
        showToast.error(res.message || 'Save failed');
      }
    },
    onError: (err) => showToast.apiErrorShow(err),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDisplayView,
    onSuccess: (res) => {
      if (res.isSuccess) {
        showToast.success(res.message || 'Deleted');
        queryClient.invalidateQueries({ queryKey: ['displayViewTree', effectiveRootId] });
        queryClient.invalidateQueries({ queryKey: ['displayViews'] });
        setDeleteId(null);
        if (selectedItem?.id === deleteId) setSelectedItem(null);
      } else {
        showToast.error(res.message || 'Delete failed');
      }
    },
    onError: (err) => showToast.apiErrorShow(err),
  });

  const unassignMutation = useMutation({
    mutationFn: deleteDisplayViewTest,
    onSuccess: (res) => {
      if (res.isSuccess) {
        showToast.success('Test unassigned');
        // Invalidate the tree to show tests updated
        queryClient.invalidateQueries({ queryKey: ['displayViewTree', effectiveRootId] });
      } else {
        showToast.error(res.message || 'Failed to unassign test');
      }
    },
    onError: (err) => showToast.apiErrorShow(err),
  });

  // ── Handlers ─────────────────────────────────────────────────────────
  const handleAdd = (parent: DisplayView) =>
    setSelectedItem({ parent_id: parent.id, display_name: '' });

  const handleEdit = (item: DisplayView) => setSelectedItem(item);

  const handleMove = (dragId: number, parentId: number | null) => {
    const item = flatItems.find((v) => v.id === dragId);
    if (!item) return;
    upsertMutation.mutate({ ...item, parent_id: parentId });
  };

  const handleUnassign = (assignmentId: number) => {
    unassignMutation.mutate(assignmentId);
  };

  const handleFormSubmit = (data: FormData) => {
    const payload: Partial<DisplayView> = { display_name: data.display_name };
    if (selectedItem?.id) payload.id = selectedItem.id;
    if (selectedItem?.parent_id) payload.parent_id = selectedItem.parent_id;
    upsertMutation.mutate(payload);
  };

  // ── Labels ────────────────────────────────────────────────────────────
  const formTitle = selectedItem?.id
    ? 'Edit Item'
    : selectedItem?.parent_id
    ? 'Add Child'
    : 'Create Root';

  const formDesc = selectedItem?.id
    ? 'Update the display name for this item.'
    : selectedItem?.parent_id
    ? `Add a child under item ID ${selectedItem.parent_id}.`
    : 'Create a top-level display view. Only one root is allowed.';

  // ── Guards ────────────────────────────────────────────────────────────
  // Only show error if BOTH attempts to find the root failed and nothing is loading
  const isDataLoading = loadingRoots || (isEditMode && loadingTree);
  const isDataError = rootsError || (isEditMode && treeError);

  if (isEditMode && isDataLoading && !currentRoot) {
    return <Loading message="Fetching display view..." className="h-[600px]" />;
  }

  if (isEditMode && !isDataLoading && !currentRoot) {
    return (
      <div className="container mx-auto p-12">
        <Error
          title="Display View not found"
          message="Could not load the requested root display view. It might have been deleted or there is a sync issue."
          onRetry={() => {
            queryClient.invalidateQueries({ queryKey: ['displayViews'] });
            queryClient.invalidateQueries({ queryKey: ['displayViewTree', effectiveRootId] });
          }}
        />
      </div>
    );
  }

  const pageTitle = isEditMode
    ? `Edit: ${currentRoot?.display_name || '...'}`
    : 'Create Display View';

  const pageDesc = isEditMode
    ? 'Manage this display view and its children.'
    : 'Create a new root display view. After saving you will be redirected to the edit page.';

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          className="mb-4 -ml-2 text-muted-foreground hover:text-foreground gap-2"
          onClick={() => navigate('/display-view')}
        >
          <ArrowLeft size={16} /> Back to Display Views
        </Button>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Monitor className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{pageTitle}</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{pageDesc}</p>
          </div>
        </div>
      </div>

      {/* ── CREATE MODE before root: centered form ────────────────────── */}
      {!isEditMode && (
        <div className="flex justify-center">
          <div className="w-full max-w-lg">
            <Card className="shadow-lg border-primary/10 bg-card">
              <CardHeader>
                <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-primary" /> Create Root
                </CardTitle>
                <CardDescription>
                  This will be the top-level display view. Only one root is allowed.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleSubmit((d) =>
                    upsertMutation.mutate({ display_name: d.display_name })
                  )}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="root_name" className="text-sm font-semibold">Display Name</Label>
                    <Input
                      id="root_name"
                      placeholder="e.g. Science, Mathematics..."
                      className="h-11 text-base focus-visible:ring-primary"
                      autoFocus
                      {...register('display_name')}
                    />
                    {errors.display_name && (
                      <p className="text-xs text-destructive font-medium">{errors.display_name.message}</p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 font-bold shadow-md"
                    disabled={upsertMutation.isPending}
                  >
                    {upsertMutation.isPending ? 'Creating...' : 'Create Root'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ── TREE + FORM: edit mode only ─────────────────────────────── */}
      {isEditMode && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Tree */}
          <div className="lg:col-span-5 h-[calc(100vh-200px)] min-h-[500px]">
            {loadingTree ? (
              <Loading message="Loading tree..." className="h-full" />
            ) : (
              <DisplayViewTree
                items={flatItems}
                assignments={assignmentsMap}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={setDeleteId}
                onAssign={setAssignNode}
                onUnassign={handleUnassign}
                onAddRoot={() => {}}
                disableAddRoot={true}
                onMove={handleMove}
              />
            )}
          </div>

          {/* Right: Form panel */}
          <div className="lg:col-span-7 sticky top-6">
            {selectedItem ? (
              <Card className="shadow-lg border-primary/10 bg-card">
                <CardHeader>
                  <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-primary" />
                    {formTitle}
                  </CardTitle>
                  <CardDescription>{formDesc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="display_name" className="text-sm font-semibold">
                        Display Name
                      </Label>
                      <Input
                        id="display_name"
                        placeholder="e.g. Chapter 1, Algebra..."
                        className="h-12 text-lg focus-visible:ring-primary"
                        autoFocus
                        {...register('display_name')}
                      />
                      {errors.display_name && (
                        <p className="text-xs text-destructive font-medium">
                          {errors.display_name.message}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 pt-6 border-t border-border/50">
                      <Button
                        type="submit"
                        className="flex-1 font-bold shadow-md h-11"
                        disabled={upsertMutation.isPending}
                      >
                        {upsertMutation.isPending ? 'Saving...' : selectedItem?.id ? 'Update' : formTitle}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 h-11"
                        onClick={() => setSelectedItem(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed rounded-lg bg-muted/20 text-center p-8">
                <div className="bg-primary/10 p-4 rounded-full mb-4 shadow-inner">
                  <Plus className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Manage Structure</h3>
                <p className="text-muted-foreground max-w-[300px] mt-2">
                  Click <strong>+</strong> on any node to add a child, or select a node to edit it.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assign Test Modal */}
      <AssignTestModal
        node={assignNode}
        onClose={() => setAssignNode(null)}
      />

      {/* Delete dialog */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This will permanently delete this item and all its children.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UpsertDisplayViewPage;
