"use client";

import { getFavoritedAgents } from "../actions/favorites";
import { AgentCard } from "../components/agent-card";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";
import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { AIAgent } from "../types";
import { toast } from "sonner";

export default function FavoritesPage() {
  const { authenticated, user, login } = usePrivy();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFavorites() {
      if (!authenticated || !user?.id) {
        setLoading(false);
        return;
      }

      try {
        setError(null);
        const results = await getFavoritedAgents(user.id);
        setFavorites(results);
      } catch (error) {
        console.error("Error loading favorites:", error);
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        if (errorMessage.includes("User not found")) {
          setError(
            "Your profile is not synchronized. Please sign out and sign in again.",
          );
          toast.error("Profile not synchronized", {
            description: "Please sign out and sign in again",
          });
        } else {
          setError("Failed to load favorites. Please try again later.");
          toast.error("Failed to load favorites", {
            description: "Please try again later",
          });
        }
      } finally {
        setLoading(false);
      }
    }

    loadFavorites();
  }, [authenticated, user?.id]);

  // Prompt login if not authenticated
  if (!authenticated && !loading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Toaster />
        <h1 className="text-3xl font-bold mb-8">Your Favorites</h1>
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground mb-4">
            Please log in to view your favorites
          </p>
          <button
            onClick={() => login()}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Toaster />
        <h1 className="text-3xl font-bold mb-8">Your Favorites</h1>
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">
            Loading your favorites...
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Toaster />
        <h1 className="text-3xl font-bold mb-8">Your Favorites</h1>
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground mb-4">
            Error loading favorites
          </p>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 mr-4"
          >
            Try Again
          </button>
          <button
            onClick={() => login()}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Sign Out & Sign In Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Toaster />
      <h1 className="text-3xl font-bold mb-8">Your Favorites</h1>

      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground mb-4">
            You haven't favorited any agents yet.
          </p>
          <p className="text-muted-foreground">
            Browse the AI Agent Portal and click the star icon to add agents to
            your favorites.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {favorites.map((favorite) => {
            if (!favorite.agent) return null;

            // Convert DB agent to AIAgent type
            const agent: AIAgent = {
              id: favorite.agent.id.toString(),
              name: favorite.agent.name,
              rating: favorite.agent.rating || 0,
              reviewsCount: favorite.agent.reviewsCount || 0,
              category: favorite.agent.category || "Unknown",
              tags: favorite.agent.tags || [],
              description: favorite.agent.description || "",
              imageUrl: favorite.agent.imageUrl || undefined,
              blockchainsSupported: favorite.agent.blockchainsSupported || [],
              websiteUrl: favorite.agent.websiteUrl || "",
              supportEmail: favorite.agent.supportEmail || "",
              companyName: favorite.agent.companyName || "",
              pricing: favorite.agent.pricing || [],
              industryFocus: favorite.agent.industryFocus || [],
              socialMedia: favorite.agent.socialMedia || {},
            };

            return (
              <AgentCard
                key={favorite.agent.id}
                agent={agent}
                onFilter={() => {}}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
