import { ObjectStorage } from "../infra/ObjectStorage";

export const getDocument = async (env: CloudflareBindings, id: string) => {
  const storage = new ObjectStorage(env);
  return await storage.getObject("documents/" + id);
};
