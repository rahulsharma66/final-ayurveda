import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";

const RECOVERY_EMAIL = "rsharma24102006@gmail.com";

const Login = () => {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState(
    () => localStorage.getItem("adminEmail") || RECOVERY_EMAIL
  );
  const [password, setPassword] = useState("");

  const [otp, setOtp] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [toast, setToast] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resetting, setResetting] = useState(false);
  const navigate = useNavigate();

  const resetResetForm = () => {
    setOtp("");
    setNewEmail("");
    setNewPassword("");
    setConfirmPassword("");
    setOtpSent(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/api/auth/login", { email, password });

      if (res.data.user.role !== "admin") {
        setToast({ message: "Admins only", type: "error" });
        setLoading(false);
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);
      localStorage.setItem("adminEmail", res.data.user.email);
      navigate("/products");
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Login failed",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setSendingOtp(true);

    try {
      const res = await api.post("/api/auth/request-reset", {
        email: RECOVERY_EMAIL,
      });

      setOtpSent(true);
      setToast({
        message: res.data.message || "OTP sent to the recovery email",
        type: "success",
      });
    } catch (err) {
      setToast({
        message:
          err.response?.data?.message ||
          (err.code === "ERR_NETWORK"
            ? "Cannot reach the backend server. Start the backend and try again."
            : "Failed to send OTP"),
        type: "error",
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleResetCredentials = async (e) => {
    e.preventDefault();

    if (!newEmail.trim() && !newPassword) {
      setToast({
        message: "Enter a new email or a new password",
        type: "error",
      });
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setToast({ message: "Passwords do not match", type: "error" });
      return;
    }

    setResetting(true);

    try {
      const res = await api.post("/api/auth/reset-credentials", {
        email: RECOVERY_EMAIL,
        otp,
        newEmail: newEmail.trim(),
        newPassword,
      });

      const updatedEmail = res.data.email || newEmail.trim() || email;

      localStorage.setItem("adminEmail", updatedEmail);
      setEmail(updatedEmail);
      setPassword("");
      resetResetForm();
      setMode("login");
      setToast({
        message: "Admin credentials updated. Please log in again.",
        type: "success",
      });
    } catch (err) {
      setToast({
        message:
          err.response?.data?.message ||
          (err.code === "ERR_NETWORK"
            ? "Cannot reach the backend server. Start the backend and try again."
            : "Failed to update credentials"),
        type: "error",
      });
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 px-4">
      <div className="bg-white p-8 rounded-lg shadow w-full max-w-md">
        <h2 className="text-2xl font-bold text-green-700 mb-2 text-center">
          {mode === "login" ? "Admin Login" : "Reset Admin Credentials"}
        </h2>

        {mode === "login" ? (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <input
              type="email"
              className="w-full border px-4 py-2 rounded"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <input
              type="password"
              className="w-full border px-4 py-2 rounded"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("reset");
                setToast({ message: "", type: "" });
              }}
              className="w-full text-sm text-green-700 hover:underline"
            >
              Forgot password / change login email?
            </button>
          </form>
        ) : (
          <div className="space-y-4 mt-4">
            <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
              Reset OTP will only be sent to{" "}
              <strong className="break-all">{RECOVERY_EMAIL}</strong>.
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fixed Recovery Email
              </label>
              <input
                type="email"
                value={RECOVERY_EMAIL}
                readOnly
                className="w-full border px-4 py-2 rounded bg-gray-100 text-gray-600"
              />
            </div>

            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={sendingOtp}
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-60"
              >
                {sendingOtp ? "Sending OTP..." : "Send OTP"}
              </button>
            ) : (
              <form onSubmit={handleResetCredentials} className="space-y-4">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className="w-full border px-4 py-2 rounded tracking-widest text-center"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  required
                />
                <input
                  type="email"
                  className="w-full border px-4 py-2 rounded"
                  placeholder="New login email (optional)"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  autoComplete="email"
                />
                <input
                  type="password"
                  className="w-full border px-4 py-2 rounded"
                  placeholder="New password (optional)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <input
                  type="password"
                  className="w-full border px-4 py-2 rounded"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <p className="text-xs text-gray-500">
                  Leave email or password blank to keep the current one. Password
                  must be at least 6 characters.
                </p>
                <button
                  type="submit"
                  disabled={resetting}
                  className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-60"
                >
                  {resetting ? "Updating..." : "Update Email / Password"}
                </button>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp}
                  className="w-full border border-green-600 text-green-700 py-2 rounded hover:bg-green-50 disabled:opacity-60"
                >
                  {sendingOtp ? "Sending..." : "Resend OTP"}
                </button>
              </form>
            )}

            <button
              type="button"
              onClick={() => {
                setMode("login");
                resetResetForm();
                setToast({ message: "", type: "" });
              }}
              className="w-full text-sm text-gray-600 hover:underline"
            >
              Back to login
            </button>
          </div>
        )}
      </div>

      <Toast {...toast} onClose={() => setToast({})} />
    </div>
  );
};

export default Login;
