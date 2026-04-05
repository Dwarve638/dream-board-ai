import { Task, getCategoryColor } from "@/types/kanban";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, CheckCircle2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Draggable } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";

interface TaskCardProps {
  task: Task;
  index: number;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, index, onEdit, onDelete }: TaskCardProps) {
  const completedCount = task.subtasks.filter((s) => s.completed).length;
  const totalCount = task.subtasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const categoryColor = getCategoryColor(task.category);

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={provided.draggableProps.style}
        >
          <Card
            className={`p-4 cursor-grab active:cursor-grabbing transition-shadow duration-150 hover:shadow-md group ${
              snapshot.isDragging ? "shadow-2xl opacity-95 ring-2 ring-primary/30" : "shadow-sm"
            }`}
            onClick={() => onEdit(task)}
          >
            <div className="space-y-3">
              {/* Category badge */}
              <div className="flex items-center justify-between">
                <Badge
                  variant="secondary"
                  className="text-xs font-medium px-2.5 py-0.5"
                  style={{
                    backgroundColor: categoryColor + "15",
                    color: categoryColor,
                  }}
                >
                  {task.category}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(task.id);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>

              {/* Title */}
              <h3 className="font-semibold text-sm leading-tight">{task.title}</h3>

              {/* Subtasks progress */}
              {totalCount > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Subtasks</span>
                    <span className="ml-auto font-medium">{completedCount}/{totalCount}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Footer: due date + estimated hours */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                {task.due_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{format(new Date(task.due_date), "MMM d")}</span>
                  </div>
                )}
                {task.estimated_hours && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{task.estimated_hours}h</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </Draggable>
  );
}
