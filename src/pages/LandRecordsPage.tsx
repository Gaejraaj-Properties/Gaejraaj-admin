import { useEffect, useState, useCallback, useRef } from "react";
import {
  Search, Shield, ShieldCheck, ShieldAlert, ShieldX,
  Plus, Edit2, Trash2, ExternalLink, FileText,
  MapPin, ChevronLeft, ChevronRight, SlidersHorizontal, X,
} from "lucide-react";
import { toast } from "sonner";
import api from "../lib/api";
import { formatDate } from "../lib/format";
import PageHeader from "../components/ui/PageHeader";
import { SkeletonTable } from "../components/ui/Skeleton";
import Modal from "../components/ui/Modal";
import AdminSelect from "../components/ui/Select";

interface LandRecord {
  _id: string;
  property: { _id: string; title: string; location: { city: string; state: string }; slug: string; status: string };
  state: string;
  district: string;
  tehsil: string;
  village: string;
  khasraNumber: string;
  khautaniNumber: string;
  ownerNameAsPerRecord: string;
  areaAsPerRecord: string;
  verificationStatus: "pending" | "verified" | "disputed" | "unverified";
  verifiedBy?: { name: string };
  verifiedAt?: string;
  govPortalUrl: string;
  notes: string;
  createdAt: string;
}

interface PropertyOption { _id: string; title: string; location: { city: string } }

const STATUS_CONFIG = {
  verified:   { icon: ShieldCheck, color: "#059669", bg: "#f0fdf4", label: "Verified"   },
  pending:    { icon: Shield,      color: "#d97706", bg: "#fffbeb", label: "Pending"    },
  disputed:   { icon: ShieldAlert, color: "#ef4444", bg: "#fef2f2", label: "Disputed"   },
  unverified: { icon: ShieldX,     color: "#94a3b8", bg: "#f8fafc", label: "Unverified" },
};

const STATES = ["Uttar Pradesh", "Uttarakhand"];

const EMPTY_FORM = {
  propertyId: "", state: "Uttar Pradesh", district: "", tehsil: "",
  village: "", khasraNumber: "", khautaniNumber: "",
  ownerNameAsPerRecord: "", areaAsPerRecord: "", notes: "",
};

function StatusBadge({ status }: { status: LandRecord["verificationStatus"] }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.unverified;
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <Icon style={{ width: 10, height: 10 }} />
      {cfg.label}
    </span>
  );
}

export default function LandRecordsPage() {
  const [records,  setRecords]  = useState<LandRecord[]>([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [search,   setSearch]   = useState("");
  const limit = 15;

  // Add modal
  const [addModal,   setAddModal]   = useState(false);
  const [addForm,    setAddForm]    = useState(EMPTY_FORM);
  const [addLoading, setAddLoading] = useState(false);
  const [propSearch, setPropSearch] = useState("");
  const [propOptions, setPropOptions] = useState<PropertyOption[]>([]);

  // Edit modal
  const [editModal,   setEditModal]   = useState<{ open: boolean; record: LandRecord | null }>({ open: false, record: null });
  const [editForm,    setEditForm]    = useState<Partial<LandRecord & { verificationStatus: string }>>({});
  const [editLoading, setEditLoading] = useState(false);

  // Delete modal
  const [deleteModal,   setDeleteModal]   = useState<{ open: boolean; record: LandRecord | null }>({ open: false, record: null });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchRecords = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (statusFilter) params.set("status", statusFilter);
    api.get(`/admin/land-records?${params}`)
      .then((res) => {
        setRecords(res.data.data?.records || []);
        setTotal(res.data.data?.total || 0);
      })
      .catch(() => toast.error("Failed to load land records"))
      .finally(() => setLoading(false));
  }, [page, statusFilter]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const searchProperties = (q: string) => {
    setPropSearch(q);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!q.trim()) { setPropOptions([]); return; }
    searchTimer.current = setTimeout(() => {
      api.get(`/admin/properties?search=${encodeURIComponent(q)}&limit=8&status=approved`)
        .then((res) => setPropOptions(res.data.data?.properties || []))
        .catch(() => {});
    }, 350);
  };

  const saveAdd = async () => {
    if (!addForm.propertyId) { toast.error("Select a property"); return; }
    if (!addForm.state)      { toast.error("Select a state"); return; }
    setAddLoading(true);
    try {
      await api.post("/admin/land-records", addForm);
      toast.success("Land record created");
      setAddModal(false);
      setAddForm(EMPTY_FORM);
      fetchRecords();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create");
    } finally {
      setAddLoading(false);
    }
  };

  const openEdit = (r: LandRecord) => {
    setEditForm({
      state: r.state, district: r.district, tehsil: r.tehsil, village: r.village,
      khasraNumber: r.khasraNumber, khautaniNumber: r.khautaniNumber,
      ownerNameAsPerRecord: r.ownerNameAsPerRecord, areaAsPerRecord: r.areaAsPerRecord,
      verificationStatus: r.verificationStatus, notes: r.notes,
    });
    setEditModal({ open: true, record: r });
  };

  const saveEdit = async () => {
    if (!editModal.record) return;
    setEditLoading(true);
    try {
      await api.put(`/admin/land-records/${editModal.record._id}`, editForm);
      toast.success("Land record updated");
      setEditModal({ open: false, record: null });
      fetchRecords();
    } catch {
      toast.error("Failed to update");
    } finally {
      setEditLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.record) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/admin/land-records/${deleteModal.record._id}`);
      toast.success("Deleted");
      setDeleteModal({ open: false, record: null });
      fetchRecords();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleteLoading(false);
    }
  };

  const quickVerify = async (r: LandRecord) => {
    try {
      await api.put(`/admin/land-records/${r._id}`, { verificationStatus: "verified" });
      toast.success(`${r.property.title} — record verified`);
      fetchRecords();
    } catch {
      toast.error("Failed to verify");
    }
  };

  const totalPages = Math.ceil(total / limit);
  const counts = {
    verified:   records.filter((r) => r.verificationStatus === "verified").length,
    pending:    records.filter((r) => r.verificationStatus === "pending").length,
    disputed:   records.filter((r) => r.verificationStatus === "disputed").length,
  };

  const FormFields = ({
    form,
    onChange,
    showProperty = false,
  }: {
    form: any;
    onChange: (f: any) => void;
    showProperty?: boolean;
  }) => (
    <div className="space-y-3">
      {showProperty && (
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">Property *</label>
          <input
            type="text"
            placeholder="Search property by title…"
            value={propSearch}
            onChange={(e) => searchProperties(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ADC8EE]"
          />
          {propOptions.length > 0 && (
            <div className="border border-gray-200 rounded-xl mt-1 divide-y divide-gray-50 max-h-40 overflow-y-auto">
              {propOptions.map((p) => (
                <button
                  key={p._id}
                  type="button"
                  onClick={() => {
                    onChange({ ...form, propertyId: p._id });
                    setPropSearch(p.title);
                    setPropOptions([]);
                  }}
                  className="w-full text-left px-3 py-2.5 text-sm hover:bg-[#EEF3FB] transition-colors"
                >
                  <span className="font-medium text-gray-800">{p.title}</span>
                  <span className="text-xs text-gray-400 ml-2">{p.location.city}</span>
                </button>
              ))}
            </div>
          )}
          {form.propertyId && (
            <p className="text-[11px] text-green-600 font-medium mt-1 flex items-center gap-1">
              <ShieldCheck style={{ width: 11, height: 11 }} /> Property selected
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">State *</label>
          <select
            value={form.state}
            onChange={(e) => onChange({ ...form, state: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ADC8EE] bg-white"
          >
            {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">District</label>
          <input type="text" value={form.district} onChange={(e) => onChange({ ...form, district: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ADC8EE]" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">Tehsil</label>
          <input type="text" value={form.tehsil} onChange={(e) => onChange({ ...form, tehsil: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ADC8EE]" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">Village / Mohalla</label>
          <input type="text" value={form.village} onChange={(e) => onChange({ ...form, village: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ADC8EE]" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">Khasra Number</label>
          <input type="text" placeholder="e.g. 123/1" value={form.khasraNumber} onChange={(e) => onChange({ ...form, khasraNumber: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ADC8EE]" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">Khatauni Number</label>
          <input type="text" placeholder="e.g. 00456" value={form.khautaniNumber} onChange={(e) => onChange({ ...form, khautaniNumber: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ADC8EE]" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">Owner (as per record)</label>
          <input type="text" value={form.ownerNameAsPerRecord} onChange={(e) => onChange({ ...form, ownerNameAsPerRecord: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ADC8EE]" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">Area (as per record)</label>
          <input type="text" placeholder="e.g. 200 sqm" value={form.areaAsPerRecord} onChange={(e) => onChange({ ...form, areaAsPerRecord: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ADC8EE]" />
        </div>
      </div>

      {!showProperty && (
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">Verification Status</label>
          <select
            value={form.verificationStatus}
            onChange={(e) => onChange({ ...form, verificationStatus: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ADC8EE] bg-white"
          >
            {Object.entries(STATUS_CONFIG).map(([v, c]) => (
              <option key={v} value={v}>{c.label}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="text-xs font-semibold text-gray-600 mb-1 block">Internal Notes</label>
        <textarea rows={2} value={form.notes} onChange={(e) => onChange({ ...form, notes: e.target.value })}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ADC8EE] resize-none" />
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Land Record Verification"
        subtitle={`${total} records — Khasra / Khatauni verification`}
      />

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Records",  value: total,          icon: FileText,   color: "#1B3F72", bg: "#EEF3FB" },
          { label: "Verified",       value: counts.verified, icon: ShieldCheck,color: "#059669", bg: "#f0fdf4" },
          { label: "Pending Review", value: counts.pending,  icon: Shield,     color: "#d97706", bg: "#fffbeb" },
          { label: "Disputed",       value: counts.disputed, icon: ShieldAlert,color: "#ef4444", bg: "#fef2f2" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border p-4 flex items-center gap-3"
            style={{ borderColor: "#edf2f7", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
              <Icon style={{ width: 18, height: 18, color }} />
            </div>
            <div>
              <p className="text-xl font-extrabold leading-none" style={{ color }}>{value}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter + Add ── */}
      <div className="bg-white rounded-2xl border p-4 flex flex-wrap gap-3 items-center"
        style={{ borderColor: "#e8edf5", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <SlidersHorizontal className="w-4 h-4 text-gray-400 shrink-0" />
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by property, district…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ADC8EE] transition"
          />
        </div>
        <AdminSelect
          value={statusFilter}
          onChange={(v) => { setStatusFilter(v); setPage(1); }}
          placeholder="All Status"
          options={[
            { value: "", label: "All Status" },
            ...Object.entries(STATUS_CONFIG).map(([v, c]) => ({ value: v, label: c.label })),
          ]}
        />
        {(statusFilter || search) && (
          <button onClick={() => { setStatusFilter(""); setSearch(""); setPage(1); }}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors">
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        )}
        <button
          onClick={() => { setAddForm(EMPTY_FORM); setPropSearch(""); setPropOptions([]); setAddModal(true); }}
          className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: "#1B3F72" }}>
          <Plus style={{ width: 15, height: 15 }} />
          Add Record
        </button>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border overflow-hidden"
        style={{ borderColor: "#e8edf5", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        {loading ? (
          <SkeletonTable rows={8} />
        ) : records.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400 font-medium">No land records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                  {["Property", "Location", "Khasra / Khatauni", "Owner (Record)", "Status", "Date", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {records.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50/40 transition-colors">
                    {/* Property */}
                    <td className="px-4 py-3.5 max-w-[200px]">
                      <p className="font-semibold text-gray-900 text-[13px] truncate">{r.property?.title}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin style={{ width: 9, height: 9, color: "#94a3b8" }} />
                        <span className="text-[11px] text-gray-400">{r.property?.location?.city}</span>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-4 py-3.5">
                      <p className="text-xs font-medium text-gray-700">{r.state}</p>
                      <p className="text-[11px] text-gray-400">{[r.district, r.tehsil, r.village].filter(Boolean).join(", ") || "—"}</p>
                    </td>

                    {/* Khasra / Khatauni */}
                    <td className="px-4 py-3.5">
                      <p className="text-xs font-mono font-semibold text-[#1B3F72]">{r.khasraNumber || "—"}</p>
                      <p className="text-[11px] text-gray-400 font-mono">{r.khautaniNumber || "—"}</p>
                    </td>

                    {/* Owner */}
                    <td className="px-4 py-3.5 text-xs text-gray-600 max-w-[140px] truncate">
                      {r.ownerNameAsPerRecord || <span className="text-gray-300">—</span>}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <StatusBadge status={r.verificationStatus} />
                      {r.verifiedBy && (
                        <p className="text-[10px] text-gray-400 mt-1">by {r.verifiedBy.name}</p>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                      {formatDate(r.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        {r.verificationStatus !== "verified" && (
                          <button
                            onClick={() => quickVerify(r)}
                            title="Quick verify"
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors"
                            style={{ background: "#f0fdf4", color: "#059669" }}
                          >
                            <ShieldCheck style={{ width: 12, height: 12 }} />
                            Verify
                          </button>
                        )}
                        {r.govPortalUrl && (
                          <a
                            href={r.govPortalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open gov portal"
                            className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#EEF3FB] hover:bg-[#D6E4F7] transition-colors"
                            style={{ color: "#1B3F72" }}
                          >
                            <ExternalLink style={{ width: 12, height: 12 }} />
                          </a>
                        )}
                        <button onClick={() => openEdit(r)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#EEF3FB] hover:bg-[#D6E4F7] transition-colors"
                          style={{ color: "#1B3F72" }}>
                          <Edit2 style={{ width: 12, height: 12 }} />
                        </button>
                        <button onClick={() => setDeleteModal({ open: true, record: r })}
                          className="w-7 h-7 rounded-lg flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-400 transition-colors">
                          <Trash2 style={{ width: 12, height: 12 }} />
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
          <div className="px-6 py-3.5 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total}
            </span>
            <div className="flex items-center gap-1">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal open={addModal} onClose={() => setAddModal(false)}
        title="Add Land Record" onConfirm={saveAdd} confirmText="Create Record" loading={addLoading}>
        <FormFields form={addForm} onChange={setAddForm} showProperty />
      </Modal>

      {/* Edit Modal */}
      <Modal open={editModal.open} onClose={() => setEditModal({ open: false, record: null })}
        title={`Edit Record — ${editModal.record?.property?.title}`}
        onConfirm={saveEdit} confirmText="Save Changes" loading={editLoading}>
        <FormFields form={editForm} onChange={setEditForm} />
      </Modal>

      {/* Delete Modal */}
      <Modal open={deleteModal.open} onClose={() => setDeleteModal({ open: false, record: null })}
        title="Delete Land Record" onConfirm={confirmDelete} confirmText="Delete"
        confirmVariant="danger" loading={deleteLoading}>
        <p className="text-gray-600">
          Delete land record for <span className="font-semibold">"{deleteModal.record?.property?.title}"</span>?
        </p>
        <p className="text-red-500 text-xs mt-2 font-medium">This cannot be undone.</p>
      </Modal>
    </div>
  );
}
