"use client";

import { DropZoneIcon } from "@/public/Icons";
import Image from "next/image";
import { useState } from "react";

export default function FileUpload() {
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleFileChange = (e) => {
        if (!e || !e.target.files[0]) {
            setFile(null);
            setPreviewUrl(null);
            return;
        }
    
        const selectedFile = e.target.files[0];
        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/svg+xml']; // Allowed MIME types
    
        // Validate file type
        if (!allowedImageTypes.includes(selectedFile.type)) {
            alert('Only JPG, PNG, or SVG files are allowed.');
            setFile(null);
            setPreviewUrl(null);
            return;
        }
    
        // Set the selected file and generate a preview URL
        setFile(selectedFile);
        const objectUrl = URL.createObjectURL(selectedFile);
        setPreviewUrl(objectUrl);
    };
    
    /* const fileType = value?.split(".").pop();

    if (fileType == "png" || "jpg" || "gif") {
        return (
            <div className="relative h-20 w-20">
                <Image />

            </div>
        )
    } */

    const uploadFile = async () => {
        if (!file) {
            alert('Please select a file first.');
            return;
        }

        // Allowed image MIME types
        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

        // Validate the file type
        if (!allowedImageTypes.includes(file.type)) {
            alert('Only image files (JPEG, PNG, GIF) are allowed.');
            return;
        }

        try {
            // Define the key prefix type (e.g., for server images)
            const type = 'server-image';

            // 1. Get pre-signed URL from the API route, including the file type
            const response = await fetch(
                `/api/s3-upload?fileName=${file.name}&contentType=${file.type}&type=${type}`
            );

            if (!response.ok) {
                throw new Error('Failed to get pre-signed URL');
            }

            const { url } = await response.json();

            // 2. Upload file to S3 using the pre-signed URL
            const uploadResponse = await fetch(url, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type
                }
            });

            if (uploadResponse.ok) {
                alert('File uploaded successfully!');
            } else {
                console.error('Upload failed:', uploadResponse);
                alert('Failed to upload file.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while uploading the file.');
        }
    };

    if (!file) {
        return (

            <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <DropZoneIcon sizes={130} />
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">Click to upload </span>
                            or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG or GIF</p>
                    </div>
                    <input id="dropzone-file" type="file" onChange={handleFileChange} className="hidden" />
                </label>
            </div>

        )
    } else {
        return (
            <div className="flex flex-col items-center justify-center">
                {/* Display preview image */}
                <div className="relative w-40 h-40">
                    <Image src={previewUrl} className="rounded-full" alt="Preview" fill style={{ objectFit: 'cover' }} />
                </div>
                <div className="flex gap-2">
                    <button onClick={() => handleFileChange(null)} className="px-4 py-2 mt-4 text-white rounded-lg bg-red-600">
                        Remove
                    </button>
                    <button onClick={uploadFile} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg">
                        Upload Image
                    </button>
                </div>

            </div>

        );
    }

}