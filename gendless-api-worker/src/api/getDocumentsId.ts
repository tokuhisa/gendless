import { Hono } from "hono";
import { getDocument } from "../domain/getDocument";

export const getDocumentsId = new Hono<{ Bindings: CloudflareBindings }>().get(
  "/documents/:id",
  async (c) => {
    const id = c.req.param("id");
    const document = await getDocument(c.env, id);
    if (!document) {
      return c.notFound();
    }
    return c.newResponse(document.body, {
      status: 200,
      headers: { etag: document.etag },
    });
  },
);
