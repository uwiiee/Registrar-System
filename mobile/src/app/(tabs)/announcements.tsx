import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { useFocusEffect } from "expo-router";
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

const CATEGORY_STYLES: Record<string, { bg: string; text: string; icon: any }> =
  {
    important: { bg: "#FDE8E8", text: "#E5484D", icon: "megaphone" },
    schedule: { bg: "#E5EEFF", text: "#3B5BDB", icon: "calendar" },
    general: { bg: "#EEEDFC", text: "#5B4FE5", icon: "information-circle" },
  };

const FILTERS = [
  { key: "all", label: "All" },
  { key: "important", label: "Important" },
  { key: "schedule", label: "Schedules" },
  { key: "general", label: "General" },
];

type Announcement = {
  _id: string;
  title: string;
  body: string;
  category: string;
  createdAt: string;
  postedBy: { name: string };
};

const timeAgo = (dateString: string) => {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const days = Math.floor(diffMs / 86400000);
  if (days < 1) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
};

export default function AnnouncementsScreen() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchAnnouncements = async () => {
    try {
      setError("");
      const res = await api.get("/announcements");
      setAnnouncements(res.data);
    } catch (err) {
      setError("Could not load announcements.");
    }
  };

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        setLoading(true);
        await fetchAnnouncements();
        setLoading(false);
      };
      load();
    }, []),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAnnouncements();
    setRefreshing(false);
  }, []);

  const filtered =
    activeFilter === "all"
      ? announcements
      : announcements.filter((a) => a.category === activeFilter);

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
      data={filtered}
      keyExtractor={(item) => item._id}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      ListHeaderComponent={
        <>
          <Text style={styles.title}>Announcements</Text>
          <Text style={styles.subtitle}>
            Official updates and important notices
          </Text>

          <View style={styles.filterRow}>
            {FILTERS.map((f) => {
              const isActive = activeFilter === f.key;
              return (
                <Pressable
                  key={f.key}
                  style={[
                    styles.filterChip,
                    isActive && styles.filterChipActive,
                  ]}
                  onPress={() => setActiveFilter(f.key)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      isActive && styles.filterTextActive,
                    ]}
                  >
                    {f.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </>
      }
      renderItem={({ item }) => {
        const style = CATEGORY_STYLES[item.category] || CATEGORY_STYLES.general;
        return (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconCircle, { backgroundColor: style.bg }]}>
                <Ionicons name={style.icon} size={16} color={style.text} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardMeta}>
                  {timeAgo(item.createdAt)} · {item.postedBy?.name}
                </Text>
              </View>
            </View>
            <Text style={styles.cardBody}>{item.body}</Text>
            {item.category !== "general" && (
              <View style={[styles.tag, { backgroundColor: style.bg }]}>
                <Text style={[styles.tagText, { color: style.text }]}>
                  {item.category === "important" ? "Important" : "Schedule"}
                </Text>
              </View>
            )}
          </View>
        );
      }}
      ListEmptyComponent={
        <Text style={styles.textMuted}>No announcements in this category.</Text>
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
  subtitle: { fontSize: 13, color: COLORS.textMuted, marginBottom: 16 },
  filterRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 16 },
  filterChip: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: { fontSize: 13, color: COLORS.textMuted, fontWeight: "600" },
  filterTextActive: { color: "#fff" },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  cardTitle: { fontSize: 14, fontWeight: "700", color: COLORS.text },
  cardMeta: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  cardBody: { fontSize: 13, color: COLORS.text, lineHeight: 18 },
  tag: {
    alignSelf: "flex-start",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 10,
  },
  tagText: { fontSize: 11, fontWeight: "600" },
  error: { color: "#E5484D", marginBottom: 12 },
  textMuted: { color: COLORS.textMuted, marginTop: 12 },
});
