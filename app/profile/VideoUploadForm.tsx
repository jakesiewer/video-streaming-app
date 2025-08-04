'use client';
import { getUserId } from "app/lib/supabase/client/supabaseBrowserClient";
import { useState } from "react";

export default function VideoUploadForm() {
    const [title, setTitle] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState("");
    const [progress, setProgress] = useState<number | null>(null);
    const [duration, setDuration] = useState<number>(0);

    const createVideo = async (userId: string, title: string, duration: number) => {
        try {
            const response = await fetch("/api/video", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
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

            const { videoId } = await response.json();
            return videoId;
        } catch (error) {
            console.error("Error creating video:", error);
            return false;
        }
    }

    const deleteVideo = async (videoId: string) => {
        try {
            const response = await fetch("/api/video", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    videoId: videoId,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error deleting video:", errorData);
                return false;
            }


        } catch (error) {
            console.error("Error deleting video:", error);
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

        const videoId = await createVideo(userId, title, duration);

        try {
            const res = await fetch(`/api/signed-url/upload?videoId=${videoId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const { uploadUrl, key } = await res.json();

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

                    // Video creation is already handled in the onloadedmetadata callback
                    setProgress(null);
                    window.location.reload();
                } else {
                    setStatus("Upload failed.");
                    deleteVideo(videoId)
                        .then((success) => {
                            if (!success) {
                                console.error("Failed to delete video after upload failure.");
                            } else {
                                console.log("Video deleted successfully after upload failure.");
                            }
                        });
                    console.error("Upload error:", xhr.responseText);
                    setProgress(null);
                }
            };
            xhr.onerror = () => {
                setStatus("An error occurred during upload.");
                setProgress(null);
            }
            xhr.setRequestHeader("Content-Type", file.type);
            xhr.send(file);
        } catch (err) {
            console.error(err);
            setStatus("An error occurred during upload.");
        }
    }
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
                                const videoEl = document.createElement("video");
                                videoEl.preload = "metadata";
                                videoEl.onloadedmetadata = () => {
                                    window.URL.revokeObjectURL(videoEl.src);
                                    setDuration(Math.round(videoEl.duration));
                                };
                                videoEl.src = URL.createObjectURL(e.target.files[0]);
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