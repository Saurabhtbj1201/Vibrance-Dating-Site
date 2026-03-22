import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Mail, Lock, User, ArrowRight, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register, isLoggingIn, isRegistering, loginError, registerError } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    age: 18,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      login({ data: { email: formData.email, password: formData.password } });
    } else {
      register({ data: { ...formData, age: Number(formData.age) } });
    }
  };

  const isLoading = isLoggingIn || isRegistering;
  const error = isLogin ? loginError : registerError;

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center px-6 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #E8EBF7 0%, #F4F0FA 50%, #EBF0FA 100%)" }}
    >
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(207,112,180,0.15) 0%, transparent 70%)" }}
      />
      <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(150,100,220,0.12) 0%, transparent 70%)" }}
      />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-sm mx-auto relative z-10"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(135deg, #E8527A, #A855D8)" }}
          >
            <Flame className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2" style={{ color: "#1E1B4B" }}>
            {isLogin ? "Welcome back" : "Create account"}
          </h2>
          <p style={{ color: "#6B6B9A" }}>
            {isLogin ? "Enter your details to find sparks." : "Join Spark to meet new people."}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-purple-100/60 p-8 border border-white">
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  {/* Name */}
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "#A78BCC" }} />
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      className="w-full rounded-2xl py-3.5 pl-12 pr-4 text-sm outline-none transition-all border-2"
                      style={{
                        background: "#F4F0FA",
                        borderColor: "#E0D9F5",
                        color: "#1E1B4B",
                      }}
                      onFocus={e => (e.target.style.borderColor = "#E8527A")}
                      onBlur={e => (e.target.style.borderColor = "#E0D9F5")}
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  {/* Age */}
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "#A78BCC" }} />
                    <input
                      type="number"
                      required
                      min="18"
                      max="100"
                      placeholder="Age"
                      className="w-full rounded-2xl py-3.5 pl-12 pr-4 text-sm outline-none transition-all border-2"
                      style={{
                        background: "#F4F0FA",
                        borderColor: "#E0D9F5",
                        color: "#1E1B4B",
                      }}
                      onFocus={e => (e.target.style.borderColor = "#E8527A")}
                      onBlur={e => (e.target.style.borderColor = "#E0D9F5")}
                      value={formData.age}
                      onChange={e => setFormData({ ...formData, age: parseInt(e.target.value) || 18 })}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "#A78BCC" }} />
              <input
                type="email"
                required
                placeholder="Email address"
                className="w-full rounded-2xl py-3.5 pl-12 pr-4 text-sm outline-none transition-all border-2"
                style={{
                  background: "#F4F0FA",
                  borderColor: "#E0D9F5",
                  color: "#1E1B4B",
                }}
                onFocus={e => (e.target.style.borderColor = "#E8527A")}
                onBlur={e => (e.target.style.borderColor = "#E0D9F5")}
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "#A78BCC" }} />
              <input
                type="password"
                required
                minLength={6}
                placeholder="Password"
                className="w-full rounded-2xl py-3.5 pl-12 pr-4 text-sm outline-none transition-all border-2"
                style={{
                  background: "#F4F0FA",
                  borderColor: "#E0D9F5",
                  color: "#1E1B4B",
                }}
                onFocus={e => (e.target.style.borderColor = "#E8527A")}
                onBlur={e => (e.target.style.borderColor = "#E0D9F5")}
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            {error && (
              <p className="text-sm text-center font-medium" style={{ color: "#DC2626" }}>
                {isLogin ? "Invalid email or password. Please try again." : "Sign up failed. Please check your details."}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 mt-2 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              style={{
                background: isLoading ? "#C084B8" : "linear-gradient(135deg, #E8527A, #A855D8)",
                boxShadow: "0 8px 24px rgba(232, 82, 122, 0.3)",
              }}
            >
              {isLoading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
              {!isLoading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: "#7C5CC4" }}
            >
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span className="font-bold" style={{ color: "#E8527A" }}>
                {isLogin ? "Sign up" : "Sign in"}
              </span>
            </button>
          </div>
        </div>

        {/* Demo hint */}
        <p className="text-center text-xs mt-6" style={{ color: "#9B96C0" }}>
          Try demo: <span className="font-mono font-semibold">demo@example.com</span> / <span className="font-mono font-semibold">demo123</span>
        </p>
      </motion.div>
    </div>
  );
}
