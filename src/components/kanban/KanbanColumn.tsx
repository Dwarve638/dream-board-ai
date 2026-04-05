import { Task, TaskStatus } from "@/types/kanban";
import { TaskCard } from "./TaskCard";
import { Droppable } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface KanbanColumnProps {
  id: TaskStatus;
  label: string;
  colorVar: string;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onAddTask: (status: TaskStatus) => void;
}

export function KanbanColumn({
  id,
  label,
  colorVar,
  tasks,
  onEditTask,
  onDeleteTask,
  onAddTask,
}: KanbanColumnProps) {
  return (
    <div
      className="flex-1 min-w-0 rounded-3xl p-3 px-4 transition-colors flex flex-col h-full"
      style={{
        background: `linear-gradient(to bottom, hsl(var(${colorVar}) / 0.18) 0%, hsl(var(${colorVar}) / 0.06) 50%, transparent 100%)`,
      }}
    >
      {/* Column header */}
      <div className="flex items-center gap-2.5 mb-4 px-1">
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: `hsl(var(${colorVar}))` }}
        />
        <h2 className="font-semibold text-sm">{label}</h2>
        <span
          className="text-xs font-bold rounded-full px-2 py-0.5 min-w-[1.5rem] text-center"
          style={{
            backgroundColor: `hsl(var(${colorVar}) / 0.15)`,
            color: `hsl(var(${colorVar}))`,
          }}
        >
          {tasks.length}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 ml-auto"
          onClick={() => onAddTask(id)}
          style={{ color: `hsl(var(${colorVar}))` }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Droppable area */}
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="space-y-3 flex-1 rounded-2xl p-1 transition-colors"
            style={{
              minHeight: "200px",
              backgroundColor: snapshot.isDraggingOver
                ? `hsl(var(${colorVar}) / 0.06)`
                : "transparent",
            }}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
