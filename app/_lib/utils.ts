import { nanoid } from "nanoid";

export function generateUniqueFilename(filename: string) {
  // Extract the file extension from the input filename
  const extension = filename.split(".").pop();

  return `${nanoid()}.${extension}`;
}
