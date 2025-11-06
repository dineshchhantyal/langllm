// src/db/taskStore.ts
import { promises as fs } from "fs";
import { randomUUID } from "crypto";
import path from "path";

export type TaskStatus = "pending" | "done";

export interface TaskRecord {
  id: string;
  title: string;
  status: TaskStatus;
  description?: string | null;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR = path.resolve(process.cwd(), "data");
const TASKS_FILE = path.join(DATA_DIR, "tasks.json");

async function ensureStorage() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(TASKS_FILE);
  } catch {
    await fs.writeFile(TASKS_FILE, "[]", "utf8");
  }
}

async function readTasks(): Promise<TaskRecord[]> {
  await ensureStorage();
  const raw = await fs.readFile(TASKS_FILE, "utf8");
  try {
    const parsed = JSON.parse(raw) as TaskRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeTasks(tasks: TaskRecord[]): Promise<void> {
  await ensureStorage();
  await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2), "utf8");
}

export async function listTasks(): Promise<TaskRecord[]> {
  return readTasks();
}

interface CreateTaskInput {
  title: string;
  description?: string | null;
  dueDate?: string | null;
}

export async function createTask(input: CreateTaskInput): Promise<TaskRecord> {
  const now = new Date().toISOString();
  const task: TaskRecord = {
    id: randomUUID(),
    title: input.title,
    description: input.description ?? null,
    dueDate: input.dueDate ?? null,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  const tasks = await readTasks();
  tasks.push(task);
  await writeTasks(tasks);
  return task;
}

interface UpdateTaskInput {
  id: string;
  title?: string;
  status?: TaskStatus;
  description?: string | null;
  dueDate?: string | null;
}

export async function updateTask({ id, ...updates }: UpdateTaskInput): Promise<TaskRecord> {
  const tasks = await readTasks();
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) {
    throw new Error(`Task with id ${id} not found`);
  }

  const existing = tasks[index];
  const updated: TaskRecord = {
    ...existing,
    title: updates.title ?? existing.title,
    status: updates.status ?? existing.status,
    description:
      updates.description !== undefined
        ? updates.description
        : existing.description ?? null,
    dueDate:
      updates.dueDate !== undefined
        ? updates.dueDate
        : existing.dueDate ?? null,
    updatedAt: new Date().toISOString(),
  };

  tasks[index] = updated;
  await writeTasks(tasks);
  return updated;
}

export async function deleteTask(id: string): Promise<TaskRecord> {
  const tasks = await readTasks();
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) {
    throw new Error(`Task with id ${id} not found`);
  }

  const [removed] = tasks.splice(index, 1);
  await writeTasks(tasks);
  return removed;
}

export function formatTask(task: TaskRecord): string {
  const statusEmoji = task.status === "done" ? "✅" : "🟡";
  const due = task.dueDate ? ` (due ${task.dueDate})` : "";
  const desc = task.description ? `\n    notes: ${task.description}` : "";
  return `${statusEmoji} ${task.title}${due}\n    id: ${task.id}${desc}`;
}

export function summarizeTasks(tasks: TaskRecord[]): string {
  if (tasks.length === 0) {
    return "No tasks stored yet.";
  }
  return tasks.map(formatTask).join("\n");
}
