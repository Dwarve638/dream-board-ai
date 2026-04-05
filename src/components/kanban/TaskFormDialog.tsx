import { useState, useEffect } from "react";
import { Task, TaskStatus, CATEGORIES, Subtask } from "@/types/kanban";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X } from "lucide-react";

interface TaskFormDialogProps {
  open: boolean;
  onClose: () => void;
  task?: Task | null;
  defaultStatus?: TaskStatus;
  onSave: (data: {
    title: string;
    description?: string;
    category: string;
    status: TaskStatus;
    due_date?: string;
    estimated_hours?: number;
  }) => void;
  onUpdate?: (data: { id: string } & Partial<Task>) => void;
  subtasks?: Subtask[];
  onAddSubtask?: (task_id: string, title: string) => void;
  onToggleSubtask?: (id: string, completed: boolean) => void;
  onDeleteSubtask?: (id: string) => void;
}

export function TaskFormDialog({
  open,
  onClose,
  task,
  defaultStatus = "todo",
  onSave,
  onUpdate,
  subtasks = [],
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
}: TaskFormDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [dueDate, setDueDate] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [newSubtask, setNewSubtask] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setCategory(task.category);
      setStatus(task.status);
      setDueDate(task.due_date ?? "");
      setEstimatedHours(task.estimated_hours?.toString() ?? "");
    } else {
      setTitle("");
      setDescription("");
      setCategory("General");
      setStatus(defaultStatus);
      setDueDate("");
      setEstimatedHours("");
    }
  }, [task, defaultStatus, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const data = {
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      status,
      due_date: dueDate || undefined,
      estimated_hours: estimatedHours ? parseFloat(estimatedHours) : undefined,
    };

    if (task && onUpdate) {
      onUpdate({ id: task.id, ...data });
    } else {
      onSave(data);
    }
    onClose();
  };

  const handleAddSubtask = () => {
    if (newSubtask.trim() && task && onAddSubtask) {
      onAddSubtask(task.id, newSubtask.trim());
      setNewSubtask("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Create Task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.label} value={c.label}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To-do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Due date</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Estimated hours</label>
              <Input
                type="number"
                step="0.5"
                min="0"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                placeholder="e.g. 3"
              />
            </div>
          </div>

          {/* Subtasks section (edit mode only) */}
          {task && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Subtasks</label>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {subtasks.map((sub) => (
                  <div key={sub.id} className="flex items-center gap-2 group">
                    <Checkbox
                      checked={sub.completed}
                      onCheckedChange={(v) =>
                        onToggleSubtask?.(sub.id, v as boolean)
                      }
                    />
                    <span
                      className={`text-sm flex-1 ${
                        sub.completed ? "line-through text-muted-foreground" : ""
                      }`}
                    >
                      {sub.title}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 opacity-0 group-hover:opacity-100"
                      onClick={() => onDeleteSubtask?.(sub.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="Add subtask..."
                  className="h-8 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={handleAddSubtask}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {task ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
