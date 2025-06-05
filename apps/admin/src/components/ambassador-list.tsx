"use client";

import { useEffect, useState, useMemo, Fragment } from "react";
import { Ambassador, User } from "@krain/db";
import { calculateActiveMonths } from "@krain/utils";

interface AmbassadorWithUser extends Ambassador {
  user: User;
}

interface AmbassadorListProps {
  refreshKey?: number;
}

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export function AmbassadorList({ refreshKey }: AmbassadorListProps) {
  const [ambassadors, setAmbassadors] = useState<AmbassadorWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 1000);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);

  // Add local state for editing bad months per ambassador
  const [editingBadMonths, setEditingBadMonths] = useState<Record<number, number>>({});
  const [savingBadMonths, setSavingBadMonths] = useState<Record<number, boolean>>({});

  // Modal state
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [removeAmbassadorId, setRemoveAmbassadorId] = useState<number | null>(null);

  const fetchAmbassadors = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(itemsPerPage),
        search: debouncedSearch,
      });
      const res = await fetch(`/api/admin/ambassadors?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch ambassadors");
      const { data, total } = await res.json();
      setAmbassadors(data);
      setTotalItems(total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAmbassadors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage, debouncedSearch, refreshKey]);

  // Update local editing state when ambassadors change
  useEffect(() => {
    const initial: Record<number, number> = {};
    ambassadors.forEach((amb) => {
      initial[amb.id] = amb.numberOfBadMonths;
    });
    setEditingBadMonths(initial);
  }, [ambassadors]);

  const handleBadMonthsInput = (id: number, value: number | string) => {
    const parsed = Number(value);
    setEditingBadMonths((prev) => ({ ...prev, [id]: isNaN(parsed) ? 0 : parsed }));
  };

  const handleSaveBadMonths = async (id: number, createdAt: Date) => {
    const newValue = editingBadMonths[id] ?? 0;
    const activeMonths = calculateActiveMonths(createdAt.toString(), newValue);
    if (activeMonths < 0) {
      setError("Bad months cannot be greater than the total months");
      return;
    }
    setSavingBadMonths((prev) => ({ ...prev, [id]: true }));
    setError(null);
    try {
      const response = await fetch(`/api/admin/ambassadors?id=${id}`, {
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
      // await fetchAmbassadors();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSavingBadMonths((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleRemoveAmbassador = async (id: number) => {
    setRemoveModalOpen(true);
    setRemoveAmbassadorId(id);
  };

  const confirmRemoveAmbassador = async () => {
    if (!removeAmbassadorId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/ambassadors?id=${removeAmbassadorId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to remove ambassador");
      }
      await fetchAmbassadors();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
      setRemoveModalOpen(false);
      setRemoveAmbassadorId(null);
    }
  };

  const cancelRemoveAmbassador = () => {
    setRemoveModalOpen(false);
    setRemoveAmbassadorId(null);
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const itemsPerPageOptions = [5, 10, 20];

  return (
    <Fragment>
      {/* Remove Confirmation Modal */}
      {removeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg text-red-500 font-semibold mb-4">Remove Ambassador</h3>
            <p className="mb-6 text-gray-800">Are you sure you want to remove this ambassador?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={cancelRemoveAmbassador}
                className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveAmbassador}
                className="px-4 py-2 rounded border border-red-600 text-red-600 hover:bg-red-50 disabled:opacity-50"
                disabled={isLoading}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="overflow-x-auto bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Ambassador List</h2>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by wallet address"
            className="w-64 px-3 py-2 border border-gray-300 text-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        {error && (
          <div className="mb-4 text-red-600 text-sm">{error}</div>
        )}
        <table className="min-w-full divide-y divide-gray-200 relative">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-lg">
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
          {isLoading ? (
            <tbody className="bg-white divide-y divide-gray-200">
              <tr><td colSpan={5} className="text-center text-xl py-8 text-gray-500">Loading...</td></tr>
            </tbody>
          ) : (
            <tbody className="bg-white divide-y divide-gray-200">
              {ambassadors.map((ambassador) => (
                <tr key={ambassador.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {ambassador.user?.username || ambassador.user?.email || "N/A"}
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
                      typeof ambassador.createdAt === 'string' ? ambassador.createdAt : ambassador.createdAt?.toString(),
                      ambassador.numberOfBadMonths
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    min="0"
                    value={editingBadMonths[ambassador.id] ?? ambassador.numberOfBadMonths}
                    onChange={(e) =>
                      handleBadMonthsInput(ambassador.id, e.target.value)
                    }
                    className="w-20 px-2 py-1 border border-gray-300 text-gray-500 rounded-md"
                    disabled={isLoading || savingBadMonths[ambassador.id]}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2 justify-center items-center mt-2">
                  <button
                    onClick={() => handleRemoveAmbassador(ambassador.id)}
                    disabled={isLoading}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Remove
                  </button>
                  <button
                    onClick={() => handleSaveBadMonths(ambassador.id, ambassador.createdAt)}
                    disabled={isLoading || savingBadMonths[ambassador.id] || (editingBadMonths[ambassador.id] === ambassador.numberOfBadMonths)}
                    className="text-blue-600 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingBadMonths[ambassador.id] ? "Saving..." : "Save"}
                  </button>
                </td>
              </tr>
            ))}
            </tbody>
          )}
        </table>
        {/* Pagination Bar */}
        <div className="flex items-center justify-between mt-10">
          {/* Page navigation (left) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded text-gray-700 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded text-gray-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          {/* Items per page (right) */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Items per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-2 py-1 border rounded text-gray-700"
            >
              {itemsPerPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </Fragment>
  );
} 