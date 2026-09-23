import { useState, useEffect, useMemo } from "react";
import { Search, X } from "lucide-react";
import api from "../lib/api";

type Appointment = {
  _id: string;
  status: string;
  preferredDate: string;
  priorityTier: "normal" | "urgent";
  student: { name: string; studentId: string };
  service: { _id: string; name: string };
};

type Service = { _id: string; name: string };

const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  pending: { bg: "bg-orange-100", text: "text-orange-600", label: "Pending" },
  queued: { bg: "bg-blue-100", text: "text-blue-600", label: "Queued" },
  serving: { bg: "bg-green-100", text: "text-green-600", label: "Serving" },
  done: { bg: "bg-green-100", text: "text-green-600", label: "Completed" },
  cancelled: { bg: "bg-red-100", text: "text-red-600", label: "Cancelled" },
};

const TABS = [
  { key: "all", label: "All Appointments" },
  { key: "upcoming", label: "Upcoming" },
  { key: "history", label: "History" },
];

const PAGE_SIZE = 10;

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState<Appointment | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      setError("");
      const [apptRes, svcRes] = await Promise.all([
        api.get("/appointments"),
        api.get("/services"),
      ]);
      setAppointments(apptRes.data);
      setServices(svcRes.data);
    } catch (err) {
      setError("Could not load appointments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openDetail = (a: Appointment) => {
    setSelected(a);
    setNewStatus(a.status);
  };

  const handleSaveStatus = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await api.put(`/appointments/${selected._id}/status`, {
        status: newStatus,
      });
      setSelected(null);
      await fetchData();
    } catch (err) {
      alert("Could not update status.");
    } finally {
      setSaving(false);
    }
  };

  const filtered = useMemo(() => {
    return appointments
      .filter((a) => {
        if (activeTab === "upcoming")
          return ["pending", "queued", "serving"].includes(a.status);
        if (activeTab === "history")
          return ["done", "cancelled"].includes(a.status);
        return true;
      })
      .filter(
        (a) => serviceFilter === "all" || a.service?._id === serviceFilter,
      )
      .filter((a) => statusFilter === "all" || a.status === statusFilter)
      .filter((a) => {
        const q = search.toLowerCase();
        return (
          a.student?.name?.toLowerCase().includes(q) ||
          a.student?.studentId?.toLowerCase().includes(q)
        );
      });
  }, [appointments, activeTab, serviceFilter, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // reset to page 1 whenever filters change, so you're never stuck on an empty page
  useEffect(() => {
    setPage(1);
  }, [activeTab, serviceFilter, statusFilter, search]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1A1B25] mb-1">Appointments</h1>
      <p className="text-sm text-[#8A8DA3] mb-6">
        Manage student appointments and service records.
      </p>

      <div className="flex gap-1 mb-4 border-b border-[#E4E6F0]">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px ${
              activeTab === t.key
                ? "border-[#5B4FE5] text-[#5B4FE5]"
                : "border-transparent text-[#8A8DA3]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 bg-white border border-[#E4E6F0] rounded-lg px-3 py-2 flex-1 max-w-xs">
          <Search size={16} className="text-[#8A8DA3]" />
          <input
            type="text"
            placeholder="Search by student name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-sm outline-none flex-1"
          />
        </div>
        <select
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
          className="border border-[#E4E6F0] bg-white rounded-lg px-3 py-2 text-sm text-[#1A1B25]"
        >
          <option value="all">All Services</option>
          {services.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-[#E4E6F0] bg-white rounded-lg px-3 py-2 text-sm text-[#1A1B25]"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="queued">Queued</option>
          <option value="serving">Serving</option>
          <option value="done">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      <div className="bg-white border border-[#E4E6F0] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E4E6F0] text-left text-[#8A8DA3]">
              <th className="px-5 py-3 font-medium">Student Name</th>
              <th className="px-5 py-3 font-medium">Student ID</th>
              <th className="px-5 py-3 font-medium">Service</th>
              <th className="px-5 py-3 font-medium">Date & Time</th>
              <th className="px-5 py-3 font-medium">Priority</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-8 text-center text-[#8A8DA3]"
                >
                  Loading...
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-8 text-center text-[#8A8DA3]"
                >
                  No appointments found.
                </td>
              </tr>
            ) : (
              paginated.map((a) => {
                const style = STATUS_STYLES[a.status] || STATUS_STYLES.pending;
                return (
                  <tr
                    key={a._id}
                    className="border-b border-[#E4E6F0] last:border-0"
                  >
                    <td className="px-5 py-3 font-medium text-[#1A1B25]">
                      {a.student?.name}
                    </td>
                    <td className="px-5 py-3 text-[#8A8DA3]">
                      {a.student?.studentId}
                    </td>
                    <td className="px-5 py-3 text-[#1A1B25]">
                      {a.service?.name}
                    </td>
                    <td className="px-5 py-3 text-[#8A8DA3]">
                      {new Date(a.preferredDate).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-5 py-3">
                      {a.priorityTier === "urgent" ? (
                        <span className="text-xs font-semibold px-2 py-1 rounded bg-red-100 text-red-600">
                          Urgent
                        </span>
                      ) : (
                        <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-500">
                          Normal
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded ${style.bg} ${style.text}`}
                      >
                        {style.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => openDetail(a)}
                        className="text-xs font-semibold text-[#5B4FE5] hover:underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-[#E4E6F0]">
            <p className="text-xs text-[#8A8DA3]">
              Showing {(page - 1) * PAGE_SIZE + 1}-
              {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="text-xs px-2.5 py-1 rounded border border-[#E4E6F0] disabled:opacity-40"
              >
                Prev
              </button>
              <span className="text-xs px-2 py-1 text-[#8A8DA3]">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="text-xs px-2.5 py-1 rounded border border-[#E4E6F0] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#1A1B25]">
                Appointment Details
              </h2>
              <button
                onClick={() => setSelected(null)}
                className="text-[#8A8DA3]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 mb-5 text-sm">
              <div className="flex justify-between">
                <span className="text-[#8A8DA3]">Student</span>
                <span className="font-medium text-[#1A1B25]">
                  {selected.student?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8A8DA3]">Student ID</span>
                <span className="font-medium text-[#1A1B25]">
                  {selected.student?.studentId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8A8DA3]">Service</span>
                <span className="font-medium text-[#1A1B25]">
                  {selected.service?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8A8DA3]">Date & Time</span>
                <span className="font-medium text-[#1A1B25]">
                  {new Date(selected.preferredDate).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8A8DA3]">Priority</span>
                <span className="font-medium text-[#1A1B25]">
                  {selected.priorityTier}
                </span>
              </div>
            </div>

            <label className="block text-sm font-medium text-[#1A1B25] mb-1">
              Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full border border-[#E4E6F0] rounded-lg px-3 py-2 mb-4 text-sm outline-none focus:ring-2 focus:ring-[#5B4FE5]"
            >
              <option value="pending">Pending</option>
              <option value="queued">Queued</option>
              <option value="serving">Serving</option>
              <option value="done">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <button
              onClick={handleSaveStatus}
              disabled={saving || newStatus === selected.status}
              className="w-full bg-[#5B4FE5] text-white font-semibold rounded-lg py-2.5 text-sm disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
