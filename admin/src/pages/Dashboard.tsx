import { useState, useEffect } from "react";
import {
  Users,
  CheckCircle,
  CalendarCheck,
  ClipboardCheck,
  Megaphone,
} from "lucide-react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

type RegistrarStats = {
  type: "registrar";
  totalWaiting: number;
  currentlyServing: number;
  todaysAppointments: number;
  completedToday: number;
  queuePreview: {
    position: number;
    appointment: {
      _id: string;
      student: { name: string };
      service: { name: string };
      priorityTier: string;
    };
  }[];
  latestAnnouncement: {
    title: string;
    body: string;
    postedBy: { name: string };
  } | null;
};

type CourseStats = {
  type: "course";
  studentCount: number;
  announcementCount: number;
  recentAnnouncements: { _id: string; title: string; createdAt: string }[];
};

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="bg-white border border-[#E4E6F0] rounded-xl p-5 flex items-center gap-4">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: color + "20" }}
      >
        <Icon size={20} color={color} />
      </div>
      <div>
        <p className="text-sm text-[#8A8DA3]">{label}</p>
        <p className="text-2xl font-bold text-[#1A1B25]">{value}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<RegistrarStats | CourseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/dashboard/stats");
        setStats(res.data);
      } catch (err) {
        setError("Could not load dashboard.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <p className="text-[#8A8DA3]">Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!stats) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1A1B25] mb-1">Dashboard</h1>
      <p className="text-sm text-[#8A8DA3] mb-6">
        Welcome back, {user?.name}! Here's what's happening today.
      </p>

      {stats.type === "registrar" ? (
        <>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={Users}
              label="Total Waiting"
              value={stats.totalWaiting}
              color="#5B4FE5"
            />
            <StatCard
              icon={CheckCircle}
              label="Currently Serving"
              value={stats.currentlyServing}
              color="#10B981"
            />
            <StatCard
              icon={CalendarCheck}
              label="Today's Appointments"
              value={stats.todaysAppointments}
              color="#3B82F6"
            />
            <StatCard
              icon={ClipboardCheck}
              label="Completed Today"
              value={stats.completedToday}
              color="#F97316"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 bg-white border border-[#E4E6F0] rounded-xl p-5">
              <h2 className="text-sm font-bold text-[#1A1B25] mb-4">
                Current Queue
              </h2>
              {stats.queuePreview.length === 0 ? (
                <p className="text-sm text-[#8A8DA3]">Queue is empty.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[#8A8DA3] border-b border-[#E4E6F0]">
                      <th className="py-2 font-medium">#</th>
                      <th className="py-2 font-medium">Student</th>
                      <th className="py-2 font-medium">Service</th>
                      <th className="py-2 font-medium">Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.queuePreview.map((q) => (
                      <tr
                        key={q.appointment._id}
                        className="border-b border-[#E4E6F0] last:border-0"
                      >
                        <td className="py-2 font-semibold text-[#5B4FE5]">
                          {q.position}
                        </td>
                        <td className="py-2 text-[#1A1B25]">
                          {q.appointment.student?.name}
                        </td>
                        <td className="py-2 text-[#8A8DA3]">
                          {q.appointment.service?.name}
                        </td>
                        <td className="py-2 text-[#8A8DA3] capitalize">
                          {q.appointment.priorityTier}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="bg-white border border-[#E4E6F0] rounded-xl p-5">
              <h2 className="text-sm font-bold text-[#1A1B25] mb-3 flex items-center gap-2">
                <Megaphone size={16} color="#5B4FE5" />
                Latest Announcement
              </h2>
              {stats.latestAnnouncement ? (
                <>
                  <p className="text-sm font-semibold text-[#1A1B25] mb-1">
                    {stats.latestAnnouncement.title}
                  </p>
                  <p className="text-xs text-[#8A8DA3] mb-2">
                    {stats.latestAnnouncement.postedBy?.name}
                  </p>
                  <p className="text-sm text-[#8A8DA3] line-clamp-3">
                    {stats.latestAnnouncement.body}
                  </p>
                </>
              ) : (
                <p className="text-sm text-[#8A8DA3]">No announcements yet.</p>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <StatCard
              icon={Users}
              label="Students"
              value={stats.studentCount}
              color="#5B4FE5"
            />
            <StatCard
              icon={Megaphone}
              label="Announcements Posted"
              value={stats.announcementCount}
              color="#10B981"
            />
          </div>

          <div className="bg-white border border-[#E4E6F0] rounded-xl p-5">
            <h2 className="text-sm font-bold text-[#1A1B25] mb-4">
              Recent Announcements
            </h2>
            {stats.recentAnnouncements.length === 0 ? (
              <p className="text-sm text-[#8A8DA3]">
                No announcements posted yet.
              </p>
            ) : (
              <ul className="space-y-3">
                {stats.recentAnnouncements.map((a) => (
                  <li
                    key={a._id}
                    className="flex justify-between text-sm border-b border-[#F5F6FB] pb-3 last:border-0"
                  >
                    <span className="text-[#1A1B25] font-medium">
                      {a.title}
                    </span>
                    <span className="text-[#8A8DA3]">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
