
export interface ObjectData { 
  key: string;
  body: ReadableStream;
  etag: string;
}

export class ObjectStorage {
  private bucket: R2Bucket;

  constructor(env: CloudflareBindings) {
    this.bucket = env.GENDLESS_BUCKET;
  }

  async getObject(key: string): Promise<ObjectData | null> {
    const obj = await this.bucket.get(key);
    if (!obj) {
      return null;
    }
    return {
      key: obj.key,
      body: obj.body,
      etag: obj.httpEtag,
    };
  }
}
