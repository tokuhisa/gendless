import { Hono } from "hono";
import { generateDocument } from "../domain/generateDocument";

export const postDocuments = new Hono<{ Bindings: CloudflareBindings }>().post(
  "/documents",
  async (c) => {
    const body = await c.req.json();
    const { inputFileName } = body;
    if (typeof inputFileName !== "string") {
      return c.newResponse("inputFileName must be a string", {
        status: 400,
      });
    }
    const result = await generateDocument(c.env, inputFileName);
    return c.newResponse(JSON.stringify(result), {
      status: 201,
    });
  },
);
