// app/api/signed-url/delete/route.ts
import { S3Client, ListObjectsV2Command, CopyObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const videoId = searchParams.get("videoId");

        if (!videoId) {
            return NextResponse.json({ error: "Missing videoId" }, { status: 400 });
        }

        const bucket = process.env.AWS_S3_BUCKET_NAME!;
        const prefix = `user-videos/${videoId}/`;

        const listedObjects = await s3.send(
            new ListObjectsV2Command({
                Bucket: bucket,
                Prefix: prefix,
            })
        );

        if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
            return NextResponse.json({ message: "No objects found to delete" });
        }

        // Build list of keys to delete
        const objectsToDelete = listedObjects.Contents.map((obj) => ({ Key: obj.Key! }));

        // Move objects to trash
        for (const obj of objectsToDelete) {
            const originalKey = obj.Key!;
            const trashKey = originalKey.replace(`user-videos/${videoId}/`, `trash/${videoId}/`);

            // Copy to trash
            await s3.send(
                new CopyObjectCommand({
                    Bucket: bucket,
                    CopySource: `${bucket}/${originalKey}`,
                    Key: trashKey,
                })
            );

            // Delete original
            await s3.send(
                new DeleteObjectCommand({
                    Bucket: bucket,
                    Key: originalKey,
                })
            );
        }

        return NextResponse.json({
            message: `Moved all objects under ${prefix} to trash`,
            moved: objectsToDelete.map((o) => o.Key),
        });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}