import { useState, useEffect } from "react";
import { Plus, Search, Pencil, Trash2, X } from "lucide-react";
import api from "../lib/api";

type Service = {
  _id: string;
  name: string;
  description: string;
  avgDurationMins: number;
  department: string;
};

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [avgDurationMins, setAvgDurationMins] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchServices = async () => {
    try {
      setError("");
      const res = await api.get("/services");
      setServices(res.data);
    } catch (err) {
      setError("Could not load services.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setAvgDurationMins("");
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (s: Service) => {
    setEditingId(s._id);
    setName(s.name);
    setDescription(s.description);
    setAvgDurationMins(String(s.avgDurationMins));
    setFormError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      const payload = {
        name,
        description,
        avgDurationMins: Number(avgDurationMins),
      };
      if (editingId) {
        await api.put(`/services/${editingId}`, payload);
      } else {
        await api.post("/services", payload);
      }
      setShowModal(false);
      await fetchServices();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this service? This cannot be undone.")) return;
    try {
      await api.delete(`/services/${id}`);
      await fetchServices();
    } catch (err) {
      alert("Could not delete service.");
    }
  };

  const filtered = services.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-[#1A1B25]">
          Services Management
        </h1>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-[#5B4FE5] text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:opacity-90"
        >
          <Plus size={16} />
          Add Service
        </button>
      </div>
      <p className="text-sm text-[#8A8DA3] mb-6">
        Manage the list of available registrar services.
      </p>

      <div className="flex items-center gap-2 bg-white border border-[#E4E6F0] rounded-lg px-3 py-2 max-w-xs mb-4">
        <Search size={16} className="text-[#8A8DA3]" />
        <input
          type="text"
          placeholder="Search services..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-sm outline-none flex-1"
        />
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      <div className="bg-white border border-[#E4E6F0] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E4E6F0] text-left text-[#8A8DA3]">
              <th className="px-5 py-3 font-medium">Service Name</th>
              <th className="px-5 py-3 font-medium">Description</th>
              <th className="px-5 py-3 font-medium">Avg. Duration</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-8 text-center text-[#8A8DA3]"
                >
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-8 text-center text-[#8A8DA3]"
                >
                  No services found.
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr
                  key={s._id}
                  className="border-b border-[#E4E6F0] last:border-0"
                >
                  <td className="px-5 py-3 font-semibold text-[#1A1B25]">
                    {s.name}
                  </td>
                  <td className="px-5 py-3 text-[#8A8DA3] max-w-sm truncate">
                    {s.description || "—"}
                  </td>
                  <td className="px-5 py-3 text-[#1A1B25]">
                    {s.avgDurationMins} mins
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(s)}
                        className="p-1.5 rounded hover:bg-[#F5F6FB] text-[#5B4FE5]"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(s._id)}
                        className="p-1.5 rounded hover:bg-[#F5F6FB] text-red-500"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#1A1B25]">
                {editingId ? "Edit Service" : "Add Service"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#8A8DA3]"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label className="block text-sm font-medium text-[#1A1B25] mb-1">
                Service Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-[#E4E6F0] rounded-lg px-3 py-2 mb-4 text-sm outline-none focus:ring-2 focus:ring-[#5B4FE5]"
                required
              />

              <label className="block text-sm font-medium text-[#1A1B25] mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full border border-[#E4E6F0] rounded-lg px-3 py-2 mb-4 text-sm outline-none focus:ring-2 focus:ring-[#5B4FE5]"
              />

              <label className="block text-sm font-medium text-[#1A1B25] mb-1">
                Average Duration (minutes)
              </label>
              <input
                type="number"
                min="1"
                value={avgDurationMins}
                onChange={(e) => setAvgDurationMins(e.target.value)}
                className="w-full border border-[#E4E6F0] rounded-lg px-3 py-2 mb-4 text-sm outline-none focus:ring-2 focus:ring-[#5B4FE5]"
                required
              />

              {formError && (
                <p className="text-sm text-red-500 mb-4">{formError}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#5B4FE5] text-white font-semibold rounded-lg py-2.5 text-sm disabled:opacity-60"
              >
                {submitting
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Add Service"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
