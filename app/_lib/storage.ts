"use server";

import { createClient } from "@/app/_utils/supabase/server";
import { Buffer } from "buffer"; // Import Buffer for server-side handling
import { Logger } from "next-axiom";

export async function supabaseUploadFile(filename: string, file: File) {
  const log = new Logger();
  const storageBucket = process.env.SUPABASE_VISION_STORAGE_BUCKET;
  if (!storageBucket) {
    throw new Error(
      "SUPABASE_VISION_STORAGE_BUCKET is not defined in the environment variables."
    );
  }
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    // console.log(`User id: ${user?.id}`);

    if (!user) {
      throw new Error("User not found");
    }

    const fullPath = `/${user.id}/${filename}`;
    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer();

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(storageBucket) // bucket name - make sure this bucket exists in your Supabase project
      .upload(fullPath, arrayBuffer, {
        contentType: file.type,
        upsert: true, // overwrite if file exists
      });

    if (error) {
      throw error;
    }

    // Get public URL for the uploaded file
    const result = await supabase.storage
      .from(storageBucket)
      .createSignedUrl(fullPath, 600);

    // Ensure result and result.data is not null and destructure the publicUrl
    if (result?.data) {
      const { signedUrl } = result.data;

      // If signedUrl is possibly your public URL, use it accordingly
      if (signedUrl) {
        // console.log("Public URL:", signedUrl);
        return signedUrl; // or derive the publicUrl if needed
      } else {
        log.error("Error: signedUrl does not exist in the response.");
      }
    } else {
      log.error("Error: Data is null, failed to create signed URL.");
    }
  } catch (error) {
    log.error(`Error uploading file to Supabase: ${error}`);
    throw error;
  }
}

// Helper function to convert base64 string to a File-like object for Supabase upload
function base64ToFile(
  base64Data: string,
  filename: string,
  mimeType: string
): File {
  // Use Buffer for server-side base64 decoding
  const buffer = Buffer.from(base64Data, "base64");
  // Create a File-like object that mimics the structure expected by supabaseUploadFile
  const file = {
    name: filename,
    type: mimeType,
    size: buffer.length,
    arrayBuffer: async () => buffer, // Provide the buffer via arrayBuffer method
    // Add other File methods like slice(), stream(), text() if needed, though arrayBuffer is often sufficient
    slice: (start?: number, end?: number, contentType?: string) => {
      const slicedBuffer = buffer.slice(start, end);
      return new Blob([slicedBuffer], { type: contentType || mimeType });
    },
    stream: () => {
      // Node.js streams are different from browser ReadableStream.
      // This might need the 'buffer-to-stream' package or similar if a true stream is required.
      // For Supabase upload, arrayBuffer is usually enough.
      // Returning a simple stream representation if necessary:
      const readable = new (require("stream").Readable)();
      readable._read = () => {}; // _read is required, do nothing
      readable.push(buffer);
      readable.push(null); // Signal end of stream
      return readable as any; // Cast needed as Node stream != DOM stream
    },
    text: async () => {
      return buffer.toString("utf-8"); // Assuming utf-8, adjust if needed
    },
    lastModified: Date.now(), // Add lastModified property
  };
  // Cast to 'any' then 'File' to satisfy the type checker, acknowledging it's a mock.
  return file as any as File;
}

/**
 * Uploads a base64 encoded image string to Supabase storage.
 * @param base64Data The base64 encoded image data.
 * @param mimeType The MIME type of the image (e.g., 'image/png', 'image/jpeg').
 * @returns A promise that resolves with the public URL of the uploaded image.
 */
export async function uploadBase64Image(
  base64Data: string,
  mimeType: string
): Promise<string> {
  // Generate a unique filename
  const fileExtension = mimeType.split("/")[1] || "png"; // Default to png if split fails
  const filename = `ai-generated-${Date.now()}.${fileExtension}`;
  const log = new Logger();

  // Convert base64 data to a File-like object
  const file = base64ToFile(base64Data, filename, mimeType);

  // Upload using the existing supabaseUploadFile function
  const url = await supabaseUploadFile(filename, file);

  // Check if URL was successfully obtained
  if (!url) {
    log.error("Supabase upload returned no URL for base64 image.");
    throw new Error(
      "Failed to upload base64 image to Supabase storage: No URL returned."
    );
  }

  return url;
}
