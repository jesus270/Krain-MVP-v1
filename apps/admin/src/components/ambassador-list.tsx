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
  
  // Add local state for editing created date per ambassador
  const [editingCreatedAt, setEditingCreatedAt] = useState<Record<number, string>>({});
  const [savingCreatedAt, setSavingCreatedAt] = useState<Record<number, boolean>>({});

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
    const initialBadMonths: Record<number, number> = {};
    const initialCreatedAt: Record<number, string> = {};
    ambassadors.forEach((amb) => {
      // amb.id is a serial primary key, so it's always a number
      const ambassadorId = amb.id as number;
      initialBadMonths[ambassadorId] = amb.numberOfBadMonths;
      // Convert Date to YYYY-MM-DD format for date input
      const createdAtValue = amb.createdAt || new Date();
      const date = new Date(createdAtValue);
      initialCreatedAt[ambassadorId] = date.toISOString().split('T')[0] || "";
    });
    setEditingBadMonths(initialBadMonths);
    setEditingCreatedAt(initialCreatedAt);
  }, [ambassadors]);

  const handleBadMonthsInput = (id: number, value: number | string) => {
    const parsed = Number(value);
    setEditingBadMonths((prev) => ({ ...prev, [id]: isNaN(parsed) ? 0 : parsed }));
  };

  const handleCreatedAtInput = (id: number, value: string) => {
    setEditingCreatedAt((prev) => ({ ...prev, [id]: value || "" }));
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
      await fetchAmbassadors();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSavingBadMonths((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleSaveCreatedAt = async (id: number) => {
    const newValue = editingCreatedAt[id];
    if (!newValue) {
      setError("Created date is required");
      return;
    }
    
    const newDate = new Date(newValue);
    const badMonths = editingBadMonths[id] ?? 0;
    const activeMonths = calculateActiveMonths(newDate.toString(), badMonths);
    if (activeMonths < 0) {
      setError("Bad months cannot be greater than the total months since the created date");
      return;
    }
    
    setSavingCreatedAt((prev) => ({ ...prev, [id]: true }));
    setError(null);
    try {
      const response = await fetch(`/api/admin/ambassadors?id=${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ createdAt: newDate.toISOString() }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update ambassador");
      }
      await fetchAmbassadors();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSavingCreatedAt((prev) => ({ ...prev, [id]: false }));
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card rounded-lg shadow-lg p-6 w-full max-w-sm border">
            <h3 className="text-lg text-destructive font-semibold mb-4">Remove Ambassador</h3>
            <p className="mb-6 text-card-foreground">Are you sure you want to remove this ambassador?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={cancelRemoveAmbassador}
                className="px-4 py-2 rounded border border-border text-foreground hover:bg-accent"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveAmbassador}
                className="px-4 py-2 rounded border border-destructive text-destructive hover:bg-destructive/10 disabled:opacity-50"
                disabled={isLoading}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="w-fit max-w-full overflow-x-auto bg-card rounded-lg shadow p-6 border">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-4">
          <h2 className="text-xl font-semibold text-card-foreground">Ambassador List</h2>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by wallet address"
            className="w-64 px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
          />
        </div>
        {error && (
          <div className="mb-4 text-destructive text-sm">{error}</div>
        )}
        <table className="min-w-full divide-y divide-border relative border border-border">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider border-r border-border">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-lg border-r border-border">
                Wallet Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider border-r border-border">
                Created Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider border-r border-border">
                Active Months
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider border-r border-border">
                Bad Months
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          {isLoading ? (
            <tbody className="bg-card divide-y divide-border">
              <tr><td colSpan={6} className="text-center text-xl py-8 text-muted-foreground border-r border-border">Loading...</td></tr>
            </tbody>
          ) : (
            <tbody className="bg-card divide-y divide-border">
              {ambassadors.map((ambassador) => {
                const ambassadorId = ambassador.id as number;
                return (
                <tr key={ambassadorId}>
                <td className="px-6 py-4 whitespace-nowrap border-r border-border">
                  <div className="text-sm font-medium text-card-foreground">
                    {ambassador.user?.username || ambassador.user?.email || "N/A"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap border-r border-border">
                  <div className="text-sm text-muted-foreground">
                    {ambassador.walletAddress}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap border-r border-border">
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={editingCreatedAt[ambassadorId] || ""}
                      onChange={(e) =>
                        handleCreatedAtInput(ambassadorId, e.target.value)
                      }
                      className="w-32 px-2 py-1 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                      disabled={isLoading || savingCreatedAt[ambassadorId]}
                    />
                    <button
                      onClick={() => handleSaveCreatedAt(ambassadorId)}
                      disabled={isLoading || savingCreatedAt[ambassadorId] || (editingCreatedAt[ambassadorId] === (new Date(ambassador.createdAt || new Date()).toISOString().split('T')[0] || ""))}
                      className="text-blue-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer text-xs"
                    >
                      {savingCreatedAt[ambassadorId] ? "..." : "Save"}
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap border-r border-border">
                  <div className="text-sm text-muted-foreground">
                    {calculateActiveMonths(
                      typeof ambassador.createdAt === 'string' ? ambassador.createdAt : ambassador.createdAt?.toString(),
                      ambassador.numberOfBadMonths
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap border-r border-border">
                  <input
                    type="number"
                    min="0"
                    value={editingBadMonths[ambassadorId] ?? ambassador.numberOfBadMonths}
                    onChange={(e) =>
                      handleBadMonthsInput(ambassadorId, e.target.value)
                    }
                    className="w-20 px-2 py-1 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    disabled={isLoading || savingBadMonths[ambassadorId]}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2 justify-center items-center mt-2">
                  <button
                    onClick={() => handleRemoveAmbassador(ambassadorId)}
                    disabled={isLoading}
                    className="text-destructive hover:text-destructive/80 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
                  >
                    Remove
                  </button>
                  <button
                    onClick={() => handleSaveBadMonths(ambassadorId, ambassador.createdAt)}
                    disabled={isLoading || savingBadMonths[ambassadorId] || (editingBadMonths[ambassadorId] === ambassador.numberOfBadMonths)}
                    className="text-green-400 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
                  >
                    {savingBadMonths[ambassadorId] ? "Saving..." : "Save"}
                  </button>
                </td>
              </tr>
              )})}
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
              className="px-3 py-1 border border-border rounded text-foreground disabled:opacity-50 hover:bg-accent"
            >
              Previous
            </button>
            <span className="text-sm text-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-border rounded text-foreground disabled:opacity-50 hover:bg-accent"
            >
              Next
            </button>
          </div>
          {/* Items per page (right) */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground">Items per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-2 py-1 border border-border rounded text-foreground bg-background"
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