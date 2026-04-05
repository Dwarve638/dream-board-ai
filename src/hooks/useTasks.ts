import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Task, TaskStatus, Subtask } from "@/types/kanban";
import { toast } from "sonner";

export function useTasks() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const tasksQuery = useQuery({
    queryKey: ["tasks", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Task[]> => {
      const { data: tasks, error } = await supabase
        .from("tasks")
        .select("*")
        .order("position", { ascending: true });
      if (error) throw error;

      const { data: subtasks, error: subError } = await supabase
        .from("subtasks")
        .select("*");
      if (subError) throw subError;

      return (tasks ?? []).map((t) => ({
        ...t,
        status: t.status as TaskStatus,
        subtasks: (subtasks ?? []).filter((s) => s.task_id === t.id),
      }));
    },
  });

  const createTask = useMutation({
    mutationFn: async (task: {
      title: string;
      description?: string;
      category: string;
      status: TaskStatus;
      due_date?: string;
      estimated_hours?: number;
    }) => {
      const { error } = await supabase.from("tasks").insert({
        ...task,
        user_id: user!.id,
        position: Math.floor(Date.now() / 1000),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task created");
    },
    onError: (e) => toast.error(e.message),
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Task>) => {
      const { subtasks: _, ...dbUpdates } = updates as any;
      const { error } = await supabase.from("tasks").update(dbUpdates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
    onError: (e) => toast.error(e.message),
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task deleted");
    },
    onError: (e) => toast.error(e.message),
  });

  const moveTask = useMutation({
    mutationFn: async ({ id, status, position }: { id: string; status: TaskStatus; position: number }) => {
      const { error } = await supabase.from("tasks").update({ status, position }).eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, status, position }) => {
      await qc.cancelQueries({ queryKey: ["tasks", user?.id] });
      const previousTasks = qc.getQueryData<Task[]>(["tasks", user?.id]);

      qc.setQueryData<Task[]>(["tasks", user?.id], (old) => {
        if (!old) return old;
        return old.map((t) =>
          t.id === id ? { ...t, status, position } : t
        );
      });

      return { previousTasks };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousTasks) {
        qc.setQueryData(["tasks", user?.id], context.previousTasks);
      }
      toast.error("Failed to move task");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const addSubtask = useMutation({
    mutationFn: async ({ task_id, title }: { task_id: string; title: string }) => {
      const { error } = await supabase.from("subtasks").insert({ task_id, title });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const toggleSubtask = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase.from("subtasks").update({ completed }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const deleteSubtask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("subtasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  return {
    tasks: tasksQuery.data ?? [],
    isLoading: tasksQuery.isLoading,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
  };
}
