'use client';
import { getUserId } from "app/lib/supabaseBrowserClient";
import { useState } from "react";

export default function VideoUploadForm() {
    const [title, setTitle] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState("");
    const [progress, setProgress] = useState<number | null>(null);

    const createVideo = async (videoId: string, userId: string, title: string, duration: number) => {
        try {
            const response = await fetch("/api/create-video", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    videoId: videoId,
                    userId: userId,
                    title,
                    duration,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error creating video:", errorData);
                setStatus("Failed to create video. Please try again.");
                return false;
            }

            return true;
        } catch (error) {
            console.error("Error creating video:", error);
            return false;
        }
    }

    const handleUpload = async () => {
        const userId = await getUserId();

        if (!userId) {
            setStatus("User ID not found. Please log in again.");
            return;
        }

        if (!title || !file) {
            setStatus("Please enter a title and select a video file.");
            return;
        }

        try {
            const res = await fetch(`/api/upload-url`);
            const { uploadUrl, videoId, key } = await res.json();

            const xhr = new XMLHttpRequest();
            xhr.open("PUT", uploadUrl);

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percent = Math.round((event.loaded / event.total) * 100);
                    setProgress(percent);
                }
            };

            xhr.onload = async () => {
                if (xhr.status === 200) {
                    setStatus("Upload successful!");
                    console.log("Uploaded to S3 key:", key);

                    // Extract video duration using HTMLVideoElement
                    const videoElement = document.createElement("video");
                    videoElement.preload = "metadata";

                    videoElement.onloadedmetadata = async () => {
                        window.URL.revokeObjectURL(videoElement.src);
                        const duration = videoElement.duration;
                        const videoCreated = await createVideo(videoId, userId, title, duration);

                        if (videoCreated) {
                            setStatus("Video created successfully!");
                        } else {
                            // Attempt to delete uploaded file on failure
                            await fetch("/api/delete-video", {
                                method: "DELETE",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({ key }),
                            });
                            setStatus("Video creation failed. Upload was rolled back.");
                        }
                        setProgress(null);
                    };

                    videoElement.onerror = () => {
                        setStatus("Failed to read video metadata.");
                        setProgress(null);
                    };

                    videoElement.src = URL.createObjectURL(file);
                } else {
                    setStatus("Upload failed.");
                    console.error("Upload error:", xhr.responseText);
                    setProgress(null);
                }
            };

            xhr.onerror = () => {
                setStatus("An error occurred during upload.");
                setProgress(null);
            };

            xhr.setRequestHeader("Content-Type", file.type);
            xhr.send(file);
        } catch (err) {
            console.error(err);
            setStatus("An error occurred during upload.");
        }
    };
    return (
        <section className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-slate-700 mb-4">Upload a Video</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="video-title">
                        Video Title
                    </label>
                    <input
                        id="video-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter video title"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="video-file">
                        Video File
                    </label>
                    <input
                        id="video-file"
                        type="file"
                        accept="video/mp4"
                        onChange={(e) => {
                            if (e.target.files?.[0]) {
                                setFile(e.target.files[0]);
                            }
                        }}
                        className="block w-full text-gray-700"
                    />
                </div>
                <button
                    type="button"
                    onClick={handleUpload}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
                >
                    Upload Video
                </button>
                {progress !== null && (
                    <div className="w-full bg-gray-200 rounded-md h-4 mt-2">
                        <div
                            className="h-4 bg-indigo-600 rounded-md transition-all duration-200"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                )}
                {status && <p className="text-sm text-gray-600">{status}</p>}
            </div>
        </section>
    );
}