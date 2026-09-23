import { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  StyleSheet,
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

export default function DepartmentDetailScreen() {
  const { department } = useLocalSearchParams<{ department: string }>();
  const router = useRouter();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/services");
        setServices(
          res.data.filter((s: Service) => s.department === department),
        );
      } catch (err) {
        setError("Could not load services.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [department]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: department }} />
      <FlatList
        style={styles.container}
        data={services}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>{department}</Text>
            <Text style={styles.subtitle}>
              Services for {department} students
            </Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Text style={styles.sectionTitle}>Available Services</Text>
          </>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: '/book/[serviceId]',
                params: { serviceId: item._id },
              })
            }
          >
            <View style={styles.iconCircle}>
              <Ionicons
                name="document-text-outline"
                size={18}
                color={COLORS.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardMeta}>
                {item.avgDurationMins} mins · {item.department}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={COLORS.textMuted}
            />
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={styles.textMuted}>No services in this department.</Text>
        }
      />
    </>
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
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
  },
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EEEDFC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  cardTitle: { fontSize: 14, fontWeight: "700", color: COLORS.text },
  cardMeta: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  error: { color: "#E5484D", marginBottom: 12 },
  textMuted: { color: COLORS.textMuted, marginTop: 12 },
});
