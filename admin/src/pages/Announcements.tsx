import { useState, useEffect } from "react";
import { Plus, Search, Pencil, Trash2, X } from "lucide-react";
import api from "../lib/api";

type Announcement = {
  _id: string;
  title: string;
  body: string;
  category: "general" | "important" | "schedule";
  createdAt: string;
  postedBy: { name: string };
};

const CATEGORY_STYLES: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  important: { bg: "bg-red-100", text: "text-red-600", label: "Important" },
  schedule: { bg: "bg-blue-100", text: "text-blue-600", label: "Schedule" },
  general: { bg: "bg-[#EEEDFC]", text: "text-[#5B4FE5]", label: "General" },
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "general", label: "General" },
  { key: "important", label: "Important" },
  { key: "schedule", label: "Schedule" },
];

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [postContent, setPostContent] = useState("");
  const [postSubmitting, setPostSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<
    "general" | "important" | "schedule"
  >("general");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [posts, setPosts] = useState<
    {
      _id: string;
      content: string;
      createdAt: string;
      postedBy: { name: string };
      likeCount: number;
      viewCount: number;
    }[]
  >([]);

  const fetchAnnouncements = async () => {
    try {
      setError("");
      const res = await api.get("/announcements");
      setAnnouncements(res.data);
    } catch (err) {
      setError("Could not load announcements.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await api.get("/posts");
      setPosts(res.data);
    } catch (err) {
      // non-critical, don't block the page on this
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    fetchPosts();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setTitle("");
    setBody("");
    setCategory("general");
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (a: Announcement) => {
    setEditingId(a._id);
    setTitle(a.title);
    setBody(a.body);
    setCategory(a.category);
    setFormError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/announcements/${editingId}`, { title, body, category });
      } else {
        await api.post("/announcements", { title, body, category });
      }
      setShowModal(false);
      await fetchAnnouncements();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this announcement? This cannot be undone.")) return;
    try {
      await api.delete(`/announcements/${id}`);
      await fetchAnnouncements();
    } catch (err) {
      alert("Could not delete announcement.");
    }
  };

  const filtered = announcements
    .filter((a) => activeFilter === "all" || a.category === activeFilter)
    .filter((a) => a.title.toLowerCase().includes(search.toLowerCase()));

  const handleCreatePost = async () => {
    if (!postContent.trim()) return;
    setPostSubmitting(true);
    try {
      await api.post("/posts", { content: postContent });
      setPostContent("");
      await fetchPosts();
    } catch (err) {
      alert("Could not create post.");
    } finally {
      setPostSubmitting(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    try {
      await api.delete(`/posts/${id}`);
      await fetchPosts();
    } catch (err) {
      alert("Could not delete post.");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-[#1A1B25]">Announcements</h1>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-[#5B4FE5] text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:opacity-90"
        >
          <Plus size={16} />
          New Announcement
        </button>
      </div>
      <p className="text-sm text-[#8A8DA3] mb-6">
        Post and manage official announcements for your department.
      </p>

      <div className="bg-white border border-[#E4E6F0] rounded-xl p-4 mb-6">
        <textarea
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          placeholder="What's on your mind? Share a quick update with your students..."
          rows={2}
          className="w-full text-sm outline-none resize-none placeholder:text-[#8A8DA3]"
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handleCreatePost}
            disabled={postSubmitting || !postContent.trim()}
            className="bg-[#5B4FE5] text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {postSubmitting ? "Posting..." : "Post"}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 bg-white border border-[#E4E6F0] rounded-lg px-3 py-2 flex-1 max-w-xs">
          <Search size={16} className="text-[#8A8DA3]" />
          <input
            type="text"
            placeholder="Search announcements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-sm outline-none flex-1"
          />
        </div>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`text-sm px-3 py-2 rounded-lg font-medium ${
              activeFilter === f.key
                ? "bg-[#5B4FE5] text-white"
                : "bg-white border border-[#E4E6F0] text-[#8A8DA3]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      <div className="bg-white border border-[#E4E6F0] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E4E6F0] text-left text-[#8A8DA3]">
              <th className="px-5 py-3 font-medium">Title</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Posted By</th>
              <th className="px-5 py-3 font-medium">Posted At</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-8 text-center text-[#8A8DA3]"
                >
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-8 text-center text-[#8A8DA3]"
                >
                  No announcements found.
                </td>
              </tr>
            ) : (
              filtered.map((a) => {
                const style =
                  CATEGORY_STYLES[a.category] || CATEGORY_STYLES.general;
                return (
                  <tr
                    key={a._id}
                    className="border-b border-[#E4E6F0] last:border-0"
                  >
                    <td className="px-5 py-3 font-semibold text-[#1A1B25] max-w-xs truncate">
                      {a.title}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded ${style.bg} ${style.text}`}
                      >
                        {style.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#8A8DA3]">
                      {a.postedBy?.name || "—"}
                    </td>
                    <td className="px-5 py-3 text-[#8A8DA3]">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(a)}
                          className="p-1.5 rounded hover:bg-[#F5F6FB] text-[#5B4FE5]"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(a._id)}
                          className="p-1.5 rounded hover:bg-[#F5F6FB] text-red-500"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#1A1B25]">
                {editingId ? "Edit Announcement" : "New Announcement"}
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
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-[#E4E6F0] rounded-lg px-3 py-2 mb-4 text-sm outline-none focus:ring-2 focus:ring-[#5B4FE5]"
                required
              />

              <label className="block text-sm font-medium text-[#1A1B25] mb-1">
                Body
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                className="w-full border border-[#E4E6F0] rounded-lg px-3 py-2 mb-4 text-sm outline-none focus:ring-2 focus:ring-[#5B4FE5]"
                required
              />

              <label className="block text-sm font-medium text-[#1A1B25] mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as typeof category)}
                className="w-full border border-[#E4E6F0] rounded-lg px-3 py-2 mb-4 text-sm outline-none focus:ring-2 focus:ring-[#5B4FE5]"
              >
                <option value="general">General</option>
                <option value="important">Important</option>
                <option value="schedule">Schedule</option>
              </select>

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
                    : "Post Announcement"}
              </button>
            </form>
          </div>
        </div>
      )}

      {posts.length > 0 && (
        <div className="mb-6 space-y-2">
          {posts.map((p) => (
            <div
              key={p._id}
              className="bg-white border border-[#E4E6F0] rounded-xl p-4 flex justify-between items-start"
            >
              <div>
                <p className="text-sm text-[#1A1B25]">{p.content}</p>
                <p className="text-xs text-[#8A8DA3] mt-1">
                  {p.postedBy?.name} · {new Date(p.createdAt).toLocaleString()}{" "}
                  · ❤ {p.likeCount} · 👁 {p.viewCount}
                </p>
              </div>
              <button
                onClick={() => handleDeletePost(p._id)}
                className="text-xs text-red-500 hover:underline ml-4 shrink-0"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
