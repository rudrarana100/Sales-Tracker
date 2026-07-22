import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Sparkles, Mail, Lock, User, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) {
      toast.warning("Please enter your email and password.");
      return;
    }
    if (isRegister && !fullName) {
      toast.warning("Please enter your full name.");
      return;
    }

    setSubmitting(true);
    try {
      if (isRegister) {
        await register(fullName, email, password);
        toast.success("Account created successfully!");
      } else {
        await login(email, password);
        toast.success("Welcome back!");
      }
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("Authentication failed. Please check your credentials.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#090d16] text-slate-100 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-blue-400 shadow-xl mb-1">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">SalesTracker CRM</h1>
          <p className="text-xs text-slate-400">Enterprise Outbound Sales & Leads Platform</p>
        </div>

        {/* Auth Card */}
        <div className="rounded-2xl border border-slate-800/80 bg-[#111827] p-6 shadow-2xl space-y-5">
          {/* Tab Switches */}
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-900/80 p-1 border border-slate-800/60">
            <button
              type="button"
              onClick={() => setIsRegister(false)}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                !isRegister
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsRegister(true)}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                isRegister
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Rudra Rana"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-800 bg-slate-900/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-800 bg-slate-900/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-800 bg-slate-900/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
            >
              <span>{submitting ? "Processing..." : isRegister ? "Create Account" : "Sign In to Dashboard"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Security badge footer */}
        <div className="flex items-center justify-center gap-2 text-[11px] font-semibold text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>Encrypted Enterprise Session & Role Access</span>
        </div>
      </div>
    </div>
  );
}
