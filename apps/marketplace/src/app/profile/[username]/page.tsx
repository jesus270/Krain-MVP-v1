import { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@krain/db";
import { eq } from "drizzle-orm";
import { userTable, userProfileTable } from "@krain/db";
import { Button } from "@krain/ui/components/ui/button";
import { cookies } from "next/headers";
import Link from "next/link";
import { getUserReviews } from "@/app/actions/reviews";
import { UserReviews } from "../components/user-reviews";

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const username = resolvedParams.username;

  try {
    // Fetch user data
    const userData = await db.query.userTable.findFirst({
      where: eq(userTable.username, username),
      with: {
        profile: true,
      },
    });

    if (!userData) {
      return {
        title: "User Not Found",
      };
    }

    return {
      title: `${userData.profile?.displayName || userData.username} | Profile`,
      description:
        userData.profile?.bio || `${userData.username}'s profile on Krain`,
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "User Profile",
    };
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const resolvedParams = await params;
  const username = resolvedParams.username;

  // Get the current user ID from cookies
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  let currentUser = null;

  if (userId) {
    currentUser = await db.query.userTable.findFirst({
      where: eq(userTable.privyId, userId),
    });
  }

  // Fetch user data
  const userData = await db.query.userTable.findFirst({
    where: eq(userTable.username, username),
    with: {
      profile: true,
    },
  });

  if (!userData) {
    notFound();
  }

  // Check if this is the current user's profile
  const isOwnProfile = currentUser?.id === userData.id;

  // Fetch user's reviews
  const userReviews = await getUserReviews({ userId: userData.id });

  return (
    <div className="container mx-auto py-8">
      <div className="relative">
        {/* Banner */}
        <div className="h-48 w-full bg-gray-200 rounded-t-lg overflow-hidden">
          {userData.profile?.bannerPictureUrl && (
            <img
              src={userData.profile.bannerPictureUrl}
              alt={`${userData.username}'s banner`}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Profile picture */}
        <div className="absolute -bottom-16 left-8">
          <div className="h-32 w-32 rounded-full bg-gray-300 border-4 border-white overflow-hidden">
            {userData.profile?.profilePictureUrl ? (
              <img
                src={userData.profile.profilePictureUrl}
                alt={`${userData.username}'s profile picture`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-500">
                {userData.username?.[0]?.toUpperCase() || "?"}
              </div>
            )}
          </div>
        </div>

        {/* Edit button (only for own profile) */}
        {isOwnProfile && (
          <div className="absolute top-4 right-4">
            <Link href="/profile/edit">
              <Button variant="outline">Edit Profile</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Profile info */}
      <div className="mt-20 px-8">
        <h1 className="text-2xl font-bold">
          {userData.profile?.displayName || userData.username}
        </h1>
        <p className="text-gray-500">@{userData.username}</p>

        {userData.profile?.location && (
          <p className="text-gray-600 mt-2">📍 {userData.profile.location}</p>
        )}

        {userData.profile?.websiteUrl && (
          <a
            href={userData.profile.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline mt-1 block"
          >
            🔗 {userData.profile.websiteUrl.replace(/^https?:\/\//, "")}
          </a>
        )}

        {userData.profile?.bio && (
          <div className="mt-4 text-gray-800">
            <p>{userData.profile.bio}</p>
          </div>
        )}

        {/* User Reviews Section */}
        <div className="mt-10">
          <UserReviews reviews={userReviews} />
        </div>
      </div>
    </div>
  );
}
