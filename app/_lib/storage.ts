"use server";

import { createClient } from "@/app/_utils/supabase/server";

export async function supabaseUploadFile(filename: string, file: File) {
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
    console.log(`User id: ${user?.id}`);

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
        console.log("Public URL:", signedUrl);
        return signedUrl; // or derive the publicUrl if needed
      } else {
        console.error("Error: signedUrl does not exist in the response.");
      }
    } else {
      console.error("Error: Data is null, failed to create signed URL.");
    }
  } catch (error) {
    console.error("Error uploading file to Supabase:", error);
    throw error;
  }
}
