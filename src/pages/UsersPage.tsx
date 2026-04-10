import { useEffect, useState, useCallback, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  UserCheck,
  UserX,
  ChevronDown,
  Check,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { toast } from "sonner";
import api from "../lib/api";
import { formatDate } from "../lib/format";
import PageHeader from "../components/ui/PageHeader";
import { StatusBadge } from "../components/ui/Badge";
import { SkeletonTable } from "../components/ui/Skeleton";
import AdminSelect from "../components/ui/Select";

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  propertyCount?: number;
}

const ROLES = ["buyer", "seller", "agent", "admin"] as const;
type Role = typeof ROLES[number];

const AVATAR_COLORS: Record<string, string> = {
  admin:  "#1B3F72",
  agent:  "#2563eb",
  seller: "#059669",
  buyer:  "#6b7280",
};

function UserAvatar({ user }: { user: User }) {
  const initials = user.name
    ?.split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "?";

  const bg = AVATAR_COLORS[user.role] ?? "#9ca3af";

  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
      style={{ backgroundColor: bg }}
    >
      {initials}
    </div>
  );
}

function RoleDropdown({
  currentRole,
  onSelect,
}: {
  currentRole: string;
  onSelect: (role: Role) => void;
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, right: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 6,
        right: window.innerWidth - rect.right,
      });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("scroll", close, true);
    };
  }, [open]);

  const dropdown = open
    ? createPortal(
        <div
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            top: coords.top,
            right: coords.right,
            zIndex: 9999,
            background: "#fff",
            border: "1px solid #f1f5f9",
            borderRadius: 16,
            boxShadow: "0 8px 30px rgba(0,0,0,0.10)",
            overflow: "hidden",
            minWidth: 144,
            animation: "fade-down 0.18s cubic-bezier(0.16,1,0.3,1) both",
          }}
        >
          <p className="px-3.5 pt-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>
            Set Role
          </p>
          {ROLES.map((r) => {
            const isSelected = r === currentRole;
            return (
              <button
                key={r}
                onClick={() => { onSelect(r); setOpen(false); }}
                className="w-full flex items-center gap-2 px-3.5 py-2.5 text-sm capitalize transition-colors text-left"
                style={{
                  backgroundColor: isSelected ? "#EEF3FB" : undefined,
                  color: isSelected ? "#1B3F72" : "#374151",
                  fontWeight: isSelected ? 600 : 400,
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f8fafc";
                    (e.currentTarget as HTMLButtonElement).style.color = "#1B3F72";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                    (e.currentTarget as HTMLButtonElement).style.color = "#374151";
                  }
                }}
              >
                <span className="flex-1">{r}</span>
                {isSelected && (
                  <Check style={{ width: 13, height: 13, color: "#C8922A", flexShrink: 0 }} />
                )}
              </button>
            );
          })}
        </div>,
        document.body
      )
    : null;

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[#EEF3FB]"
        style={{ color: "#94a3b8" }}
        title="Change role"
        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#1B3F72")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#94a3b8")}
      >
        <ChevronDown
          style={{
            width: 14,
            height: 14,
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {dropdown}
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const limit = 15;

  const fetchUsers = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (roleFilter) params.set("role", roleFilter);
    if (debouncedSearch) params.set("search", debouncedSearch);
    api
      .get(`/admin/users?${params}`)
      .then((res) => {
        setUsers(res.data.data?.users || []);
        setTotal(res.data.data?.total || 0);
      })
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoading(false));
  }, [page, roleFilter, debouncedSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      setDebouncedSearch(val);
    }, 420);
  };

  const clearFilters = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setRoleFilter("");
    setPage(1);
  };

  const hasFilters = !!(debouncedSearch || roleFilter);

  const changeRole = async (id: string, newRole: Role) => {
    try {
      await api.patch(`/admin/users/${id}/role`, { role: newRole });
      toast.success(`Role updated to ${newRole}`);
      fetchUsers();
    } catch {
      toast.error("Failed to update role");
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await api.patch(`/admin/users/${id}/status`, { isActive: !isActive });
      toast.success(isActive ? "User deactivated" : "User activated");
      fetchUsers();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const totalPages = Math.ceil(total / limit);

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
        title="Users"
        subtitle={loading ? "Loading…" : `${total.toLocaleString()} registered user${total !== 1 ? "s" : ""}`}
      />

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border p-4 flex flex-wrap gap-3 items-center" style={{ borderColor: "#e8edf5", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <SlidersHorizontal className="w-4 h-4 text-gray-400 shrink-0" />

        {/* Search */}
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, email or phone…"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ADC8EE] transition"
          />
        </div>

        {/* Role filter */}
        <AdminSelect
          value={roleFilter}
          onChange={(v) => { setRoleFilter(v); setPage(1); }}
          placeholder="All Roles"
          options={[
            { value: "", label: "All Roles" },
            ...ROLES.map((r) => ({
              value: r,
              label: r.charAt(0).toUpperCase() + r.slice(1),
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

      {/* Table card */}
      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "#e8edf5", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        {loading ? (
          <SkeletonTable rows={8} />
        ) : users.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400 font-medium">No users found</p>
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
                  {["User", "Phone", "Role", "Status", "Joined", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50/40 transition-colors">
                    {/* User */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={u} />
                        <div>
                          <p className="font-medium text-gray-900 leading-snug">{u.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-3.5 text-gray-500 text-sm">
                      {u.phone || <span className="text-gray-300">—</span>}
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3.5">
                      <StatusBadge status={u.role} />
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <StatusBadge status={u.isActive ? "active" : "inactive"} />
                    </td>

                    {/* Joined */}
                    <td className="px-4 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                      {formatDate(u.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {/* Role dropdown */}
                        <RoleDropdown
                          currentRole={u.role}
                          onSelect={(role) => changeRole(u._id, role)}
                        />

                        {/* Toggle active */}
                        <button
                          onClick={() => toggleActive(u._id, u.isActive)}
                          title={u.isActive ? "Deactivate user" : "Activate user"}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                            u.isActive
                              ? "bg-red-50 hover:bg-red-100 text-red-500"
                              : "bg-emerald-50 hover:bg-emerald-100 text-emerald-600"
                          }`}
                        >
                          {u.isActive ? (
                            <UserX style={{ width: 14, height: 14 }} />
                          ) : (
                            <UserCheck style={{ width: 14, height: 14 }} />
                          )}
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
                onClick={() => setPage(page - 1)}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {pageNumbers[0] > 1 && (
                <>
                  <button
                    onClick={() => setPage(1)}
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
                  onClick={() => setPage(n)}
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
                    onClick={() => setPage(totalPages)}
                    className="w-8 h-8 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 transition-colors"
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
