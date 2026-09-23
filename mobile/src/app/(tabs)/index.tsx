import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
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
  tagBg: "#FDE8E8",
  tagText: "#E5484D",
};

type Post = {
  _id: string;
  content: string;
  createdAt: string;
  postedBy: { name: string };
  likeCount: number;
  viewCount: number;
  likedByMe: boolean;
};

type Appointment = {
  _id: string;
  status: string;
  updatedAt: string;
  service: { name: string };
};

const timeAgo = (dateString: string) => {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

const STATUS_LABEL: Record<string, string> = {
  pending: "is pending confirmation",
  queued: "has been added to the queue",
  serving: "is now being served",
  done: "is complete",
  cancelled: "was cancelled",
};

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [recentAppointment, setRecentAppointment] =
    useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

const fetchData = async () => {
  try {
    setError("");
    const [postsRes, appointmentsRes] = await Promise.all([
      api.get("/posts"),
      api.get("/appointments"),
    ]);

    setPosts(postsRes.data.slice(0, 3));

    const sortedAppointments = [...appointmentsRes.data].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
    setRecentAppointment(sortedAppointments[0] || null);
  } catch (err: any) {
    console.log("DASHBOARD FETCH ERROR:", err.response?.status, err.response?.data, err.message);
    setError("Could not load your dashboard.");
  }
};

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    };
    load();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

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
      data={posts}
      keyExtractor={(item) => item._id}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      ListHeaderComponent={
        <>
          {/* Top bar: logo + school name + bell + profile */}
          <View style={styles.topBar}>
            <View style={styles.brandRow}>
              <View style={styles.logoCircle}>
                <Ionicons name="school" size={20} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.brandName}>Silay Institute</Text>
                <Text style={styles.brandTagline}>
                  School Services Made Easier
                </Text>
              </View>
            </View>
            <View style={styles.topBarIcons}>
              <Pressable style={styles.iconButton}>
                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color={COLORS.text}
                />
                <View style={styles.notificationDot} />
              </Pressable>
              <Pressable
                style={styles.iconButton}
                onPress={() => router.push("/profile")}
              >
                <Ionicons
                  name="person-circle-outline"
                  size={26}
                  color={COLORS.primary}
                />
              </Pressable>
            </View>
          </View>

          <Text style={styles.greeting}>
            {greeting()},{" "}
            <Text style={{ fontWeight: "700" }}>
              {user?.name?.split(" ")[0]}
            </Text>{" "}
          </Text>

          {/* Search bar (visual only for now) */}
          <View style={styles.searchBar}>
            <Ionicons
              name="search-outline"
              size={18}
              color={COLORS.textMuted}
            />
            <TextInput
              placeholder="Search posts, services, or updates..."
              placeholderTextColor={COLORS.textMuted}
              style={styles.searchInput}
            />
          </View>

          {/* Recent Activity — real data, most recently updated appointment */}
          {recentAppointment && (
            <>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <View style={styles.activityCard}>
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color={COLORS.primary}
                />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.activityText}>
                    Your appointment for {recentAppointment.service?.name}{" "}
                    {STATUS_LABEL[recentAppointment.status]}.
                  </Text>
                  <Text style={styles.cardMeta}>
                    {timeAgo(recentAppointment.updatedAt)}
                  </Text>
                </View>
              </View>
            </>
          )}

          {/* Latest Posts header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Latest Posts</Text>
            <Pressable onPress={() => router.push("/(tabs)/announcements")}>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </>
      }
      renderItem={({ item }) => (
        <Pressable
          style={styles.card}
          onPress={() => api.post(`/posts/${item._id}/view`).catch(() => {})}
        >
          <View style={styles.cardHeader}>
            <View style={styles.postIcon}>
              <Ionicons name="person" size={16} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.postAuthor}>
                {item.postedBy?.name || "Admin"}
              </Text>
              <Text style={styles.cardMeta}>{timeAgo(item.createdAt)}</Text>
            </View>
          </View>
          <Text style={styles.cardBody}>{item.content}</Text>
          <View style={styles.postStats}>
            <Pressable
              style={styles.likeButton}
              onPress={async (e) => {
                e.stopPropagation(); // don't also trigger the card's view-recording press
                try {
                  const res = await api.post(`/posts/${item._id}/like`);
                  setPosts((prev) =>
                    prev.map((p) =>
                      p._id === item._id
                        ? {
                            ...p,
                            likeCount: res.data.likeCount,
                            likedByMe: res.data.likedByMe,
                          }
                        : p,
                    ),
                  );
                } catch (err) {
                  // silently ignore — not critical if a like fails
                }
              }}
            >
              <Ionicons
                name={item.likedByMe ? "heart" : "heart-outline"}
                size={14}
                color={item.likedByMe ? "#E5484D" : COLORS.textMuted}
              />
              <Text style={styles.postStatText}>{item.likeCount}</Text>
            </Pressable>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginLeft: 10,
              }}
            >
              <Ionicons name="eye-outline" size={14} color={COLORS.textMuted} />
              <Text style={styles.postStatText}>{item.viewCount}</Text>
            </View>
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { justifyContent: "center", alignItems: "center" },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  brandRow: { flexDirection: "row", alignItems: "center" },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EEEDFC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  brandName: { fontSize: 14, fontWeight: "700", color: COLORS.text },
  brandTagline: { fontSize: 11, color: COLORS.textMuted },
  topBarIcons: { flexDirection: "row", alignItems: "center" },
  iconButton: { marginLeft: 14 },
  notificationDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.tagText,
  },
  greeting: { fontSize: 20, color: COLORS.text, marginBottom: 16 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 24,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: COLORS.text },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 8,
  },
  seeAll: { fontSize: 13, color: COLORS.primary, fontWeight: "600" },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activityText: { fontSize: 13, color: COLORS.text, lineHeight: 18 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  postIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#EEEDFC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  postAuthor: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  cardMeta: { fontSize: 11, color: COLORS.textMuted },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
    marginTop: 2,
  },
  cardBody: { fontSize: 13, color: COLORS.text, lineHeight: 18 },
  error: { color: COLORS.tagText, marginBottom: 12 },
  textMuted: { color: COLORS.textMuted, marginTop: 12 },

  postStats: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  postStatText: { fontSize: 12, color: COLORS.textMuted, marginLeft: 4 },
  likeButton: { flexDirection: "row", alignItems: "center" },
});
