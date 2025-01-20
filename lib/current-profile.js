import { currentUser } from "@clerk/nextjs/server";
import prisma  from "./db";

export const currentProfile = async () => {
    const user = await currentUser();

    const profile = await prisma.profile.findUnique({
        where: {
            userId: user.id
        }
    })

    if (!profile) {
        return null;
    }

    return profile;
}