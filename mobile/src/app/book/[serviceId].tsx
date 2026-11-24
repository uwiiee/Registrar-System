import { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
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

// Earliest bookable day: tomorrow (same rule as before — no same-day booking)
const getTomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Default time shown in the picker: 9:00 AM
const getDefaultTime = () => {
  const t = new Date();
  t.setHours(9, 0, 0, 0);
  return t;
};

// Office hours (same as the old slot list): 8:00 AM–12:00 PM and 1:00 PM–4:30 PM
const isWithinOfficeHours = (t: Date) => {
  const mins = t.getHours() * 60 + t.getMinutes();
  return (
    (mins >= 8 * 60 && mins < 12 * 60) ||
    (mins >= 13 * 60 && mins <= 16 * 60 + 30)
  );
};

const formatDate = (d: Date) =>
  d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

const formatTime = (t: Date) =>
  t.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

export default function BookAppointmentScreen() {
  const { serviceId } = useLocalSearchParams<{ serviceId: string }>();
  const router = useRouter();

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<"datetime" | "confirm">("datetime");
  const [selectedDate, setSelectedDate] = useState<Date>(getTomorrow());
  const [selectedTime, setSelectedTime] = useState<Date>(getDefaultTime());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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

  // Android opens the system calendar / clock dialogs
  const openAndroidDatePicker = () =>
    DateTimePickerAndroid.open({
      value: selectedDate,
      mode: "date",
      minimumDate: getTomorrow(),
      onChange: (_event, date) => {
        if (date) setSelectedDate(date);
      },
    });

  const openAndroidTimePicker = () =>
    DateTimePickerAndroid.open({
      value: selectedTime,
      mode: "time",
      is24Hour: false,
      onChange: (_event, time) => {
        if (time) setSelectedTime(time);
      },
    });

  const handleNext = () => {
    if (!isWithinOfficeHours(selectedTime)) {
      setError(
        "Please choose a time between 8:00 AM–12:00 PM or 1:00 PM–4:30 PM.",
      );
      return;
    }
    setError("");
    setStep("confirm");
  };

  const handleConfirmBooking = async () => {
    setSubmitting(true);
    setError("");
    try {
      // combine the chosen date + chosen time into one datetime
      const preferredDate = new Date(selectedDate);
      preferredDate.setHours(
        selectedTime.getHours(),
        selectedTime.getMinutes(),
        0,
        0,
      );

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
            {Platform.OS === "android" ? (
              <Pressable
                style={styles.pickerField}
                onPress={openAndroidDatePicker}
              >
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={COLORS.primary}
                />
                <Text style={styles.pickerFieldText}>
                  {formatDate(selectedDate)}
                </Text>
              </Pressable>
            ) : (
              <View style={styles.pickerCard}>
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="inline"
                  minimumDate={getTomorrow()}
                  onChange={(_event, date) => {
                    if (date) setSelectedDate(date);
                  }}
                />
              </View>
            )}

            <Text style={styles.sectionTitle}>Select Time</Text>
            {Platform.OS === "android" ? (
              <Pressable
                style={styles.pickerField}
                onPress={openAndroidTimePicker}
              >
                <Ionicons
                  name="time-outline"
                  size={18}
                  color={COLORS.primary}
                />
                <Text style={styles.pickerFieldText}>
                  {formatTime(selectedTime)}
                </Text>
              </Pressable>
            ) : (
              <View style={styles.pickerCard}>
                <DateTimePicker
                  value={selectedTime}
                  mode="time"
                  display="spinner"
                  onChange={(_event, time) => {
                    if (time) setSelectedTime(time);
                  }}
                />
              </View>
            )}
            <Text style={styles.hoursHint}>
              Office hours: 8:00 AM–12:00 PM and 1:00 PM–4:30 PM
            </Text>

            <Pressable style={styles.button} onPress={handleNext}>
              <Text style={styles.buttonText}>Next</Text>
            </Pressable>
          </>
        )}

        {step === "confirm" && (
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
                  {formatDate(selectedDate)}
                </Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Time</Text>
                <Text style={styles.confirmValue}>
                  {formatTime(selectedTime)}
                </Text>
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
  pickerField: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 20,
  },
  pickerFieldText: { marginLeft: 10, fontSize: 14, color: COLORS.text },
  pickerCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 8,
    marginBottom: 20,
    alignItems: "center",
  },
  hoursHint: { fontSize: 12, color: COLORS.textMuted, marginBottom: 20 },
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
