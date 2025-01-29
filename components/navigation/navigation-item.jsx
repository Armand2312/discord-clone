"use client"
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";


export default function NavigationItem({ id, imageUrl, name }) {
    const params = useParams();
    const router = useRouter();

    function onClick() {
        router.push(`/servers/${id}`);
    }

    return (
        <div>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button onClick={onClick} className="group relative flex items-center">
                            <div className={cn("absolute left-0 bg-primary rounded-r-full transtion-all w-[4px]",
                                params?.serverID !== id && "group-hover:h-[20px]",
                                params?.serverID === id ? "h-[36px]" : "h-[8px]"
                            )} />
                            <div className={cn("relative group flex mx-3 h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden",
                                params?.serverID === id && "bg-primary/10 text-primary rounded-[16px]"
                            )}> 
                            <Image layout="fill" objectFit="cover" className="h-full w-full" src={imageUrl} alt="Channel" />
                            </div>
                           
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side={"right"}>
                        <p>{name}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

        </div>
    )
}