import { v4 as uuidv4 } from "uuid";
import { currentProfile } from "@/lib/current-profile";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { MemberRole } from "@prisma/client";

export async function POST(req) {
    try {
        const  {serverName, imageUrl}  = await req.json();
        const profile = await currentProfile();
        console.log("server body>>> ",serverName, ", ", imageUrl)

        if (!profile) {
            return NextResponse("Unauthorized", { status: 401 });
        }

        const server = await prisma.server.create({
            data: {
                profileId: profile.id,
                name: serverName,
                imageUrl,
                inviteCode: uuidv4(),
                channels: {
                    create: [
                        { name: "general", profileId: profile.id }
                    ]
                },
                members: {
                    create: [
                        { profileId: profile.id, role: MemberRole.ADMIN }
                    ]
                }
            }
        })

        return NextResponse.json(server);

    } catch (error) {
        console.log("[SERVERS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 })
    }
}