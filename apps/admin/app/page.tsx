"use client";

import { useState, useEffect } from "react";
import { 
  ShieldAlert, Sparkles, Send, Check, X, Server, Database, 
  Cpu, Users, BookOpen, AlertTriangle, ToggleLeft, ToggleRight, 
  Activity, Play, BellRing, RefreshCw 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ModerationTask {
  recipeId: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  authorName: string;
  confidenceScore: number;
  reason: string;
  rawOcrText: string;
  safetyReport: {
    unsafeCooking: boolean;
    incompleteSteps: boolean;
    rawMeatWarning: boolean;
  };
}

const mockStats = {
  usersCount: 3,
  recipesCount: 12,
  moderationPendingCount: 1,
  activeFeatures: 3,
  serverStatus: {
    status: "UP",
    uptime: 12800,
    memoryUsage: "48MB / 120MB",
    redisConnected: true,
    dbConnected: true
  }
};

const mockQueue: ModerationTask[] = [
  {
    recipeId: "muffins-pending-id",
    title: "Quick AI Banana Oatmeal Muffins",
    description: "Easy and healthy breakfast muffins made in a single blender. No added sugar!",
    ingredients: ["3 ripe bananas", "2 cups rolled oats", "2 eggs", "1/3 cup honey", "1 tsp baking soda"],
    instructions: ["Preheat oven to 350F.", "Blend ingredients until smooth.", "Pour into cups.", "Bake 15 minutes."],
    authorName: "Dawood Developer",
    confidenceScore: 0.72,
    reason: "OCR detected potential missing salt/baking powder ratios; reviewer check suggested.",
    rawOcrText: "BLENDER MUFFINS BANANA OATS... bananas oats eggs maple syrup baking soda... blend and bake...",
    safetyReport: {
      unsafeCooking: false,
      incompleteSteps: true,
      rawMeatWarning: false
    }
  }
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(mockStats);
  const [queue, setQueue] = useState<ModerationTask[]>(mockQueue);
  const [flags, setFlags] = useState([
    { key: "enable-ai-moderation", value: true, description: "Auto-moderates uploads using Gemini AI" },
    { key: "allow-public-registration", value: true, description: "Allows public users to register accounts" },
    { key: "push-notifications-active", value: true, description: "Trigger push notifications via FCM Broker" }
  ]);

  // Composer States
  const [pushTitle, setPushTitle] = useState("");
  const [pushBody, setPushBody] = useState("");
  const [composeStatus, setComposeStatus] = useState("");
  
  // System Logs Simulator
  const [logs, setLogs] = useState<string[]>([
    "⚙️ Command Center: Initialized administrative websocket.",
    "🐘 PostgreSQL: Connection pooled successfully.",
    "🛡️ Guard: System telemetry verified at 100% capacity."
  ]);

  useEffect(() => {
    async function fetchData() {
      try {
        const statsRes = await fetch("http://localhost:5000/admin/stats", {
          headers: { "Authorization": `Bearer ${localStorage.getItem("rb_auth_token")}` }
        });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        const queueRes = await fetch("http://localhost:5000/admin/queue", {
          headers: { "Authorization": `Bearer ${localStorage.getItem("rb_auth_token")}` }
        });
        if (queueRes.ok) {
          const queueData = await queueRes.json();
          if (queueData.length > 0) setQueue(queueData);
        }
      } catch (err) {
        console.warn("⚠️ API server offline. Loading simulated dashboard telemetry components.");
      }
    }
    fetchData();
  }, []);

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 8)]);
  };

  // Moderation Review approvals
  const handleModerate = (id: string, approve: boolean) => {
    setQueue(prev => prev.filter(item => item.recipeId !== id));
    setStats(prev => ({
      ...prev,
      moderationPendingCount: Math.max(0, prev.moderationPendingCount - 1),
      recipesCount: approve ? prev.recipesCount + 1 : prev.recipesCount
    }));

    addLog(`Recipe Review: ${approve ? "Approved" : "Rejected"} recipe target ID: ${id}`);
    alert(`Recipe successfully ${approve ? "Approved & Published" : "Rejected & Removed"}.`);
  };

  // Broadcast push notifications composer
  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pushTitle || !pushBody) return;

    setComposeStatus("sending");
    setTimeout(() => {
      setComposeStatus("success");
      addLog(`Broadcast Push: Sent alert "${pushTitle}"`);
      setPushTitle("");
      setPushBody("");
      setTimeout(() => setComposeStatus(""), 3000);
    }, 800);
  };

  // Flags toggler
  const handleToggleFlag = (key: string) => {
    setFlags(prev => prev.map(f => {
      if (f.key === key) {
        const nextVal = !f.value;
        addLog(`Feature Flag: Toggled "${key}" to ${nextVal}`);
        return { ...f, value: nextVal };
      }
      return f;
    }));
  };

  return (
    <section className="min-h-screen bg-[#0a0a0a] text-neutral-100 p-6 md:p-10 space-y-8">
      
      {/* 1. Dashboard Title bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-brand-500 font-semibold text-xs tracking-wider uppercase">
            <Sparkles className="w-4.5 h-4.5 text-brand-500 fill-brand-500 animate-pulse" />
            RecipeBook AI Ecosystem
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-white mt-1">
            Command Center Dashboard
          </h1>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Sync Dashboard
          </button>
        </div>
      </div>

      {/* 2. CORE ANALYTICS COUNTERS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Users */}
        <div className="admin-card flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Total Users</span>
            <span className="block text-3xl font-display font-extrabold text-white">{stats.usersCount}</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400">
            <Users className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Recipes */}
        <div className="admin-card flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Culinary Recipes</span>
            <span className="block text-3xl font-display font-extrabold text-white">{stats.recipesCount}</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400">
            <BookOpen className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Pending Moderation */}
        <div className="admin-card flex items-center justify-between glowing-red-border border-brand-900/50">
          <div className="space-y-1">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Queue Pending</span>
            <span className="block text-3xl font-display font-extrabold text-brand-500">{stats.moderationPendingCount}</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-brand-950/30 border border-brand-900/50 flex items-center justify-center text-brand-500">
            <ShieldAlert className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Active Flags */}
        <div className="admin-card flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Features Active</span>
            <span className="block text-3xl font-display font-extrabold text-white">{flags.filter(f => f.value).length}</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400">
            <Activity className="w-5.5 h-5.5" />
          </div>
        </div>
      </div>

      {/* 3. MIDDLE SECTION: Moderation Queue and Server status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Moderation Card (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-brand-500" />
            AI Moderation Review Queue
          </h2>

          <AnimatePresence mode="popLayout">
            {queue.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="admin-card text-center py-16 space-y-2 border-dashed"
              >
                <Check className="w-10 h-10 text-emerald-500 mx-auto" />
                <h3 className="font-semibold text-neutral-200">Moderation Queue Clear!</h3>
                <p className="text-neutral-500 text-xs">All scanned recipes processed cleanly.</p>
              </motion.div>
            ) : (
              queue.map(task => (
                <motion.div
                  key={task.recipeId}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="admin-card space-y-6 border-neutral-800/80"
                >
                  <div className="flex justify-between items-start border-b border-neutral-800/80 pb-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-brand-500">Flagged For Review</span>
                      <h3 className="font-display font-extrabold text-lg text-white mt-0.5">{task.title}</h3>
                      <span className="text-xs text-neutral-400">Uploaded by Chef {task.authorName}</span>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-brand-950/80 border border-brand-900/50 text-brand-400 text-xs font-bold shadow-md">
                        Confidence: {Math.round(task.confidenceScore * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Reasons alert */}
                  <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 flex items-start gap-2.5 text-xs text-neutral-400">
                    <AlertTriangle className="w-4.5 h-4.5 text-brand-500 flex-shrink-0 mt-0.5" />
                    <p>{task.reason}</p>
                  </div>

                  {/* Side-by-side Comparison panel */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left: Original OCR Text Block */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-neutral-500">Original OCR Raw Scan</span>
                      <div className="h-32 bg-neutral-950 rounded-xl p-3 border border-neutral-800/50 text-[10px] font-mono text-neutral-400 overflow-y-auto whitespace-pre-line leading-relaxed">
                        {task.rawOcrText}
                      </div>
                    </div>

                      {/* Right: Extracted recipe model preview */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-neutral-500">Gemini Extracted Format</span>
                      <div className="h-32 bg-neutral-950 rounded-xl p-3 border border-neutral-800/50 text-[10px] text-neutral-300 overflow-y-auto space-y-2">
                        <div>
                          <strong className="text-white">Ingredients Checklist:</strong>
                          <ul className="list-disc pl-3">
                            {task.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                          </ul>
                        </div>
                        <div>
                          <strong className="text-white">Directions Checklist:</strong>
                          <ol className="list-decimal pl-3">
                            {task.instructions.map((step, i) => <li key={i}>{step}</li>)}
                          </ol>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Review Actions Panel */}
                  <div className="flex justify-between items-center pt-2 border-t border-neutral-800/80">
                    <div className="flex gap-4 text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        Workable: True
                      </span>
                      <span className="flex items-center gap-1">
                        <X className="w-3.5 h-3.5 text-amber-500" />
                        Incomplete Steps: True
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleModerate(task.recipeId, false)}
                        className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
                      >
                        <X className="w-4 h-4 text-brand-500" />
                        Reject Upload
                      </button>
                      <button 
                        onClick={() => handleModerate(task.recipeId, true)}
                        className="flex items-center gap-1.5 bg-brand-900 hover:bg-brand-850 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-brand-900/10 transition-all"
                      >
                        <Check className="w-4 h-4 text-brand-300" />
                        Approve & Publish
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar: Server Telemetry and Notifications Composer */}
        <div className="space-y-8">
          
          {/* Server Telemetry Status */}
          <div className="admin-card space-y-4">
            <h3 className="font-display font-bold text-sm uppercase text-neutral-400 tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4" />
              Server Status widget
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between text-xs border-b border-neutral-800/80 pb-2.5">
                <span className="text-neutral-500 font-medium">Gateway Service</span>
                <span className="text-emerald-500 font-bold flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 animate-pulse" /> UP
                </span>
              </div>
              
              <div className="flex justify-between text-xs border-b border-neutral-800/80 pb-2.5">
                <span className="text-neutral-500 font-medium">Postgres Database</span>
                <span className="text-emerald-500 font-bold flex items-center gap-1">
                  <Database className="w-3.5 h-3.5" /> Connected
                </span>
              </div>

              <div className="flex justify-between text-xs border-b border-neutral-800/80 pb-2.5">
                <span className="text-neutral-500 font-medium">Active Memory usage</span>
                <span className="text-neutral-300 font-semibold">{stats.serverStatus.memoryUsage}</span>
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-neutral-500 font-medium">Uptime telemetry</span>
                <span className="text-neutral-300 font-semibold">Uptime: {stats.serverStatus.uptime}s</span>
              </div>
            </div>
          </div>

          {/* FCM Push Notification Composer */}
          <div className="admin-card space-y-4">
            <h3 className="font-display font-bold text-sm uppercase text-neutral-400 tracking-wider flex items-center gap-2">
              <BellRing className="w-4.5 h-4.5 text-brand-500" />
              Broadcast Notification Composer
            </h3>

            <form onSubmit={handleBroadcast} className="space-y-4 pt-1">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Alert Title</label>
                <input 
                  type="text"
                  required
                  placeholder="New trending recipe alert!"
                  value={pushTitle}
                  onChange={(e) => setPushTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-850 rounded-xl px-3.5 py-2.5 text-xs text-neutral-300 outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Push Description</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="Check out today's freshly approved culinary uploads..."
                  value={pushBody}
                  onChange={(e) => setPushBody(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-850 rounded-xl px-3.5 py-2.5 text-xs text-neutral-300 outline-none focus:border-brand-500 resize-none"
                />
              </div>

              <button 
                type="submit"
                disabled={composeStatus === "sending"}
                className="w-full bg-brand-900 text-white font-semibold hover:bg-brand-850 py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-1.5 text-xs active:scale-95 transition-all"
              >
                {composeStatus === "sending" ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : composeStatus === "success" ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Broadcasted!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Broadcast Push Alerts</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Feature Flags Widget */}
          <div className="admin-card space-y-4">
            <h3 className="font-display font-bold text-sm uppercase text-neutral-400 tracking-wider">
              Feature Flags control
            </h3>

            <div className="space-y-3.5 pt-1">
              {flags.map(flag => (
                <div key={flag.key} className="flex justify-between items-center text-xs">
                  <div>
                    <span className="block font-semibold text-neutral-200">{flag.key}</span>
                    <span className="block text-[10px] text-neutral-500 mt-0.5">{flag.description}</span>
                  </div>
                  
                  <button onClick={() => handleToggleFlag(flag.key)}>
                    {flag.value ? (
                      <ToggleRight className="w-7.5 h-7.5 text-brand-500" />
                    ) : (
                      <ToggleLeft className="w-7.5 h-7.5 text-neutral-600" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* System logs monitoring console */}
          <div className="admin-card space-y-3.5">
            <h3 className="font-display font-bold text-xs uppercase text-neutral-500 tracking-wider">
              Activity Monitoring Log
            </h3>
            
            <div className="bg-neutral-950 rounded-xl p-3 border border-neutral-900 font-mono text-[9px] text-neutral-400 h-40 overflow-y-auto space-y-2">
              {logs.map((log, i) => (
                <div key={i} className="leading-relaxed">{log}</div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </section>
  );
}
