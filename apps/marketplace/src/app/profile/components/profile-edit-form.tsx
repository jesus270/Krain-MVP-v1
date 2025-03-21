"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { updateProfile } from "../actions/update-profile";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@krain/ui/components/ui/form";
import { Input } from "@krain/ui/components/ui/input";
import { Textarea } from "@krain/ui/components/ui/textarea";
import { Button } from "@krain/ui/components/ui/button";
import { toast } from "sonner";

// Form validation schema
const profileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be less than 50 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    ),
  displayName: z
    .string()
    .max(100, "Display name must be less than 100 characters")
    .optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  location: z
    .string()
    .max(100, "Location must be less than 100 characters")
    .optional(),
  websiteUrl: z
    .string()
    .url("Please enter a valid URL")
    .max(255, "Website URL must be less than 255 characters")
    .optional()
    .or(z.literal("")),
  profilePictureUrl: z
    .string()
    .url("Please enter a valid URL")
    .max(1024)
    .optional()
    .or(z.literal("")),
  bannerPictureUrl: z
    .string()
    .url("Please enter a valid URL")
    .max(1024)
    .optional()
    .or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileEditFormProps {
  user: any; // User data with profile
}

export function ProfileEditForm({ user }: ProfileEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Initialize form with user data
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user.username || "",
      displayName: user.profile?.displayName || "",
      bio: user.profile?.bio || "",
      location: user.profile?.location || "",
      websiteUrl: user.profile?.websiteUrl || "",
      profilePictureUrl: user.profile?.profilePictureUrl || "",
      bannerPictureUrl: user.profile?.bannerPictureUrl || "",
    },
  });

  // Handle form submission
  async function onSubmit(data: ProfileFormValues) {
    setIsSubmitting(true);

    try {
      const result = await updateProfile(data);

      if (result.success) {
        toast.success("Profile updated successfully!");

        // Redirect to profile page if username was set or updated
        if (data.username) {
          router.push(`/profile/${data.username}`);
        } else {
          // Refresh the page to show updated data
          router.refresh();
        }
      } else if (result.error) {
        toast.error(result.error || "Failed to update profile");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username *</FormLabel>
              <FormControl>
                <Input placeholder="username" {...field} />
              </FormControl>
              <FormDescription>
                This is your unique username on the platform.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name</FormLabel>
              <FormControl>
                <Input placeholder="Your Name" {...field} />
              </FormControl>
              <FormDescription>
                This is how your name will be displayed to others.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about yourself"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                A brief description about yourself.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="City, Country" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="websiteUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="profilePictureUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Picture URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://example.com/profile.jpg"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                URL to your profile picture. Consider using a service like Imgur
                or Cloudinary.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bannerPictureUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Banner Image URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://example.com/banner.jpg"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                URL to your banner image. Recommended size: 1500x500px.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Profile"}
        </Button>
      </form>
    </Form>
  );
}
