import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Circle } from "lucide-react";
import api from "../lib/api";

type Appointment = {
  _id: string;
  status: string;
  preferredDate: string;
  priorityTier: "normal" | "urgent";
  student: { name: string; studentId: string };
  service: { name: string; avgDurationMins: number };
};

type QueueEntry = {
  position: number;
  estimatedWaitMins: number;
  appointment: Appointment;
};

const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  pending: { bg: "bg-orange-100", text: "text-orange-600", label: "Waiting" },
  queued: { bg: "bg-orange-100", text: "text-orange-600", label: "Waiting" },
  serving: { bg: "bg-green-100", text: "text-green-600", label: "Serving" },
};

export default function Queue() {
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [serving, setServing] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actingOn, setActingOn] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError("");
      const [queueRes, allRes] = await Promise.all([
        api.get("/appointments/queue"),
        api.get("/appointments"),
      ]);
      setQueue(queueRes.data);
      setServing(
        allRes.data.filter((a: Appointment) => a.status === "serving"),
      );
    } catch (err) {
      setError("Could not load queue.");
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchData().finally(() => setLoading(false));

    // poll every 15s so the queue feels "live" without needing a manual refresh
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleStatusChange = async (id: string, status: string) => {
    setActingOn(id);
    try {
      await api.put(`/appointments/${id}/status`, { status });
      await fetchData();
    } catch (err) {
      alert("Could not update status.");
    } finally {
      setActingOn(null);
    }
  };

  const totalInQueue = queue.length;
  const avgWait =
    queue.length > 0
      ? Math.round(
          queue.reduce((sum, q) => sum + q.estimatedWaitMins, 0) / queue.length,
        )
      : 0;

  // combine: serving rows first, then the ranked queue
  const rows = [
    ...serving.map((a) => ({
      appointment: a,
      position: null as number | null,
    })),
    ...queue.map((q) => ({ appointment: q.appointment, position: q.position })),
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-[#1A1B25]">Queue Management</h1>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-100 px-2.5 py-1 rounded-full">
            <Circle size={8} className="fill-green-600" />
            Live
          </span>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 border border-[#E4E6F0] bg-white text-sm font-medium px-3 py-2 rounded-lg text-[#1A1B25] hover:bg-[#F5F6FB]"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>
      <p className="text-sm text-[#8A8DA3] mb-6">
        View and manage the current service queue.
      </p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-[#E4E6F0] rounded-xl p-5">
          <p className="text-sm text-[#8A8DA3] mb-1">Total in Queue</p>
          <p className="text-2xl font-bold text-[#1A1B25]">{totalInQueue}</p>
        </div>
        <div className="bg-white border border-[#E4E6F0] rounded-xl p-5">
          <p className="text-sm text-[#8A8DA3] mb-1">Currently Serving</p>
          <p className="text-2xl font-bold text-[#1A1B25]">{serving.length}</p>
        </div>
        <div className="bg-white border border-[#E4E6F0] rounded-xl p-5">
          <p className="text-sm text-[#8A8DA3] mb-1">Average Wait Time</p>
          <p className="text-2xl font-bold text-[#1A1B25]">{avgWait} min</p>
        </div>
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      <div className="bg-white border border-[#E4E6F0] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E4E6F0] text-left text-[#8A8DA3]">
              <th className="px-5 py-3 font-medium">#</th>
              <th className="px-5 py-3 font-medium">Student Name</th>
              <th className="px-5 py-3 font-medium">Student ID</th>
              <th className="px-5 py-3 font-medium">Service</th>
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
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-8 text-center text-[#8A8DA3]"
                >
                  Queue is empty.
                </td>
              </tr>
            ) : (
              rows.map(({ appointment: a, position }) => {
                const style = STATUS_STYLES[a.status] || STATUS_STYLES.pending;
                return (
                  <tr
                    key={a._id}
                    className="border-b border-[#E4E6F0] last:border-0"
                  >
                    <td className="px-5 py-3 font-semibold text-[#5B4FE5]">
                      {position ?? "—"}
                    </td>
                    <td className="px-5 py-3 font-medium text-[#1A1B25]">
                      {a.student?.name}
                    </td>
                    <td className="px-5 py-3 text-[#8A8DA3]">
                      {a.student?.studentId}
                    </td>
                    <td className="px-5 py-3 text-[#1A1B25]">
                      {a.service?.name}
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
                      {a.status === "serving" ? (
                        <button
                          onClick={() => handleStatusChange(a._id, "done")}
                          disabled={actingOn === a._id}
                          className="bg-[#5B4FE5] text-white text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-60"
                        >
                          Complete
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(a._id, "serving")}
                          disabled={actingOn === a._id}
                          className="border border-[#E4E6F0] text-[#1A1B25] text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[#F5F6FB] disabled:opacity-60"
                        >
                          Call Next
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
