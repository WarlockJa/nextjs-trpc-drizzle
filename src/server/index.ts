import Database from "better-sqlite3";
import { publicProcedure, router } from "./trpc";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { todos } from "@/db/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";

// creating sql db
const sqlite = new Database("sqlite.db");
// pointing db at drizzle object
const db = drizzle(sqlite);

// runs every time migrates schema if needed
migrate(db, { migrationsFolder: "drizzle" });

// api methods
export const appRouter = router({
  getTodos: publicProcedure.query(async () => {
    return await db.select().from(todos).all();
  }),
  addTodo: publicProcedure.input(z.string()).mutation(async (opts) => {
    await db.insert(todos).values({ content: opts.input, done: 0 }).run();
    return true;
  }),
  setDone: publicProcedure
    .input(
      z.object({
        id: z.number(),
        done: z.number(),
      })
    )
    .mutation(async (opts) => {
      await db
        .update(todos)
        .set({ done: opts.input.done })
        .where(eq(todos.id, opts.input.id))
        .run();
    }),
  deleteTodo: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async (opts) => {
      await db.delete(todos).where(eq(todos.id, opts.input.id)).run();
    }),
});

export type AppRouter = typeof appRouter;
