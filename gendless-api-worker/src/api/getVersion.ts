import { Hono } from "hono";

export const getVersion = new Hono().get("/version", (c) => {
  return c.json({ version: "0.0.1" });
});
