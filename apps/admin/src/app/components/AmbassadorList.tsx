"use client";

import { useState } from "react";
import { Ambassador, User } from "@krain/db/schema";

interface AmbassadorWithUser extends Ambassador {
  user: User;
}

interface Props {
  ambassadors: AmbassadorWithUser[];
}

export function AmbassadorList({ ambassadors: initialAmbassadors }: Props) {
  const [ambassadors, setAmbassadors] = useState(initialAmbassadors);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateActiveMonths = (createdAt: Date, numberOfBadMonths: number) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - new Date(createdAt).getTime());
    const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));
    return Math.max(0, diffMonths - numberOfBadMonths);
  };

  const handleRemoveAmbassador = async (id: number) => {
    if (!confirm("Are you sure you want to remove this ambassador?")) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/ambassadors/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to remove ambassador");
      }

      setAmbassadors((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateBadMonths = async (id: number, newValue: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/ambassadors/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ numberOfBadMonths: newValue }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update ambassador");
      }

      setAmbassadors((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, numberOfBadMonths: newValue } : a
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="overflow-x-auto">
      {error && (
        <div className="mb-4 text-red-600 text-sm">{error}</div>
      )}

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Wallet Address
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Active Months
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Bad Months
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {ambassadors.map((ambassador) => (
            <tr key={ambassador.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {ambassador.user.username || ambassador.user.email || "N/A"}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">
                  {ambassador.walletAddress}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">
                  {calculateActiveMonths(
                    ambassador.createdAt,
                    ambassador.numberOfBadMonths
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="number"
                  min="0"
                  value={ambassador.numberOfBadMonths}
                  onChange={(e) =>
                    handleUpdateBadMonths(ambassador.id, parseInt(e.target.value))
                  }
                  className="w-20 px-2 py-1 border border-gray-300 rounded-md"
                  disabled={isLoading}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => handleRemoveAmbassador(ambassador.id)}
                  disabled={isLoading}
                  className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 