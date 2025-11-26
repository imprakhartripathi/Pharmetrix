import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { isAuthenticated } from "../../services/session";
import { usePageSEO } from "../../hooks/usePageSEO";
import "./Authenticator.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { API_URL } from "../../services/env";


export default function Authenticator() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  usePageSEO({
    title: "Sign In - Pharmetrix Smart Pharmacy Management",
    description: "Access your Pharmetrix account to manage inventory, monitor temperature sensors, process sales, and view compliance reports.",
    keywords: "pharmacy login, sign in, pharmacy management login, inventory management system login",
    ogUrl: "https://pharmetrix.onrender.com/auth",
    canonical: "https://pharmetrix.onrender.com/auth",
  });

  useEffect(() => {
    if (isAuthenticated()) navigate("/dashboard");
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const resp = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await resp.json().catch(() => ({}));

      if (!resp.ok) {
        setError(data?.message || "Login failed");
        return;
      }

      if (data?.token) {
        localStorage.setItem("token", data.token);
        if (data?.user) {
          localStorage.setItem("authUser", JSON.stringify(data.user));
        }
      }

      navigate("/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrapper">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          className="auth-left"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <motion.div
            className="logo-tile"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.35 }}
          >
            <img
              src="/title-logo.png"
              alt="Pharmetrix"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </motion.div>
          <motion.h1
            className="title"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.35 }}
          >
            Smart pharmacy management
          </motion.h1>
          <motion.p
            className="subtitle"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.35 }}
          >
            Sign in to manage inventory, monitor storage, and streamline POS.
          </motion.p>
          <motion.ul
            className="promo-list"
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.08 } },
            }}
          >
            {[
              "Real‑time stock insights",
              "Automated alerts and reports",
              "Fast, secure checkout",
            ].map((item) => (
              <motion.li
                key={item}
                className="promo-item"
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
                }}
              >
                <span className="check-icon">✓</span>
                <span>{item}</span>
              </motion.li>
            ))}
          </motion.ul>
          <div className="backline">
            <a
              href="/"
              className="inline-link"
              onClick={(e) => {
                e.preventDefault();
                navigate("/");
              }}
            >
              Back to Home
            </a>
          </div>
        </motion.div>

        <motion.div
          className="auth-right"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <motion.form
            onSubmit={handleSubmit}
            className="auth-form"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.35 }}
            aria-labelledby="login-title"
          >
            <div className="form-header">
              <h2 id="login-title">Sign in</h2>
              <p>Enter your credentials to continue</p>
            </div>

            {error && <div className="error">{error}</div>}

            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <label htmlFor="password">Password</label>
            <div className="password-field">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="eye-btn"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>

            <div className="row-between">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <a
                href="/auth?reset=1"
                className="inline-link"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/resetpw");
                }}
              >
                Forgot password?
              </a>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </button>

            <p className="helper-text">
              Don’t have an account?{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/get-started");
                }}
              >
                Create one
              </a>
            </p>
          </motion.form>
        </motion.div>
      </motion.div>
    </div>
  );
}
