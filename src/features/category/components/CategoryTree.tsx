import React, { useCallback, useRef } from 'react';
import { Tree, type NodeApi } from 'react-arborist';
import { Plus, Layers, Folder, ChevronRight, ChevronDown, Pencil, Trash2, GripVertical } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import type { Category } from '../../../types/database/Category';
import { cn } from '../../../lib/utils';

interface CategoryTreeProps {
  categories: Category[];
  onAdd: (parent: Category) => void;
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
  onAddNewCategory: () => void;
  onMove: (dragId: number, parentId: number | null) => void;
}

type TreeNode = {
  id: string;           // react-arborist requires string id
  _id: number;          // original numeric id from DB
  name: string;
  category_type: string;
  parent_id: number | null;
  children: TreeNode[];
};

export const CategoryTree = ({
  categories,
  onAdd,
  onEdit,
  onDelete,
  onAddNewCategory,
  onMove
}: CategoryTreeProps) => {
  const treeRef = useRef<any>(null);

  // Build hierarchical tree with string ids for react-arborist
  const buildTree = useCallback(
    (items: Category[], parent_id: number | null = null): TreeNode[] => {
      return items
        .filter((item) => (item.parent_id ?? null) === parent_id)
        .map((item) => ({
          id: String(item.id),   // arborist needs string
          _id: item.id,
          name: item.name,
          category_type: item.category_type,
          parent_id: item.parent_id,
          children: buildTree(items, item.id),
        }));
    },
    []
  );

  const treeData = buildTree(categories);

  const handleMove = useCallback(
    ({ dragIds, parentId }: { dragIds: string[]; parentId: string | null }) => {
      const dragId = Number(dragIds[0]);
      const pId = parentId === null ? null : Number(parentId);
      onMove(dragId, pId);
    },
    [onMove]
  );

  // ----- Node Renderer (defined inside so it closes over callbacks) -----
  const NodeRenderer = useCallback(
    ({ node, style, dragHandle }: { node: NodeApi<TreeNode>; style: React.CSSProperties; dragHandle?: React.Ref<any> }) => {
      const hasChildren = node.children && node.children.length > 0;

      // Map node back to Category shape expected by parent handlers
      const asCategory: Category = {
        id: node.data._id,
        name: node.data.name,
        category_type: node.data.category_type,
        parent_id: node.data.parent_id,
      };

      return (
        <div style={style} className="group relative flex items-center pr-2">
          <div className="flex items-center flex-1 h-9 rounded-md transition-all duration-200 hover:bg-accent/50">
            {/* Drag Handle */}
            <div ref={dragHandle} className="px-1.5 text-muted-foreground/30 hover:text-muted-foreground cursor-grab active:cursor-grabbing shrink-0">
              <GripVertical className="h-3.5 w-3.5" />
            </div>

            {/* Expand/Collapse toggle */}
            <button
              type="button"
              className="w-5 h-5 flex items-center justify-center shrink-0 text-muted-foreground hover:text-foreground"
              onClick={(e) => { e.stopPropagation(); node.toggle(); }}
            >
              {hasChildren ? (
                node.isOpen
                  ? <ChevronDown className="h-3.5 w-3.5" />
                  : <ChevronRight className="h-3.5 w-3.5" />
              ) : (
                <span className="w-3.5" />
              )}
            </button>

            {/* Icon & Label */}
            <div
              className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer py-1"
              onClick={(e) => { e.stopPropagation(); if (hasChildren) node.toggle(); }}
            >
              <Folder className={cn(
                "h-4 w-4 shrink-0",
                node.data.parent_id === null ? "text-primary" : "text-indigo-400"
              )} />
              <span className="text-sm font-medium truncate">{node.data.name}</span>
              <span className="text-[10px] uppercase text-muted-foreground/50 tracking-wider shrink-0">
                {node.data.category_type}
              </span>
            </div>

            {/* Actions (visible on hover) */}
            <div className="hidden group-hover:flex items-center gap-0.5 ml-auto shrink-0 animate-in fade-in duration-150">
              <Button
                variant="ghost"
                size="icon"
                title="Add child"
                className="h-7 w-7 text-primary hover:bg-primary/10"
                onClick={(e) => { e.stopPropagation(); onAdd(asCategory); }}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                title="Edit"
                className="h-7 w-7 hover:bg-accent"
                onClick={(e) => { e.stopPropagation(); onEdit(asCategory); }}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                title="Delete"
                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                onClick={(e) => { e.stopPropagation(); onDelete(node.data._id); }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      );
    },
    [onAdd, onEdit, onDelete]
  );

  return (
    <div className="h-full flex flex-col border rounded-xl bg-card shadow-sm overflow-hidden border-primary/10">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between bg-muted/20 backdrop-blur-sm shrink-0">
        <div>
          <h3 className="font-bold text-base tracking-tight">Question Library</h3>
          <p className="text-[11px] text-muted-foreground uppercase font-semibold tracking-wide">
            Drag & Drop to Reorganize
          </p>
        </div>
        <Button size="sm" onClick={onAddNewCategory} className="h-8 gap-1.5 shadow-sm">
          <Plus className="h-3.5 w-3.5" />
          Add Root
        </Button>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-hidden">
        {treeData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-accent/5 rounded-lg border-2 border-dashed border-muted m-4">
            <Layers className="h-10 w-10 mb-2 opacity-20" />
            <p className="italic text-sm mb-1">No structure defined yet.</p>
            <Button variant="link" size="sm" onClick={onAddNewCategory}>
              Create your first category
            </Button>
          </div>
        ) : (
          <Tree<TreeNode>
            ref={treeRef}
            data={treeData}
            width="100%"
            height={600}
            indent={20}
            rowHeight={40}
            overscanCount={5}
            onMove={handleMove}
            openByDefault={true}
          >
            {NodeRenderer}
          </Tree>
        )}
      </div>
    </div>
  );
};
