"use client";

import { useState } from "react";
import {
  importPrivyUserById,
  importAllPrivyUsers,
} from "../../actions/import-privy-users";
import { usePrivy } from "@privy-io/react-auth";

export default function PrivyImportPage() {
  const { user, authenticated } = usePrivy();
  const [userId, setUserId] = useState("");
  const [createdAfter, setCreatedAfter] = useState("");
  const [batchSize, setBatchSize] = useState("100");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImportUser = async () => {
    if (!authenticated || !user?.id) {
      setError("You must be logged in to use this feature");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const result = await importPrivyUserById({
        userId: user.id,
        privyUserId: userId,
      });
      setResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleImportAll = async () => {
    if (!authenticated || !user?.id) {
      setError("You must be logged in to use this feature");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const timestamp = createdAfter
        ? Math.floor(new Date(createdAfter).getTime() / 1000)
        : undefined;
      const result = await importAllPrivyUsers({
        userId: user.id,
        createdAfter: timestamp,
        batchSize: parseInt(batchSize, 10),
      });
      setResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Privy User Import</h1>

      {!authenticated && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
          <p>
            You must be logged in with admin privileges to use this feature.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Import Single User</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Privy User ID
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter Privy User ID"
            />
          </div>
          <button
            onClick={handleImportUser}
            disabled={loading || !userId || !authenticated}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Importing..." : "Import User"}
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Import All Users</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Created After (optional)
            </label>
            <input
              type="datetime-local"
              value={createdAfter}
              onChange={(e) => setCreatedAfter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <p className="text-xs text-gray-500 mt-1">
              Only import users created after this date/time
            </p>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Batch Size
            </label>
            <input
              type="number"
              value={batchSize}
              onChange={(e) => setBatchSize(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              min="10"
              max="500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Number of users to process in each batch (10-500)
            </p>
          </div>
          <button
            onClick={handleImportAll}
            disabled={loading || !authenticated}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Importing..." : "Import All Users"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Import Results</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
