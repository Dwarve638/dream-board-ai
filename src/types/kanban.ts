export type TaskStatus = "todo" | "in_progress" | "review"; // 'review' kept as DB value, displayed as 'Completed'

export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string;
  status: TaskStatus;
  due_date: string | null;
  estimated_hours: number | null;
  position: number;
  subtasks: Subtask[];
  created_at: string;
}

export const CATEGORIES = [
  { label: "Wireframes", color: "hsl(var(--category-design))" },
  { label: "Graphic Design", color: "hsl(var(--category-design))" },
  { label: "UI Design", color: "hsl(var(--category-design))" },
  { label: "Development", color: "hsl(var(--category-development))" },
  { label: "Data Entry", color: "hsl(var(--category-data))" },
  { label: "Media", color: "hsl(var(--category-media))" },
  { label: "General", color: "hsl(var(--category-general))" },
] as const;

export const COLUMNS: { id: TaskStatus; label: string; colorVar: string }[] = [
  { id: "todo", label: "To-do", colorVar: "--column-todo" },
  { id: "in_progress", label: "In Progress", colorVar: "--column-in-progress" },
  { id: "review", label: "Completed", colorVar: "--column-completed" },
];

export function getCategoryColor(category: string): string {
  const found = CATEGORIES.find((c) => c.label === category);
  return found?.color ?? "hsl(var(--category-general))";
}
