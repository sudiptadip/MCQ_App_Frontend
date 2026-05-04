import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CategoryTree } from '../../features/category/components/CategoryTree';
import { CategoryForm } from '../../features/category/components/CategoryForm';
import { getCategories, upsertCategory, deleteCategory } from '../../features/category/api/category.api';
import { showToast } from '../../utils/toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Plus } from 'lucide-react';

import Loading from '../../components/common/Loading';
import Error from '../../components/common/Error';
import type { Category } from '../../types/database/Category';

const MCQCategory = () => {
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = useState<Partial<Category> | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const {
    data: categories = [],
    isLoading: isFetching,
    isError,
    refetch
  } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  });

  const upsertMutation = useMutation({
    mutationFn: upsertCategory,
    onSuccess: (res) => {
      if (res.isSuccess) {
        showToast.success(res.message);
        queryClient.invalidateQueries({ queryKey: ['categories'] });
        setSelectedItem(null);
      } else {
        showToast.error(res.message);
      }
    },
    onError: (err) => showToast.apiErrorShow(err)
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: (res) => {
      if (res.isSuccess) {
        showToast.success(res.message);
        queryClient.invalidateQueries({ queryKey: ['categories'] });
        setDeleteId(null);
        if (selectedItem?.id === deleteId) setSelectedItem(null);
      } else {
        showToast.error(res.message);
      }
    },
    onError: (err) => showToast.apiErrorShow(err)
  });

  const handleMove = (dragId: number, parentId: number | null) => {
    const item = categories.find(c => c.id === dragId);
    if (item) {
      upsertMutation.mutate({
        ...item,
        parent_id: parentId
      });
    }
  };

  const handleAddChild = (parent: Category) => {
    setSelectedItem({
      parent_id: parent.id,
      category_type: 'category',
      name: '',
    });
  };

  const handleEdit = (category: Category) => {
    setSelectedItem(category);
  };

  const handleAddNewCategory = () => {
    setSelectedItem({
      parent_id: null,
      category_type: 'category',
    });
  };

  const handleSubmit = (data: any) => {
    upsertMutation.mutate(data);
  };

  if (isFetching && categories.length === 0) {
    return <Loading message="Fetching library structure..." className="h-[600px]" />;
  }

  if (isError) {
    return (
      <div className="container mx-auto p-12">
        <Error
          title="Failed to load hierarchy"
          message="We encountered an issue while connecting to the database. Please check your connection or try again."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Question Hierarchy</h1>
        <p className="text-muted-foreground mt-1">Organize categories by dragging and dropping them.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Tree View */}
        <div className="lg:col-span-5 h-[calc(100vh-180px)] min-h-[500px]">
          <CategoryTree
            categories={categories}
            onAdd={handleAddChild}
            onEdit={handleEdit}
            onDelete={setDeleteId}
            onAddNewCategory={handleAddNewCategory}
            onMove={handleMove}
          />
        </div>

        {/* Right Side: Form Panel */}
        <div className="lg:col-span-7 sticky top-6">
          {selectedItem ? (
            <CategoryForm
              key={selectedItem.id || 'new'}
              initialData={selectedItem}
              onSubmit={handleSubmit}
              onCancel={() => setSelectedItem(null)}
              isLoading={upsertMutation.isPending}
            />
          ) : (
            <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed rounded-lg bg-muted/20 text-center p-8">
              <div className="bg-primary/10 p-4 rounded-full mb-4 shadow-inner">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Manage Structure</h3>
              <p className="text-muted-foreground max-w-[300px] mt-2">
                Select an item to rename, or drag items in the tree to reorganize your hierarchy.
              </p>
              <Button
                variant="outline"
                className="mt-6 font-semibold"
                onClick={handleAddNewCategory}
              >
                Create Top-level Category
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the category
              and all of its child subjects and topics.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MCQCategory;