import { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import api from "@/lib/api";

const COLORS = {
  primary: "#5B4FE5",
  background: "#F5F6FB",
  card: "#FFFFFF",
  border: "#E4E6F0",
  text: "#1A1B25",
  textMuted: "#8A8DA3",
};

type Service = {
  _id: string;
  name: string;
  description: string;
  avgDurationMins: number;
  department: string;
};

const TIME_SLOTS = [
  "8:00 AM",
  "8:30 AM",
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
];

// Next 7 days, skipping nothing for now (weekends included — office-hours logic can be added later)
const getNextDays = (count: number) => {
  const days = [];
  for (let i = 1; i <= count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
};

export default function BookAppointmentScreen() {
  const { serviceId } = useLocalSearchParams<{ serviceId: string }>();
  const router = useRouter();

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<"datetime" | "confirm">("datetime");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const days = useMemo(() => getNextDays(7), []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/services/${serviceId}`);
        setService(res.data);
      } catch (err) {
        setError("Could not load service details.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [serviceId]);

  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedSlot) return;

    setSubmitting(true);
    setError("");
    try {
      // combine selected date + slot into one ISO datetime
      const [time, meridiem] = selectedSlot.split(" ");
      let [hours, minutes] = time.split(":").map(Number);
      if (meridiem === "PM" && hours !== 12) hours += 12;
      if (meridiem === "AM" && hours === 12) hours = 0;

      const preferredDate = new Date(selectedDate);
      preferredDate.setHours(hours, minutes, 0, 0);

      await api.post("/appointments", {
        service: serviceId,
        preferredDate: preferredDate.toISOString(),
        priorityTier: "normal",
      });

      Alert.alert(
        "Appointment Booked",
        "Your appointment has been requested successfully.",
        [{ text: "OK", onPress: () => router.replace("/(tabs)/appointments") }],
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Booking failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{ headerShown: true, title: "Book Appointment" }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
      >
        {/* Step indicator */}
        <View style={styles.stepRow}>
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, styles.stepCircleDone]}>
              <Ionicons name="checkmark" size={14} color="#fff" />
            </View>
            <Text style={styles.stepLabel}>Service</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={styles.stepItem}>
            <View
              style={[
                styles.stepCircle,
                step === "datetime"
                  ? styles.stepCircleActive
                  : styles.stepCircleDone,
              ]}
            >
              <Text style={styles.stepNumber}>2</Text>
            </View>
            <Text style={styles.stepLabel}>Date & Time</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={styles.stepItem}>
            <View
              style={[
                styles.stepCircle,
                step === "confirm" && styles.stepCircleActive,
              ]}
            >
              <Text style={styles.stepNumber}>3</Text>
            </View>
            <Text style={styles.stepLabel}>Confirm</Text>
          </View>
        </View>

        {service && (
          <View style={styles.serviceSummary}>
            <Ionicons
              name="document-text-outline"
              size={18}
              color={COLORS.primary}
            />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.serviceSummaryTitle}>{service.name}</Text>
              <Text style={styles.serviceSummaryMeta}>
                {service.department} · {service.avgDurationMins} mins
              </Text>
            </View>
          </View>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {step === "datetime" && (
          <>
            <Text style={styles.sectionTitle}>Select Date</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 24 }}
            >
              {days.map((d) => {
                const isSelected =
                  selectedDate?.toDateString() === d.toDateString();
                return (
                  <Pressable
                    key={d.toISOString()}
                    style={[styles.dayChip, isSelected && styles.dayChipActive]}
                    onPress={() => setSelectedDate(d)}
                  >
                    <Text
                      style={[
                        styles.dayChipWeekday,
                        isSelected && styles.dayChipTextActive,
                      ]}
                    >
                      {d.toLocaleDateString(undefined, { weekday: "short" })}
                    </Text>
                    <Text
                      style={[
                        styles.dayChipNumber,
                        isSelected && styles.dayChipTextActive,
                      ]}
                    >
                      {d.getDate()}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={styles.sectionTitle}>Select Time</Text>
            <View style={styles.slotGrid}>
              {TIME_SLOTS.map((slot) => {
                const isSelected = selectedSlot === slot;
                return (
                  <Pressable
                    key={slot}
                    style={[
                      styles.slotChip,
                      isSelected && styles.slotChipActive,
                    ]}
                    onPress={() => setSelectedSlot(slot)}
                  >
                    <Text
                      style={[
                        styles.slotText,
                        isSelected && styles.dayChipTextActive,
                      ]}
                    >
                      {slot}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              style={[
                styles.button,
                (!selectedDate || !selectedSlot) && styles.buttonDisabled,
              ]}
              disabled={!selectedDate || !selectedSlot}
              onPress={() => setStep("confirm")}
            >
              <Text style={styles.buttonText}>Next</Text>
            </Pressable>
          </>
        )}

        {step === "confirm" && selectedDate && selectedSlot && (
          <>
            <Text style={styles.sectionTitle}>Confirm Details</Text>
            <View style={styles.confirmCard}>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Service</Text>
                <Text style={styles.confirmValue}>{service?.name}</Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Department</Text>
                <Text style={styles.confirmValue}>{service?.department}</Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Date</Text>
                <Text style={styles.confirmValue}>
                  {selectedDate.toDateString()}
                </Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Time</Text>
                <Text style={styles.confirmValue}>{selectedSlot}</Text>
              </View>
            </View>

            <Pressable
              style={styles.backLink}
              onPress={() => setStep("datetime")}
            >
              <Text style={styles.backLinkText}>← Change date/time</Text>
            </Pressable>

            <Pressable
              style={[styles.button, submitting && styles.buttonDisabled]}
              disabled={submitting}
              onPress={handleConfirmBooking}
            >
              <Text style={styles.buttonText}>
                {submitting ? "Booking..." : "Confirm Booking"}
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { justifyContent: "center", alignItems: "center" },
  stepRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  stepItem: { alignItems: "center" },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  stepCircleActive: { backgroundColor: COLORS.primary },
  stepCircleDone: { backgroundColor: "#10B981" },
  stepNumber: { color: "#fff", fontWeight: "700", fontSize: 12 },
  stepLabel: { fontSize: 10, color: COLORS.textMuted, marginTop: 4 },
  stepLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 6,
    marginBottom: 16,
  },
  serviceSummary: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  serviceSummaryTitle: { fontSize: 14, fontWeight: "700", color: COLORS.text },
  serviceSummaryMeta: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
  },
  dayChip: {
    width: 56,
    height: 64,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  dayChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayChipWeekday: { fontSize: 11, color: COLORS.textMuted },
  dayChipNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 2,
  },
  dayChipTextActive: { color: "#fff" },
  slotGrid: { flexDirection: "row", flexWrap: "wrap", marginBottom: 24 },
  slotChip: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  slotChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  slotText: { fontSize: 13, color: COLORS.text },
  confirmCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  confirmRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  confirmLabel: { fontSize: 13, color: COLORS.textMuted },
  confirmValue: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  backLink: { marginBottom: 16 },
  backLinkText: { color: COLORS.primary, fontSize: 13, fontWeight: "600" },
  button: {
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  error: { color: "#E5484D", marginBottom: 12 },
});
