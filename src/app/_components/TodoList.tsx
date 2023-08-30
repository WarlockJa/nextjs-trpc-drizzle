"use client";

import { useState } from "react";
import { trpc } from "../_trpc/client";
import { serverClient } from "../_trpc/serverClient";

// initialTodos are SSR'd on initial load
// type comes from tRPC response and is marked Awaited because it no longer is a promise
export default function TodoList({
  initialTodos,
}: {
  initialTodos: Awaited<ReturnType<(typeof serverClient)["getTodos"]>>;
}) {
  // trpc methods
  // defining initialData from SSR loaded todos
  const getTodos = trpc.getTodos.useQuery(undefined, {
    initialData: initialTodos,
    // avoiding initial fetching on the client since we already have done it on server
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
  const addTodo = trpc.addTodo.useMutation({
    // page refetch/refresh on successful addTodo
    onSettled: () => {
      getTodos.refetch();
    },
  });
  const setDone = trpc.setDone.useMutation({
    // page refetch/refresh on successful setDone
    onSettled: () => {
      getTodos.refetch();
    },
  });
  const deleteTodo = trpc.deleteTodo.useMutation({
    // page refetch/refresh on successful setDone
    onSettled: () => {
      getTodos.refetch();
    },
  });

  const [content, setContent] = useState("");
  return (
    <div>
      <div className="my-5 text-2xl">
        {getTodos.data?.map((todo) => (
          <div key={todo.id} className="flex gap-3 items-center">
            <button
              className="text-red-500 hover:text-red-700"
              onClick={() => deleteTodo.mutate({ id: todo.id })}
            >
              X
            </button>
            <input
              id={`check-${todo.id}`}
              type="checkbox"
              checked={!!todo.done}
              style={{ zoom: 1.5 }}
              onChange={async () => {
                setDone.mutate({ id: todo.id, done: todo.done ? 0 : 1 });
              }}
            />
            <label htmlFor={`check-${todo.id}`}>{todo.content}</label>
          </div>
        ))}
      </div>
      <div className="flex gap-3 items-center">
        <label htmlFor="content">Content</label>
        <input
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-grow text-black bg-white rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 px-4 py-2"
        />
        <button
          onClick={async () => {
            if (content.length) {
              addTodo.mutate(content);
              setContent("");
            }
          }}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
        >
          Add Todo
        </button>
      </div>
    </div>
  );
}
