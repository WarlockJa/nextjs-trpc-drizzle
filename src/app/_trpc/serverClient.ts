import { appRouter } from "@/server";
import { httpBatchLink } from "@trpc/client";
import React from "react";

export const serverClient = appRouter.createCaller({
  links: [
    httpBatchLink({
      url: "http://localhost:3000/api/trpc",
    }),
  ],
});
