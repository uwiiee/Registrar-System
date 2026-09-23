import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";

const COLORS = {
  primary: "#5B4FE5",
  background: "#F5F6FB",
  card: "#FFFFFF",
  border: "#E4E6F0",
  text: "#1A1B25",
  textMuted: "#8A8DA3",
  error: "#E5484D",
};

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Custom header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/(tabs)");
            }
          }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.avatarSection}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitials}>
            {user?.name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>
            {user?.role === "admin" ? "admin" : "Student"}
          </Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={18} color={COLORS.textMuted} />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>
        </View>

        {user?.role === "student" && (
          <View style={styles.infoRow}>
            <Ionicons
              name="id-card-outline"
              size={18}
              color={COLORS.textMuted}
            />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.infoLabel}>Student ID</Text>
              <Text style={styles.infoValue}>
                {(user as any)?.studentId || "Not set"}
              </Text>
            </View>
          </View>
        )}
      </View>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    marginTop: 10,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: "700", color: COLORS.text },
  avatarSection: { alignItems: "center", marginBottom: 24 },
  avatarCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#EEEDFC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarInitials: { fontSize: 28, fontWeight: "700", color: COLORS.primary },
  name: { fontSize: 18, fontWeight: "700", color: COLORS.text },
  roleBadge: {
    backgroundColor: "#EEEDFC",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 8,
  },
  roleBadgeText: { fontSize: 12, fontWeight: "600", color: COLORS.primary },
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  infoRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  infoLabel: { fontSize: 11, color: COLORS.textMuted },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#FDE8E8",
  },
  logoutText: {
    color: COLORS.error,
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 8,
  },
});
