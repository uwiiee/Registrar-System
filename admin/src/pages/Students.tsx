import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import api from "../lib/api";

type Student = {
  _id: string;
  name: string;
  email: string;
  studentId: string;
  department: string;
};

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/users/students");
        setStudents(res.data);
      } catch (err) {
        setError("Could not load students.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.studentId?.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1A1B25] mb-1">Students</h1>
      <p className="text-sm text-[#8A8DA3] mb-6">
        Directory of enrolled students.
      </p>

      <div className="flex items-center gap-2 bg-white border border-[#E4E6F0] rounded-lg px-3 py-2 max-w-xs mb-4">
        <Search size={16} className="text-[#8A8DA3]" />
        <input
          type="text"
          placeholder="Search by name, ID, or email..."
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
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Student ID</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Department</th>
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
                  No students found.
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr
                  key={s._id}
                  className="border-b border-[#E4E6F0] last:border-0"
                >
                  <td className="px-5 py-3 font-medium text-[#1A1B25]">
                    {s.name}
                  </td>
                  <td className="px-5 py-3 text-[#8A8DA3]">
                    {s.studentId || "—"}
                  </td>
                  <td className="px-5 py-3 text-[#8A8DA3]">{s.email}</td>
                  <td className="px-5 py-3 text-[#1A1B25]">{s.department}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
