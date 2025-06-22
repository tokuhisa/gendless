import { Hono } from "hono";
import { getVersion } from "./api/getVersion";
import { getDocumentsId } from "./api/getDocumentsId";
import { postDocuments } from "./api/postDocuments";

const app = new Hono();

app.get("/api/hono", (c) => {
  return c.json({ name: "Hono!" });
});
app.route("/api", getVersion);
app.route("/api", getDocumentsId);
app.route("/api", postDocuments);

export default app;
