"use client"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import FileUpload from "@/components/file-upload";

const formSchema = z.object({
    name: z.string().min(1, {
        message: "Server name is required."
    }),
    imageUrl: z.string().min(1, {
        message: "Server image is required."
    })
})

export default function InitialModal() {
    const [isMounted, setIsMounted] = useState(false);
    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const uploadFile = async () => {
        if (!file) {
            alert('Please select a file first.');
            return;
        }
    
        // Allowed image MIME types
        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
        // Validate the file type
        if (!allowedImageTypes.includes(file.type)) {
            alert('Only image files (JPEG, PNG, GIF, WEBP) are allowed.');
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
    
    
    useEffect(() => {
        setIsMounted(true);
    }, []);


    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            imageUrl: "",
        }
    });

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values) => {
        console.log(values)
    }

    if (!isMounted) {
        return null;
    }

    return (
        <Dialog open>
            <DialogContent className="bg-white text-black p-0 overflow-hidden">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center">
                        Customize Server
                    </DialogTitle>
                    <DialogDescription className="text-center text-zinc-500">
                        Give your server a personality with a name and an image.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="space-y-8 px-6">

                            <div className="flex items-center justify-center text-center">
                                <FormField control={form.control} name="imageUrl" render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <FileUpload />

                                        </FormControl>
                                    </FormItem>
                                )} />


                                 {/* <input type="file" onChange={handleFileChange} />
                                <button onClick={uploadFile}>Upload</button> */}

                            </div>

                            <FormField control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel
                                            className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                                            Server name
                                        </FormLabel>
                                        <FormControl>
                                            <Input disabled={isLoading} className="bg-zinc-300/50 bordeer- focus-visible:ring-0 text-black focus-visible:ring-offset-0" placeholder="Enter server name" {...field} />

                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                        </div>
                        <DialogFooter className={"bg-gray-100 px-6 py-4"}>
                            <Button variant="primary" disabled={isLoading}>
                                Create
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}