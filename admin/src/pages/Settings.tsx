import { useState } from "react";
import { User as UserIcon, Lock } from "lucide-react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function Settings() {
  const { user } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileMessage("");
    setProfileSaving(true);
    try {
      const res = await api.put("/auth/profile", { name });
      localStorage.setItem(
        "user",
        JSON.stringify({ ...user, name: res.data.name }),
      );
      setProfileMessage("Profile updated.");
    } catch (err: any) {
      setProfileError(
        err?.response?.data?.message || "Could not update profile.",
      );
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordMessage("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    setPasswordSaving(true);
    try {
      await api.put("/auth/change-password", { currentPassword, newPassword });
      setPasswordMessage("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordError(
        err?.response?.data?.message || "Could not change password.",
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-[#1A1B25] mb-1">Settings</h1>
      <p className="text-sm text-[#8A8DA3] mb-6">
        Manage your account details.
      </p>

      <div className="bg-white border border-[#E4E6F0] rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <UserIcon size={16} color="#5B4FE5" />
          <h2 className="text-sm font-bold text-[#1A1B25]">
            Profile Information
          </h2>
        </div>

        <form onSubmit={handleSaveProfile}>
          <label className="block text-sm font-medium text-[#1A1B25] mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-[#E4E6F0] rounded-lg px-3 py-2 mb-4 text-sm outline-none focus:ring-2 focus:ring-[#5B4FE5]"
            required
          />

          <label className="block text-sm font-medium text-[#1A1B25] mb-1">
            Email Address
          </label>
          <input
            type="text"
            value={user?.email || ""}
            disabled
            className="w-full border border-[#E4E6F0] bg-[#F5F6FB] rounded-lg px-3 py-2 mb-4 text-sm text-[#8A8DA3]"
          />

          <label className="block text-sm font-medium text-[#1A1B25] mb-1">
            Department
          </label>
          <input
            type="text"
            value={user?.department || ""}
            disabled
            className="w-full border border-[#E4E6F0] bg-[#F5F6FB] rounded-lg px-3 py-2 mb-4 text-sm text-[#8A8DA3]"
          />

          {profileError && (
            <p className="text-sm text-red-500 mb-3">{profileError}</p>
          )}
          {profileMessage && (
            <p className="text-sm text-green-600 mb-3">{profileMessage}</p>
          )}

          <button
            type="submit"
            disabled={profileSaving}
            className="bg-[#5B4FE5] text-white text-sm font-semibold px-4 py-2.5 rounded-lg disabled:opacity-60"
          >
            {profileSaving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      <div className="bg-white border border-[#E4E6F0] rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock size={16} color="#5B4FE5" />
          <h2 className="text-sm font-bold text-[#1A1B25]">Change Password</h2>
        </div>

        <form onSubmit={handleChangePassword}>
          <label className="block text-sm font-medium text-[#1A1B25] mb-1">
            Current Password
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full border border-[#E4E6F0] rounded-lg px-3 py-2 mb-4 text-sm outline-none focus:ring-2 focus:ring-[#5B4FE5]"
            required
          />

          <label className="block text-sm font-medium text-[#1A1B25] mb-1">
            New Password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border border-[#E4E6F0] rounded-lg px-3 py-2 mb-4 text-sm outline-none focus:ring-2 focus:ring-[#5B4FE5]"
            required
          />

          <label className="block text-sm font-medium text-[#1A1B25] mb-1">
            Confirm New Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-[#E4E6F0] rounded-lg px-3 py-2 mb-4 text-sm outline-none focus:ring-2 focus:ring-[#5B4FE5]"
            required
          />

          {passwordError && (
            <p className="text-sm text-red-500 mb-3">{passwordError}</p>
          )}
          {passwordMessage && (
            <p className="text-sm text-green-600 mb-3">{passwordMessage}</p>
          )}

          <button
            type="submit"
            disabled={passwordSaving}
            className="bg-[#5B4FE5] text-white text-sm font-semibold px-4 py-2.5 rounded-lg disabled:opacity-60"
          >
            {passwordSaving ? "Saving..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
