import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { useAuth } from "@/hooks/useAuth";
import { useTasks } from "@/hooks/useTasks";
import { COLUMNS, Task, TaskStatus } from "@/types/kanban";
import { KanbanColumn } from "@/components/kanban/KanbanColumn";
import { TaskFormDialog } from "@/components/kanban/TaskFormDialog";
import { AIChatDrawer } from "@/components/kanban/AIChatDrawer";
import { AppSidebar } from "@/components/kanban/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

export default function Index() {
  const { user, loading: authLoading } = useAuth();
  const {
    tasks,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
  } = useTasks();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>("todo");
  const [localTasks, setLocalTasks] = useState<Task[]>([]);

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const fireConfetti = () => {
    // 1. Initial Confetti Burst
    confetti({
      particleCount: 160,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#22c55e", "#86efac", "#4ade80", "#fbbf24", "#a78bfa", "#f472b6"],
      scalar: 1.1,
    });
    
    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 50,
        origin: { y: 0.55, x: 0.3 },
        colors: ["#22c55e", "#fbbf24", "#60a5fa"],
      });
    }, 200);

    // 2. Add Fireworks!
    const duration = 1.5 * 1000; // run for 1.5 seconds
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    
    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 40 * (timeLeft / duration);
      // Fire from multiple random spots
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.4), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.6, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const tasksByStatus = (status: TaskStatus) =>
    localTasks.filter((t) => t.status === status).sort((a, b) => a.position - b.position);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { draggableId, destination, source } = result;
    
    // If dropped in exact same spot, do nothing
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    
    if (destination.droppableId === "review" && source.droppableId !== "review") fireConfetti();

    // Calculate new position integer to properly sandwich the item
    const destColumnTasks = tasksByStatus(destination.droppableId as TaskStatus);
    const siblings = destColumnTasks.filter(t => t.id !== draggableId);
    
    let newPosition = Math.floor(Date.now() / 1000); // fallback for empty col
    
    if (siblings.length > 0) {
      if (destination.index === 0) {
        // Dropped at very top
        newPosition = siblings[0].position - 1000;
      } else if (destination.index >= siblings.length) {
        // Dropped at very bottom
        newPosition = siblings[siblings.length - 1].position + 1000;
      } else {
        // Dropped in the middle
        const above = siblings[destination.index - 1].position;
        const below = siblings[destination.index].position;
        newPosition = Math.floor((above + below) / 2);
      }
    }

    // 1. Synchronously update local visual state immediately so react-beautiful-dnd doesn't flash
    setLocalTasks(prev => prev.map(t => 
      t.id === draggableId ? { ...t, status: destination.droppableId as TaskStatus, position: newPosition } : t
    ));

    // 2. Persist to server
    moveTask.mutate({
      id: draggableId,
      status: destination.droppableId as TaskStatus,
      position: newPosition,
    });
  };

  const openCreate = (status: TaskStatus) => {
    setEditingTask(null);
    setDefaultStatus(status);
    setDialogOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  return (
    <SidebarProvider>
      <div className="h-screen flex w-full overflow-hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Header */}
          <header className="h-16 flex items-center justify-between px-6 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div>
                <h1 className="text-xl font-bold">Board</h1>
                <p className="text-xs text-muted-foreground">{tasks.length} tasks total</p>
              </div>
            </div>
            <Button onClick={() => openCreate("todo")} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Task
            </Button>
          </header>

          {/* Board */}
          <main className="flex-1 p-6 overflow-auto min-h-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <div className="flex gap-6 w-full h-full">
                  {COLUMNS.map((col) => (
                    <KanbanColumn
                      key={col.id}
                      id={col.id}
                      label={col.label}
                      colorVar={col.colorVar}
                      tasks={tasksByStatus(col.id)}
                      onEditTask={openEdit}
                      onDeleteTask={(id) => deleteTask.mutate(id)}
                      onAddTask={openCreate}
                    />
                  ))}
                </div>
              </DragDropContext>
            )}
          </main>
        </div>
      </div>

      {/* AI Chat */}
      <AIChatDrawer tasks={tasks} />

      {/* Task Dialog */}
      <TaskFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingTask(null);
        }}
        task={editingTask}
        defaultStatus={defaultStatus}
        onSave={(data) => {
          if (data.status === "review") fireConfetti();
          createTask.mutate(data);
        }}
        onUpdate={(data) => updateTask.mutate(data)}
        subtasks={editingTask?.subtasks ?? []}
        onAddSubtask={(task_id, title) => addSubtask.mutate({ task_id, title })}
        onToggleSubtask={(id, completed) => toggleSubtask.mutate({ id, completed })}
        onDeleteSubtask={(id) => deleteSubtask.mutate(id)}
      />
    </SidebarProvider>
  );
}
