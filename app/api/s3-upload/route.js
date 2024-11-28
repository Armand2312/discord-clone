import { NextResponse } from "next/server"
import { S3, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3({
  region: process.env.NEXT_PUBLIC_AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_S3_SECRET_ACCESS_KEY_ID,
  }
});

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const fileName = searchParams.get('fileName');
  const contentType = searchParams.get('contentType');
  const type = searchParams.get('type'); // e.g., 'server-image' or 'chat-attachment'

  if (!fileName || !contentType || !type) {
    return new Response(JSON.stringify({ error: 'Missing parameters' }), {
      status: 400,
    });
  }

  // Prefix the file path based on the type
  const keyPrefix = type === 'server-image' ? 'server-images/' : 'chat-attachments/';
  const key = `${keyPrefix}${fileName}`;

  const params = {
    Bucket: 'discord-clone-assets',
    Key: key,
    ContentType: contentType,
  };

  try {
    const command = new PutObjectCommand(params);
    const url = await getSignedUrl(s3, command, { expiresIn: 60 }); // URL valid for 60 seconds
    return new Response(JSON.stringify({ url }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Error generating pre-signed URL' }), {
      status: 500,
    });
  }
}