"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Shield, Mail, Lock } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Simulate/Trigger login logic
      // Check admin credentials
      if (email.toLowerCase() === "soli@recipebook.com" && password === "Soliman@1234") {
        // Save mock admin session
        localStorage.setItem("rb_auth_token", "admin-mock-jwt-token-12345");
        localStorage.setItem("rb_auth_role", "ADMIN");
        
        // Wait briefly for visuals
        setTimeout(() => {
          router.push("http://localhost:3000/admin"); // Admin dashboard
        }, 500);
      } else {
        // Standard user success mock routing
        localStorage.setItem("rb_auth_token", "user-mock-jwt-token-54321");
        localStorage.setItem("rb_auth_role", "USER");
        
        setTimeout(() => {
          router.push("/community");
        }, 500);
      }
    } catch (err) {
      setError("Failed to sign in. Verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[80vh] bg-gradient-to-b from-brand-50/50 to-neutral-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-premium border border-neutral-200/60 p-8 shadow-premium space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 text-brand-600 flex items-center justify-center mx-auto shadow-md">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="font-display font-extrabold text-2xl text-neutral-900 tracking-tight">
            Authentication Gate
          </h2>
          <p className="text-neutral-500 text-xs sm:text-sm">
            Sign in to upload recipes, comment, and access controls.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input 
                type="email" 
                required
                placeholder="dawood@recipebook.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none text-neutral-800 text-xs sm:text-sm transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input 
                type="password" 
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none text-neutral-800 text-xs sm:text-sm transition-all"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-brand-900 text-white font-semibold hover:bg-brand-850 p-3.5 rounded-xl shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 text-sm pt-4"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-brand-300" />
                <span>Verify Credentials</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-neutral-100 space-y-2 text-center text-[10px] text-neutral-400">
          <div>
            <strong>Administrator Account Testing:</strong><br />
            Email: <code className="bg-neutral-50 px-1 py-0.5 rounded">soli@recipebook.com</code> | Password: <code className="bg-neutral-50 px-1 py-0.5 rounded">Soliman@1234</code>
          </div>
          <div>
            *Logs you directly into Next.js protected admin panel at port 3000.
          </div>
        </div>

      </div>
    </section>
  );
}
