import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const COLORS = {
  primary: "#5B4FE5",
  background: "#F5F6FB",
  card: "#FFFFFF",
  border: "#E4E6F0",
  text: "#1A1B25",
  textMuted: "#8A8DA3",
};

const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  pending: { bg: "#FFF4E5", text: "#B76E00", label: "Pending" },
  queued: { bg: "#E5EEFF", text: "#3B5BDB", label: "Queued" },
  serving: { bg: "#E6F7EE", text: "#1E9E5A", label: "Serving" },
  done: { bg: "#E6F7EE", text: "#1E9E5A", label: "Completed" },
  cancelled: { bg: "#FDE8E8", text: "#E5484D", label: "Cancelled" },
};

type Appointment = {
  _id: string;
  status: string;
  preferredDate: string;
  priorityTier: string;
  service: { name: string; department: string };
  student?: { name: string };
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <View style={[badgeStyles.badge, { backgroundColor: s.bg }]}>
      <Text style={[badgeStyles.text, { color: s.text }]}>{s.label}</Text>
    </View>
  );
}

export default function AppointmentsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const isStaff = user?.role === "admin";

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchAppointments = async () => {
    try {
      setError("");
      // staff sees the live computed queue order; students see their own list
      const endpoint = isStaff ? "/appointments/queue" : "/appointments";
      const res = await api.get(endpoint);
      const list = isStaff ? res.data.map((q: any) => q.appointment) : res.data;
      setAppointments(list);
    } catch (err) {
      setError("Could not load appointments.");
    }
  };

  const handleCancel = (appointmentId: string) => {
    Alert.alert(
      "Cancel Appointment",
      "Are you sure you want to cancel this appointment?",
      [
        { text: "No, keep it", style: "cancel" },
        {
          text: "Yes, cancel",
          style: "destructive",
          onPress: async () => {
            try {
              await api.put(`/appointments/${appointmentId}/cancel`);
              await fetchAppointments(); // refetch so the list reflects the new status
            } catch (err) {
              Alert.alert(
                "Error",
                "Could not cancel appointment. Please try again.",
              );
            }
          },
        },
      ],
    );
  };

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        setLoading(true);
        await fetchAppointments();
        setLoading(false);
      };
      load();
    }, []),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
  }, []);

  const upcoming = appointments.filter((a) =>
    ["pending", "queued", "serving"].includes(a.status),
  );
  const history = appointments.filter((a) =>
    ["done", "cancelled"].includes(a.status),
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={isStaff ? upcoming : history} // staff: one flat live queue; students: history below upcoming
      keyExtractor={(item) => item._id}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      ListHeaderComponent={
        <>
          <Text style={styles.title}>{isStaff ? "Queue" : "Appointments"}</Text>
          <Text style={styles.subtitle}>
            {isStaff
              ? "Live queue, ordered by priority and deadline"
              : "Book and manage your appointments"}
          </Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {!isStaff && (
            <Pressable
              style={styles.ctaCard}
              onPress={() => router.push("/(tabs)/departments" as any)}
            >
              <View style={styles.ctaIcon}>
                <Ionicons name="calendar" size={22} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.ctaTitle}>Book a New Appointment</Text>
                <Text style={styles.ctaSubtitle}>
                  Choose a service and preferred date/time
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#fff" />
            </Pressable>
          )}

          {!isStaff && upcoming.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
              {upcoming.map((appt) => (
                <View key={appt._id} style={styles.card}>
                  <View style={styles.cardTop}>
                    <Text style={styles.cardTitle}>{appt.service?.name}</Text>
                    <StatusBadge status={appt.status} />
                  </View>
                  <View style={styles.cardRow}>
                    <Ionicons
                      name="calendar-outline"
                      size={14}
                      color={COLORS.textMuted}
                    />
                    <Text style={styles.cardMeta}>
                      {new Date(appt.preferredDate).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.cardRow}>
                    <Ionicons
                      name="location-outline"
                      size={14}
                      color={COLORS.textMuted}
                    />
                    <Text style={styles.cardMeta}>
                      {appt.service?.department}
                    </Text>
                  </View>

                  {appt.status !== "serving" && (
                    <Pressable
                      style={styles.cancelButton}
                      onPress={() => handleCancel(appt._id)}
                    >
                      <Ionicons
                        name="close-circle-outline"
                        size={16}
                        color="#E5484D"
                      />
                      <Text style={styles.cancelButtonText}>
                        Cancel Appointment
                      </Text>
                    </Pressable>
                  )}
                </View>
              ))}
            </>
          )}

          {isStaff && (
            <Text style={styles.sectionTitle}>
              {upcoming.length} waiting — ordered by priority
            </Text>
          )}

          {!isStaff && (
            <Text style={styles.sectionTitle}>Appointment History</Text>
          )}
        </>
      }
      renderItem={({ item, index }) => (
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {isStaff && (
                <Text style={styles.queuePosition}>#{index + 1}</Text>
              )}
              <View>
                <Text style={styles.cardTitle}>{item.service?.name}</Text>
                {isStaff && (
                  <Text style={styles.cardMeta}>{item.student?.name}</Text>
                )}
              </View>
            </View>
            <StatusBadge status={item.status} />
          </View>
          {!isStaff && (
            <View style={styles.cardRow}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color={COLORS.textMuted}
              />
              <Text style={styles.cardMeta}>
                {new Date(item.preferredDate).toLocaleDateString()}
              </Text>
            </View>
          )}
          {isStaff && item.priorityTier === "urgent" && (
            <View style={styles.urgentTag}>
              <Text style={styles.urgentText}>Urgent</Text>
            </View>
          )}
        </View>
      )}
      ListEmptyComponent={
        <Text style={styles.textMuted}>
          {isStaff ? "Queue is empty." : "No appointment history yet."}
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { justifyContent: "center", alignItems: "center" },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: { fontSize: 13, color: COLORS.textMuted, marginBottom: 20 },
  ctaCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  ctaIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  ctaTitle: { color: "#fff", fontWeight: "700", fontSize: 14 },
  ctaSubtitle: { color: "rgba(255,255,255,0.85)", fontSize: 12, marginTop: 2 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  cardTitle: { fontSize: 14, fontWeight: "700", color: COLORS.text },
  cardRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  cardMeta: { fontSize: 12, color: COLORS.textMuted, marginLeft: 6 },
  queuePosition: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primary,
    marginRight: 8,
  },
  urgentTag: {
    alignSelf: "flex-start",
    backgroundColor: "#FDE8E8",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 8,
  },
  urgentText: { fontSize: 11, color: "#E5484D", fontWeight: "600" },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
  },
  cancelButtonText: {
    color: "#E5484D",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 6,
  },
  error: { color: "#E5484D", marginBottom: 12 },
  textMuted: { color: COLORS.textMuted, marginTop: 12 },
});

const badgeStyles = StyleSheet.create({
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  text: { fontSize: 11, fontWeight: "600" },
});
