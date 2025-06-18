"use client";

import { useState } from "react";
import { calculateActiveMonths } from "@krain/utils";

interface AddAmbassadorFormProps {
  onAdded?: () => void;
}

export function AddAmbassadorForm({ onAdded }: AddAmbassadorFormProps) {
  const [walletAddress, setWalletAddress] = useState("");
  const [userId, setUserId] = useState("");
  const [numberOfBadMonths, setNumberOfBadMonths] = useState(0);
  const [createdAt, setCreatedAt] = useState(() => {
    // Set default to current date in YYYY-MM-DD format
    const now = new Date();
    return now.toISOString().split('T')[0];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Create Date object for validation
    if (!createdAt) {
      setError("Created date is required");
      return;
    }
    const createdAtDate = new Date(createdAt);
    
    // Validate the bad months against the provided createdAt date
    if (calculateActiveMonths(createdAtDate.toString(), numberOfBadMonths) < 0) {
      setError("Bad months cannot be greater than the total months since the created date");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/ambassadors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress,
          userId: userId ? Number(userId) : undefined,
          numberOfBadMonths: Number(numberOfBadMonths),
          createdAt: createdAtDate.toISOString(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to add ambassador");
      }

      setWalletAddress("");
      setUserId("");
      setNumberOfBadMonths(0);
      // Reset to current date
      const now = new Date();
      setCreatedAt(now.toISOString().split('T')[0]);
      if (onAdded) onAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md w-full bg-card rounded-lg shadow p-6 mb-8 border">
      <h2 className="text-xl font-semibold mb-4 text-card-foreground">Add Ambassador</h2>
      <div className="mb-4">
        <label
          htmlFor="walletAddress"
          className="block text-sm font-medium text-card-foreground mb-1"
        >
          Wallet Address
        </label>
        <input
          type="text"
          id="walletAddress"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
          placeholder="Enter wallet address"
          required
        />
      </div>
      <div className="mb-4">
        <label
          htmlFor="userId"
          className="block text-sm font-medium text-card-foreground mb-1"
        >
          User ID (optional)
        </label>
        <input
          type="number"
          id="userId"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
          placeholder="Enter user ID (optional)"
        />
      </div>
      <div className="mb-4">
        <label
          htmlFor="createdAt"
          className="block text-sm font-medium text-card-foreground mb-1"
        >
          Created Date
        </label>
        <input
          type="date"
          id="createdAt"
          value={createdAt}
          onChange={(e) => setCreatedAt(e.target.value)}
          className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
          required
        />
      </div>
      <div className="mb-4">
        <label
          htmlFor="numberOfBadMonths"
          className="block text-sm font-medium text-card-foreground mb-1"
        >
          Number of Bad Months
        </label>
        <input
          type="number"
          id="numberOfBadMonths"
          min={0}
          value={numberOfBadMonths}
          onChange={(e) => setNumberOfBadMonths(Number(e.target.value))}
          className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
          placeholder="0"
        />
      </div>
      {error && (
        <div className="mb-4 text-destructive text-sm">{error}</div>
      )}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Adding..." : "Add Ambassador"}
      </button>
    </form>
  );
} 