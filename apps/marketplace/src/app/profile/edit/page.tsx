import { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ProfileEditForm } from "../components/profile-edit-form";
import { db } from "@krain/db";
import { userTable } from "@krain/db";
import { eq } from "drizzle-orm";

export const metadata: Metadata = {
  title: "Edit Profile | Krain",
  description: "Edit your profile information",
};

export default async function EditProfilePage() {
  // Get the current user ID from cookies
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;

  // If no user ID in cookie, redirect to homepage
  if (!userId) {
    redirect("/");
  }

  // Fetch user data with profile
  const userData = await db.query.userTable.findFirst({
    where: eq(userTable.privyId, userId),
    with: {
      profile: true,
    },
  });

  if (!userData) {
    redirect("/");
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
        <ProfileEditForm user={userData} />
      </div>
    </div>
  );
}
