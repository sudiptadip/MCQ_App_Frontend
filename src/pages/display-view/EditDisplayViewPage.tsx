import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Monitor, GitBranch, Trash2, Save } from 'lucide-react';
import {
  getDisplayViews,
  getDisplayViewChildren,
  upsertDisplayView,
  deleteDisplayView,
} from '../../features/display-view/api/displayView.api';
import { showToast } from '../../utils/toast';
import Loading from '../../components/common/Loading';
import Error from '../../components/common/Error';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';

const nameSchema = z.object({
  display_name: z.string().min(2, 'At least 2 characters required'),
});
type NameForm = z.infer<typeof nameSchema>;

const EditDisplayViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const rootId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ── Fetch root info ────────────────────────────────────────────────────
  const { data: allViews = [], isLoading: loadingAll } = useQuery({
    queryKey: ['displayViews'],
    queryFn: getDisplayViews,
  });
  const root = allViews.find((v) => v.id === rootId);

  // ── Fetch children by parent_id (SpDisplayView/4) ─────────────────────
  const {
    data: children = [],
    isLoading: loadingChildren,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['displayViewChildren', rootId],
    queryFn: () => getDisplayViewChildren(rootId),
    enabled: !!rootId,
  });

  // ── Edit root name form ────────────────────────────────────────────────
  const {
    register: regEdit,
    handleSubmit: handleEdit,
    reset: resetEdit,
    formState: { errors: editErrors },
  } = useForm<NameForm>({
    resolver: zodResolver(nameSchema),
    defaultValues: { display_name: root?.display_name || '' },
  });

  useEffect(() => {
    if (root) resetEdit({ display_name: root.display_name });
  }, [root, resetEdit]);

  // ── Add child form ─────────────────────────────────────────────────────
  const {
    register: regChild,
    handleSubmit: handleChild,
    reset: resetChild,
    formState: { errors: childErrors },
  } = useForm<NameForm>({
    resolver: zodResolver(nameSchema),
    defaultValues: { display_name: '' },
  });

  // ── Mutations ──────────────────────────────────────────────────────────
  const editRootMutation = useMutation({
    mutationFn: upsertDisplayView,
    onSuccess: (res) => {
      if (res.isSuccess) {
        showToast.success(res.message || 'Root updated');
        queryClient.invalidateQueries({ queryKey: ['displayViews'] });
      } else {
        showToast.error(res.message || 'Update failed');
      }
    },
    onError: (err) => showToast.apiErrorShow(err),
  });

  const addChildMutation = useMutation({
    mutationFn: upsertDisplayView,
    onSuccess: (res) => {
      if (res.isSuccess) {
        showToast.success(res.message || 'Child added');
        queryClient.invalidateQueries({ queryKey: ['displayViewChildren', rootId] });
        resetChild();
      } else {
        showToast.error(res.message || 'Failed to add child');
      }
    },
    onError: (err) => showToast.apiErrorShow(err),
  });

  const deleteChildMutation = useMutation({
    mutationFn: deleteDisplayView,
    onSuccess: (res) => {
      if (res.isSuccess) {
        showToast.success('Child deleted');
        queryClient.invalidateQueries({ queryKey: ['displayViewChildren', rootId] });
      } else {
        showToast.error(res.message || 'Delete failed');
      }
    },
    onError: (err) => showToast.apiErrorShow(err),
  });

  // ── Guards ─────────────────────────────────────────────────────────────
  if (loadingAll || loadingChildren) {
    return <Loading message="Loading display view..." className="h-[500px]" />;
  }
  if (isError || (!loadingAll && !root)) {
    return (
      <div className="container mx-auto p-12">
        <Error
          title="Display View not found"
          message="Could not find this root display view."
          onRetry={() => { queryClient.invalidateQueries({ queryKey: ['displayViews'] }); refetch(); }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" className="mb-4 -ml-2 text-muted-foreground hover:text-foreground gap-2"
          onClick={() => navigate('/display-view')}>
          <ArrowLeft size={16} /> Back to Display Views
        </Button>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Monitor className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Display View</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Root: <span className="font-semibold text-foreground">{root?.display_name}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── Left: Children management ────────────────────────────── */}
        <div className="lg:col-span-6">
          <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border/40 bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-bold">Children</h2>
              </div>
              <span className="text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                {children.length} total
              </span>
            </div>

            {/* Children list */}
            <div className="divide-y divide-border/30 min-h-[120px] max-h-[340px] overflow-y-auto">
              {children.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                  <GitBranch className="h-9 w-9 text-muted-foreground/25 mb-3" />
                  <p className="text-sm text-muted-foreground font-medium">No children yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Add children using the form on the right</p>
                </div>
              ) : (
                children.map((child) => (
                  <div
                    key={child.id}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-muted/20 transition-colors group"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-primary/50 shrink-0" />
                    <span className="text-sm text-foreground flex-1">{child.display_name}</span>
                    <span className="text-[10px] text-muted-foreground/40 mr-1">#{child.id}</span>
                    <button
                      title="Delete child"
                      onClick={() => deleteChildMutation.mutate(child.id)}
                      disabled={deleteChildMutation.isPending}
                      className="p-1.5 rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add child form inline at bottom */}
            <div className="px-5 py-4 border-t border-border/40 bg-muted/10">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Add Child
              </p>
              <form
                onSubmit={handleChild((d) =>
                  addChildMutation.mutate({ display_name: d.display_name, parent_id: rootId })
                )}
                className="flex items-start gap-2"
              >
                <div className="flex-1 space-y-1">
                  <Input
                    placeholder="Child display name..."
                    className="h-9 text-sm focus-visible:ring-primary"
                    {...regChild('display_name')}
                  />
                  {childErrors.display_name && (
                    <p className="text-xs text-destructive">{childErrors.display_name.message}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  size="sm"
                  className="h-9 px-4 shrink-0"
                  disabled={addChildMutation.isPending}
                >
                  {addChildMutation.isPending ? 'Adding...' : 'Add'}
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* ── Right: Edit root name ─────────────────────────────────── */}
        <div className="lg:col-span-6 sticky top-6">
          <Card className="shadow-lg border-primary/10 bg-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
                <Monitor className="h-5 w-5 text-primary" /> Edit Root Name
              </CardTitle>
              <CardDescription>
                Update the display name for this root view.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleEdit((d) =>
                  editRootMutation.mutate({ id: rootId, display_name: d.display_name })
                )}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="edit-root-name" className="text-sm font-semibold">Display Name</Label>
                  <Input
                    id="edit-root-name"
                    className="h-11 text-base focus-visible:ring-primary"
                    {...regEdit('display_name')}
                  />
                  {editErrors.display_name && (
                    <p className="text-xs text-destructive font-medium">{editErrors.display_name.message}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 font-bold shadow-md gap-2"
                  disabled={editRootMutation.isPending}
                >
                  <Save size={16} />
                  {editRootMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditDisplayViewPage;
