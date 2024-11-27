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
  
    if (!fileName || !contentType) {
      return new Response(JSON.stringify({ error: 'Missing parameters' }), {
        status: 400
      });
    }
  
    const params = {
      Bucket: 'discord-clone-assets',
      Key: fileName,
      ContentType: contentType
    };
  
    try {
      // Use the PutObjectCommand and getSignedUrl
      const command = new PutObjectCommand(params);
      const url = await getSignedUrl(s3, command, { expiresIn: 60 }); // Expiry time in seconds
      return new Response(JSON.stringify({ url }), { status: 200 });
    } catch (err) {
      console.error(err);
      return new Response(JSON.stringify({ error: 'Error generating pre-signed URL' }), {
        status: 500
      });
    }
  }