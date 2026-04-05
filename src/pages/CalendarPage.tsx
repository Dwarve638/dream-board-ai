import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTasks } from "@/hooks/useTasks";
import { AppSidebar } from "@/components/kanban/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Loader2, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/types/kanban";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isToday, isSameDay, parseISO } from "date-fns";

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  todo:        { bg: "bg-[hsl(var(--column-todo)/0.15)]",        text: "text-[hsl(var(--column-todo))]",        dot: "hsl(var(--column-todo))" },
  in_progress: { bg: "bg-[hsl(var(--column-in-progress)/0.15)]", text: "text-[hsl(var(--column-in-progress))]", dot: "hsl(var(--column-in-progress))" },
  review:      { bg: "bg-[hsl(var(--column-completed)/0.15)]",   text: "text-[hsl(var(--column-completed))]",   dot: "hsl(var(--column-completed))" },
};

const STATUS_LABEL: Record<string, string> = {
  todo: "To-do",
  in_progress: "In Progress",
  review: "Completed",
};

export default function CalendarPage() {
  const { user, loading: authLoading } = useAuth();
  const { tasks, isLoading, createTask } = useTasks();
  const [current, setCurrent] = useState(new Date());
  const [selected, setSelected] = useState<Date | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !selected) return;
    
    createTask.mutate({
      title: newTaskTitle.trim(),
      status: "todo",
      category: "General",
      due_date: format(selected, "yyyy-MM-dd"),
    });
    setNewTaskTitle("");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const monthStart = startOfMonth(current);
  const monthEnd = endOfMonth(current);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const tasksForDay = (day: Date): Task[] =>
    tasks.filter((t) => t.due_date && isSameDay(parseISO(t.due_date), day));

  const selectedTasks = selected ? tasksForDay(selected) : [];

  return (
    <SidebarProvider>
      <div className="h-screen flex w-full overflow-hidden">
        <AppSidebar activePage="calendar" />
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Header */}
          <header className="h-16 flex items-center justify-between px-6 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div>
                <h1 className="text-xl font-bold">Calendar</h1>
                <p className="text-xs text-muted-foreground">{tasks.filter(t => t.due_date).length} tasks with due dates</p>
              </div>
            </div>
            {/* Month nav */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrent(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-semibold min-w-[120px] text-center">
                {format(current, "MMMM yyyy")}
              </span>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrent(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="ml-2" onClick={() => { setCurrent(new Date()); setSelected(new Date()); }}>
                Today
              </Button>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto min-h-0 flex gap-6">
            {isLoading ? (
              <div className="flex items-center justify-center w-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Calendar grid */}
                <div className="flex-1 flex flex-col min-w-0 animate-fadein">
                  {/* Day headers */}
                  <div className="grid grid-cols-7 mb-1">
                    {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
                      <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">{d}</div>
                    ))}
                  </div>
                  {/* Day cells */}
                  <div className="grid grid-cols-7 flex-1 gap-1">
                    {days.map((day) => {
                      const dayTasks = tasksForDay(day);
                      const isCurrentMonth = isSameMonth(day, current);
                      const isSelected = selected && isSameDay(day, selected);
                      const todayDay = isToday(day);
                      return (
                        <button
                          key={day.toISOString()}
                          onClick={() => setSelected(day)}
                          className={`
                            rounded-xl p-2 text-left flex flex-col gap-1 min-h-[90px] transition-all duration-150 border
                            ${isCurrentMonth ? "bg-card" : "bg-muted/30 opacity-50"}
                            ${isSelected ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-border"}
                            ${todayDay && !isSelected ? "border-primary/40" : ""}
                          `}
                        >
                          <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full
                            ${todayDay ? "bg-primary text-primary-foreground" : "text-foreground"}
                          `}>
                            {format(day, "d")}
                          </span>
                          <div className="flex flex-col gap-0.5 overflow-hidden">
                            {dayTasks.slice(0, 3).map(task => (
                              <div
                                key={task.id}
                                className={`text-[10px] font-medium truncate rounded-md px-1.5 py-0.5 ${STATUS_STYLES[task.status]?.bg} ${STATUS_STYLES[task.status]?.text}`}
                              >
                                {task.title}
                              </div>
                            ))}
                            {dayTasks.length > 3 && (
                              <span className="text-[10px] text-muted-foreground px-1">+{dayTasks.length - 3} more</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Side panel */}
                <div className="w-72 shrink-0 flex flex-col gap-3 animate-fadein">
                  <div className="rounded-2xl border bg-card p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-sm">
                        {selected ? format(selected, "EEEE, MMMM d") : "Select a day"}
                      </span>
                    </div>
                    {selected ? (
                      <div className="space-y-4">
                        {selectedTasks.length > 0 ? (
                          <div className="space-y-2">
                            {selectedTasks.map(task => (
                              <div key={task.id} className="rounded-xl border p-3 space-y-1.5">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-sm font-medium leading-tight">{task.title}</span>
                                  <Badge
                                    variant="secondary"
                                    className={`text-[10px] shrink-0 ${STATUS_STYLES[task.status]?.bg} ${STATUS_STYLES[task.status]?.text}`}
                                  >
                                    {STATUS_LABEL[task.status]}
                                  </Badge>
                                </div>
                                {task.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                                )}
                                <span className="text-[10px] text-muted-foreground">{task.category}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No tasks due on this day.</p>
                        )}
                        
                        {/* Quick Add Form */}
                        <form onSubmit={handleQuickAdd} className="flex items-center gap-2 pt-2 border-t mt-4">
                          <input
                            type="text"
                            placeholder="Type a task and hit Enter..."
                            className="flex-1 text-sm bg-transparent border-0 border-b border-border focus:border-primary focus:ring-0 px-1 py-1 transition-colors outline-none"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            autoFocus
                          />
                          <Button type="submit" size="sm" variant="ghost" disabled={!newTaskTitle.trim() || isLoading} className="h-7 px-2 shrink-0 text-primary hover:text-primary hover:bg-primary/10">
                            Add
                          </Button>
                        </form>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Click a day to see its tasks.</p>
                    )}
                  </div>

                  {/* Month summary */}
                  <div className="rounded-2xl border bg-card p-4 space-y-3">
                    <span className="font-semibold text-sm">This month</span>
                    {(["todo","in_progress","review"] as const).map(status => {
                      const count = tasks.filter(t =>
                        t.due_date &&
                        isSameMonth(parseISO(t.due_date), current) &&
                        t.status === status
                      ).length;
                      return (
                        <div key={status} className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: STATUS_STYLES[status].dot }}
                          />
                          <span className="text-sm text-muted-foreground flex-1">{STATUS_LABEL[status]}</span>
                          <span className="text-sm font-bold">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
