import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  Star,
  Building2,
  SlidersHorizontal,
  X,
  Images,
} from "lucide-react";
import { toast } from "sonner";
import api from "../lib/api";
import { formatPrice, formatDate } from "../lib/format";
import PageHeader from "../components/ui/PageHeader";
import { StatusBadge } from "../components/ui/Badge";
import { SkeletonTable } from "../components/ui/Skeleton";
import Modal from "../components/ui/Modal";
import AdminSelect from "../components/ui/Select";
import ImagesModal from "../components/ui/ImagesModal";

interface Property {
  _id: string;
  title: string;
  slug: string;
  price: number;
  status: string;
  listingType: string;
  type: string;
  location: { city: string; state: string };
  owner: { name: string; email: string };
  views: number;
  isFeatured: boolean;
  createdAt: string;
}

const LISTING_TYPES = ["sale", "rent", "lease", "pg"];

const TYPE_CHIP_COLORS: Record<string, string> = {
  apartment: "bg-blue-50 text-blue-700",
  house:     "bg-emerald-50 text-emerald-700",
  villa:     "bg-violet-50 text-violet-700",
  plot:      "bg-amber-50 text-amber-700",
  commercial:"bg-orange-50 text-orange-700",
  farmhouse: "bg-teal-50 text-teal-700",
};

export default function PropertiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");

  // Delete modal
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string; title: string }>({
    open: false, id: "", title: "",
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Reject modal
  const [rejectModal, setRejectModal] = useState<{ open: boolean; id: string; title: string }>({
    open: false, id: "", title: "",
  });
  const [rejectReason, setRejectReason] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  // Images modal
  const [imagesModal, setImagesModal] = useState<{ id: string; title: string } | null>(null);

  const page = parseInt(searchParams.get("page") || "1");
  const status = searchParams.get("status") || "";
  const listingType = searchParams.get("listingType") || "";
  const limit = 15;
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchProperties = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.set("status", status);
    if (listingType) params.set("listingType", listingType);
    const q = searchParams.get("search");
    if (q) params.set("search", q);
    api
      .get(`/admin/properties?${params}`)
      .then((res) => {
        setProperties(res.data.data?.properties || []);
        setTotal(res.data.data?.total || 0);
      })
      .catch(() => toast.error("Failed to load properties"))
      .finally(() => setLoading(false));
  }, [page, status, listingType, searchParams]);

  useEffect(() => {
    fetchProperties();
    setSelectedIds(new Set());
  }, [fetchProperties]);

  const updateFilter = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value);
    else p.delete(key);
    p.set("page", "1");
    setSearchParams(p);
  };

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      updateFilter("search", val);
    }, 420);
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearchParams({});
  };

  const hasFilters = !!(status || listingType || searchParams.get("search"));

  // Actions
  const approve = async (id: string) => {
    try {
      await api.patch(`/admin/properties/${id}/approve`);
      toast.success("Property approved");
      // Optimistic update — instantly reflect the new status
      if (status === "pending") {
        // If filtered to pending, remove the approved item from view and decrement total
        setProperties((prev) => prev.filter((p) => p._id !== id));
        setTotal((prev) => prev - 1);
      } else {
        setProperties((prev) =>
          prev.map((p) => (p._id === id ? { ...p, status: "approved" } : p))
        );
      }
    } catch {
      toast.error("Failed to approve");
    }
  };

  const openRejectModal = (id: string, title: string) => {
    setRejectReason("");
    setRejectModal({ open: true, id, title });
  };

  const confirmReject = async () => {
    setRejectLoading(true);
    try {
      await api.patch(`/admin/properties/${rejectModal.id}/reject`, { reason: rejectReason });
      toast.success("Property rejected");
      setRejectModal({ open: false, id: "", title: "" });
      // Optimistic update
      if (status === "pending") {
        setProperties((prev) => prev.filter((p) => p._id !== rejectModal.id));
        setTotal((prev) => prev - 1);
      } else {
        setProperties((prev) =>
          prev.map((p) => (p._id === rejectModal.id ? { ...p, status: "rejected" } : p))
        );
      }
    } catch {
      toast.error("Failed to reject");
    } finally {
      setRejectLoading(false);
    }
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    try {
      await api.patch(`/admin/properties/${id}/feature`, { isFeatured: !current });
      toast.success(current ? "Removed from featured" : "Marked as featured");
      fetchProperties();
    } catch {
      toast.error("Failed to update");
    }
  };

  const openDeleteModal = (id: string, title: string) => {
    setDeleteModal({ open: true, id, title });
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/admin/properties/${deleteModal.id}`);
      toast.success("Property deleted");
      setDeleteModal({ open: false, id: "", title: "" });
      fetchProperties();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Bulk helpers
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === properties.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(properties.map((p) => p._id)));
    }
  };

  const bulkAction = async (action: "approve" | "reject" | "delete", reason?: string) => {
    setBulkLoading(true);
    try {
      await api.post("/admin/properties/bulk", { ids: Array.from(selectedIds), action, reason });
      toast.success(`${selectedIds.size} properties ${action}d`);
      setSelectedIds(new Set());
      fetchProperties();
    } catch {
      toast.error("Bulk action failed");
    } finally {
      setBulkLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  // Page number range
  const pageNumbers = (() => {
    const range: number[] = [];
    const delta = 2;
    for (
      let i = Math.max(1, page - delta);
      i <= Math.min(totalPages, page + delta);
      i++
    ) {
      range.push(i);
    }
    return range;
  })();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <PageHeader
        title="Properties"
        subtitle={loading ? "Loading…" : `${total.toLocaleString()} total listing${total !== 1 ? "s" : ""}`}
      />

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border p-4 flex flex-wrap gap-3 items-center" style={{ borderColor: "#e8edf5", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <SlidersHorizontal className="w-4 h-4 text-gray-400 shrink-0" />

        {/* Search */}
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by title, city, owner…"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ADC8EE] transition"
          />
        </div>

        {/* Status */}
        <AdminSelect
          value={status}
          onChange={(v) => updateFilter("status", v)}
          placeholder="All Status"
          options={[
            { value: "", label: "All Status" },
            { value: "pending", label: "Pending" },
            { value: "approved", label: "Approved" },
            { value: "rejected", label: "Rejected" },
            { value: "sold", label: "Sold" },
            { value: "rented", label: "Rented" },
          ]}
        />

        {/* Listing type */}
        <AdminSelect
          value={listingType}
          onChange={(v) => updateFilter("listingType", v)}
          placeholder="All Types"
          options={[
            { value: "", label: "All Types" },
            ...LISTING_TYPES.map((t) => ({
              value: t,
              label: t.charAt(0).toUpperCase() + t.slice(1),
            })),
          ]}
        />

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-2xl flex-wrap animate-fade-down"
          style={{ background: "#1B3F72" }}
        >
          <span className="text-white text-sm font-semibold shrink-0">
            {selectedIds.size} selected
          </span>
          <div className="flex items-center gap-2 flex-wrap flex-1">
            <button
              onClick={() => bulkAction("approve")}
              disabled={bulkLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-60"
              style={{ background: "#059669", color: "#fff" }}
            >
              <CheckCircle style={{ width: 13, height: 13 }} />
              Approve All
            </button>
            <button
              onClick={() => bulkAction("reject")}
              disabled={bulkLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-60"
              style={{ background: "rgba(239,68,68,0.85)", color: "#fff" }}
            >
              <XCircle style={{ width: 13, height: 13 }} />
              Reject All
            </button>
            <button
              onClick={() => bulkAction("delete")}
              disabled={bulkLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-60"
              style={{ background: "rgba(239,68,68,0.65)", color: "#fff" }}
            >
              <Trash2 style={{ width: 13, height: 13 }} />
              Delete All
            </button>
          </div>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="ml-auto text-white/60 hover:text-white transition-colors shrink-0"
          >
            <X style={{ width: 15, height: 15 }} />
          </button>
        </div>
      )}

      {/* Table card */}
      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "#e8edf5", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        {loading ? (
          <SkeletonTable rows={8} />
        ) : properties.length === 0 ? (
          <div className="py-16 text-center">
            <Building2 className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400 font-medium">No properties found</p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="mt-2 text-xs text-[#1B3F72] hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                  <th className="pl-4 pr-2 py-3 w-8">
                    <input
                      type="checkbox"
                      checked={properties.length > 0 && selectedIds.size === properties.length}
                      onChange={toggleSelectAll}
                      className="w-3.5 h-3.5 rounded accent-[#1B3F72] cursor-pointer"
                    />
                  </th>
                  {["Property", "Owner", "Price", "Status", "Views", "Date", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {properties.map((p) => (
                  <tr
                    key={p._id}
                    className="hover:bg-gray-50/40 transition-colors group"
                    style={selectedIds.has(p._id) ? { background: "#EEF3FB" } : undefined}
                  >
                    {/* Checkbox */}
                    <td className="pl-4 pr-2 py-3.5 w-8">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(p._id)}
                        onChange={() => toggleSelect(p._id)}
                        className="w-3.5 h-3.5 rounded accent-[#1B3F72] cursor-pointer"
                      />
                    </td>
                    {/* Property */}
                    <td className="px-4 py-3.5 max-w-[240px]">
                      <p className="font-medium text-gray-900 truncate leading-snug">{p.title}</p>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className="text-xs text-gray-400">{p.location.city}</span>
                        <span className="text-gray-200">·</span>
                        <span
                          className={`text-xs font-medium px-1.5 py-0.5 rounded-md capitalize ${
                            TYPE_CHIP_COLORS[p.type] ?? "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {p.type}
                        </span>
                        <span
                          className="text-xs font-medium px-1.5 py-0.5 rounded-md capitalize bg-[#EEF3FB] text-[#1B3F72]"
                        >
                          {p.listingType}
                        </span>
                        {p.isFeatured && (
                          <span className="text-xs font-medium px-1.5 py-0.5 rounded-md bg-amber-50 text-[#C8922A]">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Owner */}
                    <td className="px-4 py-3.5">
                      <p className="text-gray-700 font-medium">{p.owner?.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{p.owner?.email}</p>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3.5 font-semibold" style={{ color: "#C8922A" }}>
                      {formatPrice(p.price)}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <StatusBadge status={p.status} />
                    </td>

                    {/* Views */}
                    <td className="px-4 py-3.5 text-gray-500 text-sm">
                      {p.views?.toLocaleString() ?? 0}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                      {formatDate(p.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        {p.status === "pending" && (
                          <>
                            <button
                              onClick={() => approve(p._id)}
                              title="Approve"
                              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors bg-emerald-50 hover:bg-emerald-100 text-emerald-600"
                            >
                              <CheckCircle style={{ width: 15, height: 15 }} />
                            </button>
                            <button
                              onClick={() => openRejectModal(p._id, p.title)}
                              title="Reject"
                              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors bg-red-50 hover:bg-red-100 text-red-600"
                            >
                              <XCircle style={{ width: 15, height: 15 }} />
                            </button>
                          </>
                        )}

                        {/* Feature star */}
                        <button
                          onClick={() => toggleFeatured(p._id, p.isFeatured)}
                          title={p.isFeatured ? "Remove from featured" : "Mark as featured"}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                            p.isFeatured
                              ? "bg-amber-50 text-[#C8922A] hover:bg-amber-100"
                              : "bg-gray-100 text-gray-400 hover:bg-amber-50 hover:text-[#C8922A]"
                          }`}
                        >
                          <Star
                            style={{ width: 14, height: 14 }}
                            className={p.isFeatured ? "fill-[#C8922A]" : ""}
                          />
                        </button>

                        {/* View on site */}
                        <a
                          href={`${import.meta.env.VITE_FRONTEND_URL || "http://localhost:3000"}/properties/${p.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View on site"
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors bg-[#EEF3FB] hover:bg-[#D6E4F7] text-[#1B3F72]"
                        >
                          <Eye style={{ width: 14, height: 14 }} />
                        </a>

                        {/* Images */}
                        <button
                          onClick={() => setImagesModal({ id: p._id, title: p.title })}
                          title="View images"
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors bg-[#EEF3FB] hover:bg-[#D6E4F7] text-[#1B3F72]"
                        >
                          <Images style={{ width: 14, height: 14 }} />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => openDeleteModal(p._id, p.title)}
                          title="Delete"
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors bg-red-50 hover:bg-red-100 text-red-500"
                        >
                          <Trash2 style={{ width: 14, height: 14 }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="px-6 py-3.5 border-t border-gray-100 flex items-center justify-between gap-4">
            <span className="text-sm text-gray-500">
              Showing {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of{" "}
              {total.toLocaleString()}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => updateFilter("page", String(page - 1))}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {pageNumbers[0] > 1 && (
                <>
                  <button
                    onClick={() => updateFilter("page", "1")}
                    className="w-8 h-8 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 transition-colors"
                  >
                    1
                  </button>
                  {pageNumbers[0] > 2 && (
                    <span className="text-gray-400 px-1 text-sm">…</span>
                  )}
                </>
              )}

              {pageNumbers.map((n) => (
                <button
                  key={n}
                  onClick={() => updateFilter("page", String(n))}
                  className={`w-8 h-8 rounded-lg border text-sm font-medium transition-colors ${
                    n === page
                      ? "bg-[#1B3F72] border-[#1B3F72] text-white"
                      : "border-gray-200 hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  {n}
                </button>
              ))}

              {pageNumbers[pageNumbers.length - 1] < totalPages && (
                <>
                  {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                    <span className="text-gray-400 px-1 text-sm">…</span>
                  )}
                  <button
                    onClick={() => updateFilter("page", String(totalPages))}
                    className="w-8 h-8 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 transition-colors"
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                disabled={page >= totalPages}
                onClick={() => updateFilter("page", String(page + 1))}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      <Modal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: "", title: "" })}
        title="Delete Property"
        onConfirm={confirmDelete}
        confirmText="Delete"
        confirmVariant="danger"
        loading={deleteLoading}
      >
        <p className="text-gray-600">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-gray-800">"{deleteModal.title}"</span>?
        </p>
        <p className="text-red-500 text-xs mt-2 font-medium">
          This action cannot be undone.
        </p>
      </Modal>

      {/* Reject modal with reason textarea */}
      <Modal
        open={rejectModal.open}
        onClose={() => setRejectModal({ open: false, id: "", title: "" })}
        title="Reject Property"
        onConfirm={confirmReject}
        confirmText="Reject Property"
        confirmVariant="danger"
        loading={rejectLoading}
      >
        <p className="text-gray-600 mb-3">
          Rejecting{" "}
          <span className="font-semibold text-gray-800">"{rejectModal.title}"</span>.
          Optionally provide a reason for the owner.
        </p>
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Reason for rejection (optional)…"
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ADC8EE] resize-none"
        />
      </Modal>

      {/* Images modal */}
      {imagesModal && (
        <ImagesModal
          propertyId={imagesModal.id}
          propertyTitle={imagesModal.title}
          onClose={() => setImagesModal(null)}
        />
      )}
    </div>
  );
}
