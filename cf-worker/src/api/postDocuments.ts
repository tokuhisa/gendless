import { Hono } from "hono";
import { generateDocument } from "../domain/generateDocument";
import { documentsPostBody } from "../validation/documents.gen";

export const postDocuments = new Hono<{ Bindings: CloudflareBindings }>().post(
  "/documents",
  async (c) => {
    const body = await c.req.json();
    const requestBody = documentsPostBody.parse(body);
    const result = await generateDocument(c.env, requestBody.inputFileName);
    return c.newResponse(JSON.stringify(result), {
      status: 201,
    });
  },
);
