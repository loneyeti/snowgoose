declare module "blob-polyfill" {
  export class Blob {
    constructor(blobParts?: BlobPart[], options?: BlobPropertyBag);
    readonly size: number;
    readonly type: string;
    slice(start?: number, end?: number, contentType?: string): Blob;
    arrayBuffer(): Promise<ArrayBuffer>;
    text(): Promise<string>;
    stream(): ReadableStream;
  }
}
