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

const COLORS = {
  primary: "#5B4FE5",
  background: "#F5F6FB",
  card: "#FFFFFF",
  border: "#E4E6F0",
  text: "#1A1B25",
  textMuted: "#8A8DA3",
};

const BADGE_COLORS = [
  "#5B4FE5",
  "#0EA5A5",
  "#F97316",
  "#E5484D",
  "#10B981",
  "#6366F1",
];

type Service = {
  _id: string;
  name: string;
  department: string;
  avgDurationMins: number;
};

type DepartmentGroup = {
  name: string;
  count: number;
  color: string;
};

export default function DepartmentsScreen() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchServices = async () => {
    try {
      setError("");
      const res = await api.get("/services");
      setServices(res.data);
    } catch (err) {
      setError("Could not load departments.");
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchServices();
      setLoading(false);
    };
    load();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchServices();
    setRefreshing(false);
  }, []);

  // Group services by department -> [{ name, count, color }]
  const departments: DepartmentGroup[] = Object.values(
    services.reduce((acc: Record<string, DepartmentGroup>, service) => {
      if (!acc[service.department]) {
        acc[service.department] = {
          name: service.department,
          count: 0,
          color: BADGE_COLORS[Object.keys(acc).length % BADGE_COLORS.length],
        };
      }
      acc[service.department].count += 1;
      return acc;
    }, {}),
  ).filter((d) => d.name.toLowerCase().includes(search.toLowerCase()));

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
      data={departments}
      keyExtractor={(item) => item.name}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      ListHeaderComponent={
        <>
          <Text style={styles.title}>Departments</Text>
          <Text style={styles.subtitle}>
            Select a department to view services
          </Text>

          <View style={styles.searchBar}>
            <Ionicons
              name="search-outline"
              size={18}
              color={COLORS.textMuted}
            />
            <TextInput
              placeholder="Search departments..."
              placeholderTextColor={COLORS.textMuted}
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </>
      }
      renderItem={({ item }) => (
        <Pressable
          style={styles.card}
          onPress={() =>
            router.push({
              pathname: "/(tabs)/departments/[department]",
              params: { department: item.name },
            })
          }
        >
          <View style={[styles.iconCircle, { backgroundColor: item.color }]}>
            <Text style={styles.iconInitials}>
              {item.name.slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardMeta}>
              {item.count} service{item.count !== 1 ? "s" : ""} available
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </Pressable>
      )}
      ListEmptyComponent={
        <Text style={styles.textMuted}>No departments found.</Text>
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
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 20,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: COLORS.text },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  iconInitials: { color: "#fff", fontWeight: "700", fontSize: 14 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  cardMeta: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  error: { color: "#E5484D", marginBottom: 12 },
  textMuted: { color: COLORS.textMuted, marginTop: 12 },
});
