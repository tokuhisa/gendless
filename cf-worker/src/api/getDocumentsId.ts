import { Hono } from "hono";
import { getDocument } from "../domain/getDocument";
import { documentIdGetParams } from "../validation/documents.gen";

export const getDocumentsId = new Hono<{ Bindings: CloudflareBindings }>().get(
  "/documents/:documentId",
  async (c) => {
    const params = documentIdGetParams.parse(c.req.param());
    const document = await getDocument(c.env, params.documentId);
    if (!document) {
      return c.notFound();
    }
    return c.newResponse(document.body, {
      status: 200,
      headers: { etag: document.etag },
    });
  },
);
