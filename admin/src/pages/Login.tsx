import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GraduationCap } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F6FB]">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white rounded-2xl border border-[#E4E6F0] p-8"
      >
        <div className="w-16 h-16 rounded-full bg-[#EEEDFC] flex items-center justify-center mx-auto mb-4">
          <GraduationCap size={28} color="#5B4FE5" />
        </div>
        <h1 className="text-xl font-bold text-center text-[#1A1B25]">
          Silay Institute
        </h1>
        <p className="text-sm text-center text-[#8A8DA3] mb-6">Admin Portal</p>

        <label className="block text-sm font-medium text-[#1A1B25] mb-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-[#E4E6F0] rounded-lg px-3 py-2.5 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B4FE5]"
          required
        />

        <label className="block text-sm font-medium text-[#1A1B25] mb-1">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-[#E4E6F0] rounded-lg px-3 py-2.5 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B4FE5]"
          required
        />

        {error && <p className="text-sm text-[#E5484D] mb-4">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#5B4FE5] text-white font-semibold rounded-lg py-2.5 text-sm disabled:opacity-60"
        >
          {isSubmitting ? "Logging in..." : "Log In"}
        </button>
      </form>
    </div>
  );
}
