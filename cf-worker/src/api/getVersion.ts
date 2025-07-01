import { Hono } from "hono";
import type { versionGetResponse } from "../validation/version.gen";
import { z } from "zod";

type GetVersionResponse = z.infer<typeof versionGetResponse>;

export const getVersion = new Hono().get("/version", (c) => {
  const response = {
    version: "0.0.1",
  } satisfies GetVersionResponse;
  return c.json(response);
});
