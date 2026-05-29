import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { DataTable, type ColumnDef } from '../../components/ui/DataTable';
import { getParentCategories, deleteCategory } from '../../features/category/api/category.api';
import { showToast } from '../../utils/toast';
import type { Category } from '../../types/database/Category';
import Error from '../../components/common/Error';
import { ActionButton } from '../../features/mcq/components/McqQuestionAnsTable';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';

const CategoryListPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = React.useState<number | null>(null);

  const { data: roots = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['parentCategories'],
    queryFn: getParentCategories,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: (res) => {
      if (res.isSuccess) {
        showToast.success(res.message || 'Deleted successfully');
        queryClient.invalidateQueries({ queryKey: ['parentCategories'] });
        setDeleteId(null);
      } else {
        showToast.error(res.message || 'Delete failed');
      }
    },
    onError: (err) => showToast.apiErrorShow(err),
  });

  const columns: ColumnDef<Category>[] = [
    { accessorKey: 'id', header: '#', size: 60, enableSorting: false },
    {
      accessorKey: 'name',
      header: 'Category Name',
      cell: ({ getValue }) => (
        <span className="font-semibold text-foreground">{getValue<string>() || '—'}</span>
      ),
    },
    {
      accessorKey: 'category_type',
      header: 'Type',
      size: 150,
      cell: ({ getValue }) => (
        <span className="text-xs uppercase text-muted-foreground tracking-wider font-semibold">
          {getValue<string>() || '—'}
        </span>
      ),
    },
    {
      id: '__actions__',
      header: 'Actions',
      size: 120,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const id = row.original?.id;
        return (
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <ActionButton
              title="Edit"
              onClick={(e) => { e.stopPropagation(); if (id) navigate(`/category/edit/${id}`); }}
            >
              <Pencil size={14} />
            </ActionButton>
            <ActionButton
              title="Delete"
              variant="danger"
              onClick={(e) => { e.stopPropagation(); if (id) setDeleteId(id); }}
            >
              <Trash2 size={14} />
            </ActionButton>
          </div>
        );
      },
    },
  ];

  if (isError) {
    return (
      <div className="p-6">
        <Error title="Failed to load" message="Error fetching parent category list." onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <DataTable
        data={roots}
        columns={columns}
        isLoading={isLoading || deleteMutation.isPending}
        title="Question Categories"
        description="Manage top-level root categories. Click Edit to manage subcategories, topics and hierarchy."
        enableSorting
        enableSearch
        searchPlaceholder="Search categories..."
        enablePagination
        defaultPageSize={10}
        onRowClick={(row: any) => {
          const id = row?.original?.id;
          if (id) navigate(`/category/edit/${id}`);
        }}
        toolbarActions={
          <button
            id="btn-create-category"
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
            onClick={() => navigate('/category/create')}
          >
            <Plus size={14} /> Create Category
          </button>
        }
      />

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category?</DialogTitle>
            <DialogDescription>
              This will permanently delete this category and all of its subcategories, subjects and topics. This cannot be undone.
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

export default CategoryListPage;
