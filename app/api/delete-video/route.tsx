// /pages/api/delete-upload.ts
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function DELETE(request: Request) {
  const { key } = await request.json();

  if (!key) return new Response(JSON.stringify({ error: "Missing key" }), { status: 400 });

  try {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: key,
      })
    );
    return new Response(JSON.stringify({ message: "Deleted" }), { status: 200 });
  } catch (err) {
    console.error("Error deleting object from S3:", err);
    return new Response(JSON.stringify({ error: "Failed to delete object" }), { status: 500 });
  }
}