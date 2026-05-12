import React, { useCallback, useRef } from 'react';
import { Tree, type NodeApi } from 'react-arborist';
import {
  Plus, Monitor, Folder, ChevronRight, ChevronDown,
  Pencil, Trash2, GripVertical, Layers, ClipboardList, X,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import type DisplayView from '../../../types/database/DisplayView';
import { cn } from '../../../lib/utils';

type TreeNode = {
  id: string;
  _id: number;
  name: string;
  type: 'node' | 'test';
  parent_id: number | null;
  children: TreeNode[];
  test_info?: {
    test_id: number;
    assignment_id: number;
  };
};

interface DisplayViewTreeProps {
  items: DisplayView[];
  assignments?: Record<number, { id: number; test_id: number; test_name: string }[]>;
  onAdd: (parent: DisplayView) => void;
  onEdit: (item: DisplayView) => void;
  onDelete: (id: number) => void;
  onAssign: (item: DisplayView) => void;   // open assign-test modal
  onUnassign?: (assignmentId: number) => void;
  onAddRoot: () => void;
  disableAddRoot?: boolean;
  onMove: (dragId: number, parentId: number | null) => void;
}

const DisplayViewTree: React.FC<DisplayViewTreeProps> = ({
  items,
  assignments = {},
  onAdd,
  onEdit,
  onDelete,
  onAssign,
  onUnassign,
  onAddRoot,
  disableAddRoot = false,
  onMove,
}) => {
  const treeRef = useRef<any>(null);

  // Recursive buildTree with visited-Set cycle guard
  const buildTree = useCallback(
    (flat: DisplayView[], parentId: number | null = null, visited = new Set<number>()): TreeNode[] =>
      flat
        .filter((v) => (v.parent_id ?? null) === parentId && !visited.has(v.id))
        .map((v) => {
          const children = buildTree(flat, v.id, new Set([...visited, v.id]));
          
          // Add tests assigned to THIS node
          const nodeTests = assignments[v.id] || [];
          const testNodes: TreeNode[] = nodeTests.map((t) => ({
            id: `test-${v.id}-${t.test_id}`,
            _id: t.test_id,
            name: t.test_name,
            type: 'test',
            parent_id: v.id,
            children: [],
            test_info: {
              test_id: t.test_id,
              assignment_id: t.id,
            },
          }));

          return {
            id: String(v.id),
            _id: v.id,
            name: v.display_name,
            type: 'node',
            parent_id: v.parent_id ?? null,
            children: [...children, ...testNodes],
          };
        }),
    [assignments]
  );

  const treeData = buildTree(items);

  const handleMove = useCallback(
    ({ dragIds, parentId, index }: { dragIds: string[]; parentId: string | null; index: number }) => {
      const dragIdStr = dragIds[0];
      // Don't allow moving tests or dropping into tests
      if (dragIdStr.startsWith('test-')) return;
      if (parentId?.startsWith('test-')) return;

      const dragId = Number(dragIdStr);
      const pId = parentId === null ? null : Number(parentId);
      onMove(dragId, pId);
    },
    [onMove]
  );

  const NodeRenderer = useCallback(
    ({
      node,
      style,
      dragHandle,
    }: {
      node: NodeApi<TreeNode>;
      style: React.CSSProperties;
      dragHandle?: React.Ref<any>;
    }) => {
      const hasChildren = node.children && node.children.length > 0;
      const isRoot = node.data.parent_id === null;
      const isTest = node.data.type === 'test';

      const asDisplayView: DisplayView = {
        id: node.data._id,
        display_name: node.data.name,
        parent_id: node.data.parent_id,
      };

      return (
        <div style={style} className="group relative flex items-center pr-2">
          <div className={cn(
            "flex items-center flex-1 h-9 rounded-md transition-all duration-200",
            isTest ? "bg-indigo-500/5 hover:bg-indigo-500/10 border-l-2 border-indigo-400/50" : "hover:bg-accent/50"
          )}>
            {/* Drag handle - only for nodes */}
            {!isTest ? (
              <div
                ref={dragHandle}
                className="px-1.5 text-muted-foreground/30 hover:text-muted-foreground cursor-grab active:cursor-grabbing shrink-0"
              >
                <GripVertical className="h-3.5 w-3.5" />
              </div>
            ) : (
              <div className="w-6.5" /> 
            )}

            {/* Expand / collapse */}
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

            {/* Icon + label */}
            <div
              className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer py-1"
              onClick={(e) => { e.stopPropagation(); if (hasChildren) node.toggle(); }}
            >
              {isTest ? (
                <ClipboardList className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
              ) : isRoot ? (
                <Monitor className="h-4 w-4 shrink-0 text-primary" />
              ) : (
                <Folder className={cn('h-4 w-4 shrink-0', node.level === 1 ? 'text-indigo-400' : 'text-amber-400')} />
              )}
              <span className={cn(
                "text-sm truncate",
                isTest ? "font-normal text-indigo-700 italic" : "font-medium"
              )}>
                {node.data.name}
              </span>
              <span className="text-[10px] uppercase text-muted-foreground/50 tracking-wider shrink-0 ml-1">
                {isTest ? 'test' : isRoot ? 'root' : 'child'}
              </span>
            </div>

            {/* Actions */}
              <div className="hidden group-hover:flex items-center gap-0.5 ml-auto shrink-0 animate-in fade-in duration-150">
                {!isTest && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Add child"
                      className="h-7 w-7 text-primary hover:bg-primary/10"
                      onClick={(e) => { e.stopPropagation(); onAdd(asDisplayView); }}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Assign MCQ Test"
                      className="h-7 w-7 text-indigo-500 hover:bg-indigo-500/10"
                      onClick={(e) => { e.stopPropagation(); onAssign(asDisplayView); }}
                    >
                      <ClipboardList className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Edit"
                      className="h-7 w-7 hover:bg-accent"
                      onClick={(e) => { e.stopPropagation(); onEdit(asDisplayView); }}
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
                  </>
                )}
                {isTest && onUnassign && (
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Unassign Test"
                    className="h-7 w-7 text-destructive hover:bg-destructive/10"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      if (node.data.test_info) onUnassign(node.data.test_info.assignment_id); 
                    }}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
          </div>
        </div>
      );
    },
    [onAdd, onEdit, onDelete, onAssign, onUnassign]
  );


  return (
    <div className="h-full flex flex-col border rounded-xl bg-card shadow-sm overflow-hidden border-primary/10">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between bg-muted/20 backdrop-blur-sm shrink-0">
        <div>
          <h3 className="font-bold text-base tracking-tight">Display View Structure</h3>
          <p className="text-[11px] text-muted-foreground uppercase font-semibold tracking-wide">
            Drag &amp; Drop to Reorganize
          </p>
        </div>
        {!disableAddRoot && (
          <Button size="sm" onClick={onAddRoot} className="h-8 gap-1.5 shadow-sm">
            <Plus className="h-3.5 w-3.5" />
            Add Root
          </Button>
        )}
        {disableAddRoot && (
          <span className="text-xs text-muted-foreground italic px-2">
            Navigate away to add another root
          </span>
        )}
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-hidden">
        {treeData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-accent/5 rounded-lg border-2 border-dashed border-muted m-4">
            <Layers className="h-10 w-10 mb-2 opacity-20" />
            <p className="italic text-sm mb-1">No display views defined yet.</p>
            {!disableAddRoot && (
              <Button variant="link" size="sm" onClick={onAddRoot}>
                Create your first root
              </Button>
            )}
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

export default DisplayViewTree;
