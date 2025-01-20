import { currentUser } from "@clerk/nextjs/server";
import { RedirectToSignIn } from "@clerk/nextjs";
import prisma  from "./db";

export const initialProfile = async () => {
    const user = await currentUser();

    if (!user) {
        return <RedirectToSignIn />;
    }

    const profile = await prisma.profile.findUnique({
        where: {
            userId: user.id
        }
    })

    if (profile) {
       // console.log(profile);
        return profile;
    }

    const newProfile = await prisma.profile.create({
        data: {
            userId: user.id,
            name: `${user.firstName} ${user.lastName}`,
            imageUrl: user.imageUrl,
            email: user.emailAddresses[0].emailAddress
        }
    })

    return newProfile;
}