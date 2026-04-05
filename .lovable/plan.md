

# Kanban Board with AI Assistant

## Overview
A gorgeous, interactive Kanban board with drag-and-drop, an integrated AI chatbot, and persistent database storage — styled after the clean, card-based design in the reference images.

## Design
- **Clean white/light gray background** with subtle card shadows, matching the reference images
- **Three columns**: To-do, In Progress, Review — each with a colored count badge
- **Task cards** with: title, colored category tag, subtask progress bar, due date, time estimate
- **Smooth drag-and-drop** animations between columns using @hello-pangea/dnd
- **Sidebar** with navigation, dark mode toggle, and storage/settings section inspired by reference image 1
- **AI chat panel** — slide-out drawer on the right side for conversing with the AI assistant

## Features

### Task Management
- Create, edit, and delete tasks with a clean modal form
- Each card shows: title, category tag (color-coded), subtask count/progress bar, due date, estimated hours
- Drag and drop cards between To-do → In Progress → Review columns
- Add/complete subtasks within each task

### AI Chatbot (Slide-out Panel)
- Floating chat button that opens a drawer panel
- Powered by Lovable AI (Gemini) via an edge function
- Streaming responses rendered with markdown
- Capabilities: break tasks into subtasks, suggest priorities/categories, answer general project Q&A
- Aware of current board state (sends task data as context)

### Authentication
- Email/password signup and login
- Protected routes — must be logged in to see the board

### Database (Lovable Cloud + Supabase)
- **Tables**: `tasks` (title, description, category, status, due_date, estimated_hours, position, user_id), `subtasks` (task_id, title, completed)
- Row-Level Security so each user only sees their own tasks
- Real-time sync — changes persist immediately

### Pages
1. **Auth page** — login/signup form
2. **Board page** — the main Kanban view with sidebar + columns + AI chat drawer

