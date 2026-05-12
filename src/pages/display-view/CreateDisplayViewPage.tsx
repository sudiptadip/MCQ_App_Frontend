import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, CheckCircle2, Monitor, Trash2, GitBranch } from 'lucide-react';
import { getDisplayViews, upsertDisplayView, deleteDisplayView } from '../../features/display-view/api/displayView.api';
import { showToast } from '../../utils/toast';
import Loading from '../../components/common/Loading';
import Error from '../../components/common/Error';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import type DisplayView from '../../types/database/DisplayView';

const nameSchema = z.object({
  display_name: z.string().min(2, 'At least 2 characters required'),
});
type NameForm = z.infer<typeof nameSchema>;

// ── Reusable simple name form ──────────────────────────────────────────────
function NameForm({
  title, description, placeholder, submitLabel, isLoading, onSubmit,
}: {
  title: string; description?: string; placeholder?: string;
  submitLabel?: string; isLoading?: boolean;
  onSubmit: (name: string) => void;
}) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<NameForm>({
    resolver: zodResolver(nameSchema),
    defaultValues: { display_name: '' },
  });
  return (
    <Card className="shadow-lg border-primary/10 bg-card">
      <CardHeader>
        <CardTitle className="text-xl font-bold tracking-tight">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((d) => { onSubmit(d.display_name); reset(); })} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`name-${title}`} className="text-sm font-semibold">Display Name</Label>
            <Input
              id={`name-${title}`}
              placeholder={placeholder || 'Enter display name...'}
              className="h-11 text-base focus-visible:ring-primary"
              autoFocus
              {...register('display_name')}
            />
            {errors.display_name && (
              <p className="text-xs text-destructive font-medium">{errors.display_name.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full h-11 font-bold shadow-md" disabled={isLoading}>
            {isLoading ? 'Saving...' : (submitLabel || 'Save')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
const CreateDisplayViewPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  /** Root created this session — null until user creates one */
  const [sessionRoot, setSessionRoot] = useState<DisplayView | null>(null);

  // SpDisplayView/1 returns only roots
  const { isLoading, isError, refetch } = useQuery({
    queryKey: ['displayViews'],
    queryFn: getDisplayViews,
  });

  // SpDisplayView/4 returns children for the session root
  const { data: sessionChildren = [] } = useQuery({
    queryKey: ['displayViewChildren', sessionRoot?.id],
    queryFn: () => getDisplayViewChildren(sessionRoot!.id),
    enabled: !!sessionRoot,
  });

  const upsertMutation = useMutation({
    mutationFn: upsertDisplayView,
    onSuccess: (res, variables) => {
      if (res.isSuccess && res.data) {
        showToast.success(res.message || 'Saved');
        // If no parent_id was sent → this was a root creation
        if (!variables.parent_id) {
          setSessionRoot(res.data);
          queryClient.invalidateQueries({ queryKey: ['displayViews'] });
        } else {
          // Child created — refresh children list
          queryClient.invalidateQueries({ queryKey: ['displayViewChildren', sessionRoot?.id] });
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
        showToast.success('Child deleted');
        queryClient.invalidateQueries({ queryKey: ['displayViewChildren', sessionRoot?.id] });
      } else {
        showToast.error(res.message || 'Delete failed');
      }
    },
    onError: (err) => showToast.apiErrorShow(err),
  });

  if (isLoading) return <Loading message="Loading..." className="h-[500px]" />;
  if (isError) return (
    <div className="container mx-auto p-12">
      <Error title="Failed to load" message="Could not connect to the database." onRetry={() => refetch()} />
    </div>
  );

  return (
    <div className="container mx-auto p-6 max-w-5xl">
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
            <h1 className="text-3xl font-bold tracking-tight">Create Display View</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {sessionRoot
                ? `Root "${sessionRoot.display_name}" created. Now add children below.`
                : 'Create one root display view to get started.'}
            </p>
          </div>
        </div>
      </div>

      {/* ── PHASE 1: Root creation ───────────────────────────────────── */}
      {!sessionRoot && (
        <div className="flex justify-center">
          <div className="w-full max-w-lg">
            <NameForm
              title="Create Root"
              description="This will be the top-level display view. You can only create one root per session."
              placeholder="e.g. Science, Mathematics..."
              submitLabel="Create Root"
              isLoading={upsertMutation.isPending}
              onSubmit={(name) => upsertMutation.mutate({ display_name: name })}
            />
          </div>
        </div>
      )}

      {/* ── PHASE 2: Add children ────────────────────────────────────── */}
      {sessionRoot && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: children list */}
          <div className="lg:col-span-6">
            <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
              {/* Root badge */}
              <div className="px-5 py-4 border-b border-border/40 bg-primary/5 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-bold text-foreground">{sessionRoot.display_name}</p>
                  <p className="text-[11px] text-muted-foreground">Root created · ID {sessionRoot.id}</p>
                </div>
              </div>

              {/* Children list */}
              <div className="divide-y divide-border/30 min-h-[120px]">
                {sessionChildren.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center px-6">
                    <GitBranch className="h-8 w-8 text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">No children yet</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Add children using the form →</p>
                  </div>
                ) : (
                  sessionChildren.map((child) => (
                    <div key={child.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/20 transition-colors">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary/50 shrink-0" />
                      <span className="text-sm text-foreground flex-1">{child.display_name}</span>
                      <button
                        title="Delete child"
                        onClick={() => deleteMutation.mutate(child.id)}
                        disabled={deleteMutation.isPending}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="px-5 py-3 border-t border-border/40 bg-muted/10">
                <p className="text-xs text-muted-foreground">
                  {sessionChildren.length} child{sessionChildren.length !== 1 ? 'ren' : ''} added
                </p>
              </div>
            </div>
          </div>

          {/* Right: add child form */}
          <div className="lg:col-span-6 sticky top-6">
            <NameForm
              title="Add Child"
              description={`Add a child under "${sessionRoot.display_name}"`}
              placeholder="e.g. Algebra, Organic Chemistry..."
              submitLabel="Add Child"
              isLoading={upsertMutation.isPending}
              onSubmit={(name) => upsertMutation.mutate({ display_name: name, parent_id: sessionRoot.id })}
            />
            <Button variant="ghost" className="w-full mt-3 text-muted-foreground" onClick={() => navigate('/display-view')}>
              Done — Back to List
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateDisplayViewPage;
