import React, { useState, useEffect } from 'react';
import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Monitor } from 'lucide-react';
import {
  getDisplayViews,
  getDisplayViewChildren,
  upsertDisplayView,
  deleteDisplayView,
} from '../../features/display-view/api/displayView.api';
import DisplayViewTree from '../../features/display-view/components/DisplayViewTree';
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

const DisplayViewPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [selectedItem, setSelectedItem] = useState<Partial<DisplayView> | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  /** Locks the "Add Root" button for the remainder of this page session */
  const [rootCreatedThisSession, setRootCreatedThisSession] = useState(false);

  /**
   * Cascading parent IDs to fetch.
   * Starts with root IDs, then grows as we discover children (for N-level support).
   */
  const [allParentIds, setAllParentIds] = useState<number[]>([]);

  // ── Fetch roots (/1) ──────────────────────────────────────────────────
  const { data: roots = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['displayViews'],
    queryFn: getDisplayViews,
  });

  // Seed allParentIds from roots when they load
  useEffect(() => {
    if (roots.length > 0) {
      setAllParentIds((prev) => {
        const prevSet = new Set(prev);
        const newIds = roots.map((r) => r.id).filter((id) => !prevSet.has(id));
        return newIds.length > 0 ? [...prev, ...newIds] : prev;
      });
    }
  }, [roots]);

  // ── Fetch children for ALL known parent IDs (cascading N-level) ───────
  const childResults = useQueries({
    queries: allParentIds.map((parentId) => ({
      queryKey: ['displayViewChildren', parentId] as const,
      queryFn: () => getDisplayViewChildren(parentId),
      enabled: allParentIds.length > 0,
    })),
  });

  // When children load, add their IDs to allParentIds → triggers grandchild fetch
  useEffect(() => {
    const newIds: number[] = [];
    childResults.forEach((result) => {
      result.data?.forEach((child) => newIds.push(child.id));
    });
    if (newIds.length > 0) {
      setAllParentIds((prev) => {
        const prevSet = new Set(prev);
        const added = newIds.filter((id) => !prevSet.has(id));
        return added.length > 0 ? [...prev, ...added] : prev;
      });
    }
  }, [childResults]);

  // ── Build combined flat list for the tree ─────────────────────────────
  const flatItems: DisplayView[] = React.useMemo(() => {
    // Map parentId → child list from results
    const childMap = new Map<number, DisplayView[]>();
    childResults.forEach((result, idx) => {
      const parentId = allParentIds[idx];
      if (result.data && parentId !== undefined) {
        childMap.set(
          parentId,
          result.data.map((c) => ({ ...c, parent_id: parentId }))
        );
      }
    });

    const allChildren: DisplayView[] = [];
    childMap.forEach((children) => allChildren.push(...children));

    return [
      ...roots.map((r) => ({ ...r, parent_id: null as null })),
      ...allChildren,
    ];
  }, [roots, childResults, allParentIds]);

  // ── Form ──────────────────────────────────────────────────────────────
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
      if (res.isSuccess) {
        showToast.success(res.message || 'Saved');
        // If no parent_id sent → this was a root creation → lock Add Root
        if (!variables.parent_id) {
          setRootCreatedThisSession(true);
        }
        queryClient.invalidateQueries({ queryKey: ['displayViews'] });
        queryClient.invalidateQueries({ queryKey: ['displayViewChildren'] });
        setSelectedItem(null);
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
        queryClient.invalidateQueries({ queryKey: ['displayViews'] });
        queryClient.invalidateQueries({ queryKey: ['displayViewChildren'] });
        setDeleteId(null);
        if (selectedItem?.id === deleteId) setSelectedItem(null);
      } else {
        showToast.error(res.message || 'Delete failed');
      }
    },
    onError: (err) => showToast.apiErrorShow(err),
  });

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleAddRoot = () => setSelectedItem({ display_name: '' });

  /** Called when "+" is clicked on ANY node — adds a child under that node */
  const handleAdd = (parent: DisplayView) =>
    setSelectedItem({ parent_id: parent.id, display_name: '' });

  const handleEdit = (item: DisplayView) => setSelectedItem(item);

  const handleMove = (dragId: number, parentId: number | null) => {
    const item = flatItems.find((v) => v.id === dragId);
    if (!item) return;
    upsertMutation.mutate({ ...item, parent_id: parentId });
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
    : 'Create a new top-level display view.';

  // ── Guards ────────────────────────────────────────────────────────────
  if (isLoading && roots.length === 0) {
    return <Loading message="Fetching display view structure..." className="h-[600px]" />;
  }

  if (isError) {
    return (
      <div className="container mx-auto p-12">
        <Error
          title="Failed to load Display Views"
          message="We encountered an issue while connecting to the database."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Display Views</h1>
        <p className="text-muted-foreground mt-1">
          Organize display views by dragging and dropping. Click <strong>+</strong> on any node to add a child.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Tree */}
        <div className="lg:col-span-5 h-[calc(100vh-180px)] min-h-[500px]">
          <DisplayViewTree
            items={flatItems}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={setDeleteId}
            onAddRoot={handleAddRoot}
            disableAddRoot={rootCreatedThisSession}
            onMove={handleMove}
          />
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
                      placeholder="e.g. Science, Chapter 1..."
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
              <h3 className="text-xl font-bold">Manage Display Views</h3>
              <p className="text-muted-foreground max-w-[300px] mt-2">
                Select an item to rename, click <strong>+</strong> on any node to add a child,
                or drag items to reorganize.
              </p>
              {!rootCreatedThisSession && (
                <Button variant="outline" className="mt-6 font-semibold" onClick={handleAddRoot}>
                  Create Root Display View
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete dialog */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This will permanently delete this item and all its children. This cannot be undone.
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

export default DisplayViewPage;
