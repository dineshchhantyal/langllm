// src/tools/tasks.ts
import { tool } from "@langchain/core/tools";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { z } from "zod";
import {
  createTask,
  deleteTask,
  formatTask,
  listTasks,
  summarizeTasks,
  updateTask,
} from "../db/taskStore";

const listTasksTool = tool(async () => {
  const tasks = await listTasks();
  return summarizeTasks(tasks);
}, {
  name: "list_tasks",
  description: "List all stored tasks with their ids and status.",
  schema: z.object({}),
});

const createTaskTool = tool(
  async ({ title, description, due_date }) => {
    const created = await createTask({
      title,
      description: description ?? null,
      dueDate: due_date ?? null,
    });
    return `Created task:\n${formatTask(created)}`;
  },
  {
    name: "create_task",
    description: "Create a new task and assign it a unique id.",
    schema: z.object({
      title: z.string().min(1, "title required"),
      description: z.string().optional().nullable(),
      due_date: z.string().optional().nullable(),
    }),
  }
);

const updateTaskTool = tool(
  async ({ id, title, status, description, due_date }) => {
    const updated = await updateTask({
      id,
      title: title ?? undefined,
      status: status ?? undefined,
      description: description ?? undefined,
      dueDate: due_date ?? undefined,
    });
    return `Updated task:\n${formatTask(updated)}`;
  },
  {
    name: "update_task",
    description: "Update fields on an existing task by id.",
    schema: z.object({
      id: z.string().min(1, "id required"),
      title: z.string().optional(),
      status: z.enum(["pending", "done"]).optional(),
      description: z.string().optional().nullable(),
      due_date: z.string().optional().nullable(),
    }),
  }
);

const deleteTaskTool = tool(
  async ({ id }) => {
    const removed = await deleteTask(id);
    return `Deleted task:\n${formatTask(removed)}`;
  },
  {
    name: "delete_task",
    description: "Delete a task permanently by id.",
    schema: z.object({
      id: z.string().min(1, "id required"),
    }),
  }
);

export const todoTools = [
  listTasksTool,
  createTaskTool,
  updateTaskTool,
  deleteTaskTool,
];

export const todoToolNode = new ToolNode(todoTools);
