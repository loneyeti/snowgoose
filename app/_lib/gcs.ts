"use server";

import {
  Storage,
  GenerateSignedPostPolicyV4Response,
} from "@google-cloud/storage";

export async function gcsUploadURL(filename: string) {
  const storage = new Storage({
    projectId: process.env.GCS_PROJECT_ID,
    credentials: {
      client_email: process.env.GCS_CLIENT_EMAIL,
      private_key: process.env.GCS_PRIVATE_KEY,
    },
  });

  const bucket = storage.bucket(process.env.GCS_BUCKET_NAME ?? "");
  const bucketFile = bucket.file(filename);
  const options = {
    expires: Date.now() + 1 * 60 * 2000, //  2 minutes,
    fields: { "x-goog-meta-test": "data" },
  };
  const response = await bucketFile.generateSignedPostPolicyV4(options);
  return response as GenerateSignedPostPolicyV4Response;
}

export async function gcsUploadFile(filename: string, file: File) {
  try {
    const urlResponse = await gcsUploadURL(filename);
    const url = urlResponse[0].url;
    const fields = urlResponse[0].fields;
    console.log(url);
    const formData = new FormData();
    Object.entries({ ...fields, file }).forEach(([key, value]) => {
      formData.append(key, value);
    });
    const uploadResponse = await fetch(url, {
      method: "POST",
      body: formData,
    });
    if (uploadResponse.ok) {
      console.log(url);
      const uploadedURL = `${url}${filename}`;
      return uploadedURL;
    } else {
      throw new Error(
        `Issue uploading file: ${uploadResponse.statusText} ${uploadResponse.body}`
      );
    }
  } catch (error) {
    console.log(`error: ${error}`);
  }
}
