import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";


export default function Home() {
  return (
    <div className="flex">
      <UserButton/>
      <ModeToggle />
    </div>
  );
}
