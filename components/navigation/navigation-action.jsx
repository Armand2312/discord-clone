"use client";
import { Plus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { useModal } from "@/hooks/use-modal-store";

export default function NavigationAction() {
    const {onOpen} = useModal();
    return (
        <div>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button onClick={() => onOpen("createServer")} className="group">
                            <div className="flex mx-3 h-[48px] w-[48px] rounded-[48px] group-hover:rounded-[16px] transition-all overflow-hidden items-center justify-center bg-background dark:bg-neutral-700 group-hover:bg-emerald-500">
                                <Plus className="group-hover:text-white transition text-emerald-500" size={25} />
                            </div>
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side={"right"}>
                        <p>Add a server</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

        </div>
    )
}