import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, CheckCircle2, Search, X, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { getTestList } from '../../test/api/test.api';
import {
  assignDisplayViewTest,
  deleteDisplayViewTest,
  getDisplayViewTests,
} from '../api/displayViewTest.api';
import { showToast } from '../../../utils/toast';
import type Tests from '../../../types/database/Tests';
import type DisplayView from '../../../types/database/DisplayView';

interface AssignTestModalProps {
  node: DisplayView | null;    // the node we're assigning tests to
  onClose: () => void;
}

const AssignTestModal: React.FC<AssignTestModalProps> = ({ node, onClose }) => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const isOpen = !!node;

  // All available tests
  const { data: allTests = [], isLoading: loadingTests } = useQuery({
    queryKey: ['testList'],
    queryFn: getTestList,
    enabled: isOpen,
  });

  // Tests already assigned to this node
  const { data: assignedTests = [], isLoading: loadingAssigned } = useQuery({
    queryKey: ['displayViewTests', node?.id],
    queryFn: () => getDisplayViewTests(node!.id!),
    enabled: isOpen && !!node?.id,
  });

  const assignedTestIds = new Set(assignedTests.map((t) => t.test_id));

  // Assign mutation
  const assignMutation = useMutation({
    mutationFn: assignDisplayViewTest,
    onSuccess: (res) => {
      if (res.isSuccess) {
        showToast.success('Test assigned successfully');
        queryClient.invalidateQueries({ queryKey: ['displayViewTests', node?.id] });
        queryClient.invalidateQueries({ queryKey: ['displayViewTree'] });
      } else {
        showToast.error(res.message || 'Failed to assign test');
      }
    },
    onError: (err) => showToast.apiErrorShow(err),
  });

  // Unassign mutation
  const unassignMutation = useMutation({
    mutationFn: deleteDisplayViewTest,
    onSuccess: (res) => {
      if (res.isSuccess) {
        showToast.success('Test unassigned');
        queryClient.invalidateQueries({ queryKey: ['displayViewTests', node?.id] });
        queryClient.invalidateQueries({ queryKey: ['displayViewTree'] });
      } else {
        showToast.error(res.message || 'Failed to unassign test');
      }
    },
    onError: (err) => showToast.apiErrorShow(err),
  });

  const handleToggle = (test: Tests) => {
    if (!node?.id) return;

    if (assignedTestIds.has(test.id!)) {
      // Find the assignment record to get its id
      const record = assignedTests.find((t) => t.test_id === test.id);
      if (record?.id) {
        unassignMutation.mutate(record.id);
      }
    } else {
      assignMutation.mutate({
        display_view_id: node.id,
        test_id: test.id!,
      });
    }
  };

  const filtered = allTests.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const isPending = assignMutation.isPending || unassignMutation.isPending;
  const isLoading = loadingTests || loadingAssigned;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-5 pb-3 shrink-0 border-b">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <ClipboardList className="h-5 w-5 text-primary" />
            Assign MCQ Tests
          </DialogTitle>
          <DialogDescription className="text-xs">
            Node: <strong>{node?.display_name}</strong>
            {assignedTests.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[11px] font-semibold">
                {assignedTests.length} assigned
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="px-5 py-3 shrink-0 border-b bg-muted/20">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
              autoFocus
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-40 gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading tests...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <ClipboardList className="h-8 w-8 mb-2 opacity-20" />
              <p className="text-sm italic">No tests found</p>
            </div>
          ) : (
            <ul className="divide-y">
              {filtered.map((test) => {
                const isAssigned = assignedTestIds.has(test.id!);
                return (
                  <li
                    key={test.id}
                    className="flex items-center justify-between px-5 py-3 hover:bg-accent/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {isAssigned ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{test.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {test.total_questions} questions · {test.duration_minutes} min
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={isAssigned ? 'outline' : 'default'}
                      className={`shrink-0 ml-4 h-7 text-xs font-semibold ${
                        isAssigned ? 'text-destructive border-destructive/40 hover:bg-destructive/10' : ''
                      }`}
                      disabled={isPending}
                      onClick={() => handleToggle(test)}
                    >
                      {isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : isAssigned ? (
                        'Unassign'
                      ) : (
                        'Assign'
                      )}
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t shrink-0 bg-muted/20 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignTestModal;
