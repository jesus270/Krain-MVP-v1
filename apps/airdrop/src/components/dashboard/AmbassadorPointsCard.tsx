"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";

interface AmbassadorInfo {
  isAmbassador: boolean;
  createdAt: string;
  numberOfBadMonths: number;
}

export function AmbassadorPointsCard() {
  const [ambassadorInfo, setAmbassadorInfo] = useState<AmbassadorInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = usePrivy();

  useEffect(() => {
    const fetchAmbassadorInfo = async () => {
      try {
        const response = await fetch("/api/user/ambassador-info");
        if (response.ok) {
          const data = await response.json();
          setAmbassadorInfo(data);
        }
      } catch (error) {
        console.error("Error fetching ambassador info:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchAmbassadorInfo();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!ambassadorInfo?.isAmbassador) {
    return null;
  }

  const calculateActiveMonths = (createdAt: string, numberOfBadMonths: number) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - new Date(createdAt).getTime());
    const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));
    return Math.max(0, diffMonths - numberOfBadMonths);
  };

  const activeMonths = calculateActiveMonths(
    ambassadorInfo.createdAt,
    ambassadorInfo.numberOfBadMonths
  );
  const points = activeMonths * 100_000;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Ambassador Points
        </h3>
        <span className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
          Ambassador
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Active Months:</span>
          <span className="font-medium">{activeMonths}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Points per Month:</span>
          <span className="font-medium">100,000</span>
        </div>
        <div className="flex justify-between text-base font-semibold pt-2 border-t">
          <span>Total Points:</span>
          <span>{points.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
} 