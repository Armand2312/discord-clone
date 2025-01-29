"use client"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import FileUpload from "@/components/file-upload";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import Spinner from "../ui/spinner";
import { useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";

export default function CreateServerModal() {
    const [isLoading, setIsLoading] = useState(false);
    const [file, setFile] = useState(null);
    const [profile, setProfile] = useState(null);
    const { isOpen, onClose, type } = useModal();
    const isModalOpen = isOpen && type === "createServer";
    const router = useRouter();

    //Fetch user profile
    useEffect(() => {
        async function fetchProfile() {
            try {
                const response = await fetch("/api/profile");
                if (!response.ok) {
                    throw new Error("Response was not ok.")
                }
                const data = await response.json();
                setProfile(data.profile);

            } catch (error) {
                console.log(error);
            }
        }
        fetchProfile();
    }, []);

    function handleClose() {
        setFile(null);
        onClose();
    }

    //Initial form values
    const initialValues = {
        serverName: "",
    }

    // Form validation
    const validationSchema = Yup.object().shape({
        serverName: Yup.string().min(5, "Server name must be at least 5 characters").max(15, "Server name must be at most 15 characters").required("Enter a server name"),
    });

    // File upload
    const uploadFile = async () => {
        console.log("uploading")

        const userID = profile.id.split("-")[0];

        if (!file) {
            alert('Please select a file first.');
            return;
        }

        try {
            // Define the key prefix type (e.g., for server images)
            const type = 'server-image';

            // 1. Get pre-signed URL from the API route, including the file type
            const response = await fetch(
                `/api/s3-upload?fileName=${file.name}&userID=${userID}&contentType=${file.type}&type=${type}`
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
                return uploadResponse;
            }
            else {
                console.error('Upload failed:', uploadResponse);
                alert('Failed to upload file.');
                return;
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while uploading the file.');
        }
    };

    const submitForm = async (values) => {
        console.log(values.serverName)
        setIsLoading(true);
        try {
            const response = await uploadFile();
            console.log(response)
            if (!response) {
                console.log("no response from file upload")
                return;
            }
            if (response.ok) {

                const imageUrl = response.url.split("?")[0];
                console.log("image url >>>>", imageUrl);

                const body = {
                    serverName: values.serverName,
                    imageUrl: imageUrl,
                }

                console.log("body:", body)
                const serverResponse = await fetch("/api/servers", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(body)
                })
                console.log("server response >>", serverResponse);
                if (serverResponse.ok) {
                    alert("Server created.");
                    handleClose();
                    router.refresh();
                }
                else {
                    alert("An error occurred while creating server.")
                }
            }

        }
        catch (error) {
            console.error(error);
        }
        finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={handleClose}>
            <DialogContent className="bg-white text-black p-0 overflow-hidden">
                <header className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center">
                        Customize Server
                    </DialogTitle>
                    <DialogDescription className="text-center text-zinc-500">
                        Give your server a personality with a name and an image.
                    </DialogDescription>
                </header>
                <Formik initialValues={initialValues} onSubmit={submitForm} validationSchema={validationSchema}>
                    {({ errors, touched }) => (
                        <Form className="space-y-5 px-6 pb-4">

                            {/* Image Upload */}
                            <div>
                                <div className="flex items-center justify-center text-center">
                                    <FileUpload file={file} setFile={setFile} isLoading={isLoading} />
                                </div>
                            </div>


                            {/* Server Name */}
                            <div>
                                <label className="flex flex-col">Server Name
                                    <Field name="serverName" className="border border-gray-400 rounded-md p-1 dark:text-white" placeholder="Server Name"></Field>
                                </label>
                                <div className="text-red-600">
                                    <ErrorMessage name="serverName" />
                                </div>
                            </div>

                            {/* Submit */}
                            <button disabled={isLoading} type="submit" className={`${isLoading ? "bg-gray-800" : "bg-black"} flex hover:bg-gray-800 p-2 justify-center items-center text-white w-full h-[40px] rounded-md`}>
                                {isLoading ? (
                                    <Spinner />
                                ) : (
                                    <p>Create Server</p>
                                )}
                            </button>
                        </Form>
                    )}
                </Formik>
            </DialogContent>

        </Dialog >

    )
}