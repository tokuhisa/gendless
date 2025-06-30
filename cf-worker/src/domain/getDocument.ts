import { ObjectStorage } from "../infra/ObjectStorage";

export const getDocument = async (
  env: CloudflareBindings,
  fileName: string,
) => {
  const storage = new ObjectStorage(env);
  return await storage.getObject("documents/" + fileName);
};
