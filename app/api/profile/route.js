import { currentProfile } from "@/lib/current-profile";


export async function GET() {
    const profile = await currentProfile();

    return Response.json({ profile });

}