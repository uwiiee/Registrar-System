import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { Modal, FlatList } from "react-native";
import { DEPARTMENTS } from "@/constants/departments";

const COLORS = {
  primary: "#5B4FE5",
  background: "#F5F6FB",
  card: "#FFFFFF",
  border: "#E4E6F0",
  text: "#1A1B25",
  textMuted: "#8A8DA3",
  error: "#E5484D",
};

export default function RegisterScreen() {
  const { register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [studentId, setStudentId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [department, setDepartment] = useState("");
  const [showDepartmentPicker, setShowDepartmentPicker] = useState(false);

  const handleRegister = async () => {
    setError("");

    if (!name || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!department) {
      setError("Please select your course/department.");
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name,
        email,
        password,
        studentId,
        department,
      });
      // AuthProvider sets `user` on success -> (tabs)/_layout redirects automatically
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
      </Pressable>

      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>
        Join Silay Institute's school services app
      </Text>

      <View style={styles.inputWrapper}>
        <Ionicons
          name="person-outline"
          size={20}
          color={COLORS.textMuted}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor={COLORS.textMuted}
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.inputWrapper}>
        <Ionicons
          name="mail-outline"
          size={20}
          color={COLORS.textMuted}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={COLORS.textMuted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      <View style={styles.inputWrapper}>
        <Ionicons
          name="id-card-outline"
          size={20}
          color={COLORS.textMuted}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="Student ID"
          placeholderTextColor={COLORS.textMuted}
          value={studentId}
          onChangeText={setStudentId}
        />
      </View>

      <Pressable
        style={styles.inputWrapper}
        onPress={() => setShowDepartmentPicker(true)}
      >
        <Ionicons
          name="school-outline"
          size={20}
          color={COLORS.textMuted}
          style={styles.inputIcon}
        />
        <Text
          style={[styles.input, !department && { color: COLORS.textMuted }]}
        >
          {department
            ? DEPARTMENTS.find((d) => d.code === department)?.label
            : "Select your course/department"}
        </Text>
        <Ionicons name="chevron-down" size={18} color={COLORS.textMuted} />
      </Pressable>

      <View style={styles.inputWrapper}>
        <Ionicons
          name="lock-closed-outline"
          size={20}
          color={COLORS.textMuted}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={COLORS.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <Pressable onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={20}
            color={COLORS.textMuted}
          />
        </Pressable>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={({ pressed }) => [styles.button, pressed && { opacity: 0.85 }]}
        onPress={handleRegister}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>
          {isSubmitting ? "Creating account..." : "Sign Up"}
        </Text>
      </Pressable>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <Link href="/(auth)/login">
          <Text style={styles.footerLink}>Log In</Text>
        </Link>
      </View>

      <Modal visible={showDepartmentPicker} animationType="slide" transparent>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowDepartmentPicker(false)}
        >
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Select Course/Department</Text>
            <FlatList
              data={DEPARTMENTS}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.modalOption}
                  onPress={() => {
                    setDepartment(item.code);
                    setShowDepartmentPicker(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{item.label}</Text>
                  {department === item.code && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={COLORS.primary}
                    />
                  )}
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    padding: 24,
    paddingTop: 60,
  },
  backButton: { marginBottom: 16 },
  title: { fontSize: 22, fontWeight: "700", color: COLORS.text },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
    marginBottom: 24,
  },
  roleToggle: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 4,
    marginBottom: 20,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: "center",
  },
  roleButtonActive: { backgroundColor: COLORS.primary },
  roleText: { fontSize: 14, fontWeight: "600", color: COLORS.textMuted },
  roleTextActive: { color: "#fff" },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
    height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: COLORS.text },
  error: { color: COLORS.error, fontSize: 13, marginBottom: 12 },
  button: {
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
    marginBottom: 20,
  },
  footerText: { color: COLORS.textMuted, fontSize: 14 },
  footerLink: { color: COLORS.primary, fontWeight: "600", fontSize: 14 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  modalOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  modalOptionText: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
    marginRight: 12,
  },
});
