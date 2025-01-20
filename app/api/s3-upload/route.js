import { NextResponse } from "next/server";
import { S3, PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3({
  region: process.env.NEXT_PUBLIC_AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_S3_SECRET_ACCESS_KEY_ID,
  },
});

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const fileName = searchParams.get("fileName");
  const userID = searchParams.get("userID");
  const contentType = searchParams.get("contentType");
  const type = searchParams.get("type"); // e.g., 'server-image' or 'chat-attachment'

  if (!fileName || !contentType || !type) {
    return new Response(JSON.stringify({ error: "Missing parameters" }), {
      status: 400,
    });
  }

  // Prefix the file path based on the type
  const keyPrefix = type === "server-image" ? "server-images" : "chat-attachments";
  const folderPath = `${keyPrefix}/${userID}`;
  let fileKey = `${folderPath}/${fileName}`;

  try {
    // Check if file already exists by listing files in the folder
    const listParams = {
      Bucket: "discord-clone-assets",
      Prefix: folderPath,
    };

    const { Contents } = await s3.send(new ListObjectsV2Command(listParams));

    // Generate a new filename if the file exists
    if (Contents) {
      const existingFiles = Contents.map((item) => item.Key);
      const baseName = fileName.replace(/\.[^/.]+$/, ""); // Remove file extension
      const extension = fileName.slice(fileName.lastIndexOf("."));
      let count = 1;

      while (existingFiles.includes(fileKey)) {
        fileKey = `${folderPath}/${baseName}-${count}${extension}`;
        count++;
      }
    }

    // Generate pre-signed URL
    const params = {
      Bucket: "discord-clone-assets",
      Key: fileKey,
      ContentType: contentType,
      ...(type === "server-image" && { ACL: "public-read" }),
    };

    const command = new PutObjectCommand(params);
    const url = await getSignedUrl(s3, command, { expiresIn: 60 }); // URL valid for 60 seconds

    return new Response(JSON.stringify({ url }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Error generating pre-signed URL" }), {
      status: 500,
    });
  }
}
