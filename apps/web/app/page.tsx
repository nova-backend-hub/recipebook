"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Camera, Sparkles, Smartphone, Award, ShieldAlert, Cpu, Heart, CheckCircle2 } from "lucide-react";

export default function Home() {
  
  // Animation presets
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  return (
    <div className="overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative py-20 md:py-28 bg-gradient-to-b from-brand-50/50 to-neutral-50">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-600 via-brand-100 to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Hero Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-100/80 text-brand-800 text-xs font-semibold tracking-wider uppercase border border-brand-200/50">
              <Sparkles className="w-3.5 h-3.5 text-brand-600 fill-brand-600 animate-pulse" />
              AI-Powered Recipe Hub
            </div>
            
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-neutral-900 leading-[1.1]">
              Transform Screenshots <br />
              Into <span className="bg-gradient-to-r from-brand-600 to-brand-800 bg-clip-text text-transparent">Smart Recipes</span>
            </h1>
            
            <p className="text-neutral-600 text-base sm:text-lg leading-relaxed max-w-xl">
              Tired of saving cluttered food screenshots? Upload any screenshot or photograph. Our Gemini intelligence extracts structured ingredients, instructions, and cook times instantly. Saved offline, synced globally.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link href="/community" className="inline-flex items-center gap-2 text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700 active:scale-95 transition-all px-6 py-3.5 rounded-xl shadow-lg shadow-brand-500/25">
                <Sparkles className="w-4 h-4" />
                Explore Community Recipes
              </Link>
              <Link href="#download" className="inline-flex items-center gap-2 text-sm font-semibold bg-white text-neutral-800 border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 active:scale-95 transition-all px-6 py-3.5 rounded-xl shadow-premium">
                <Smartphone className="w-4 h-4 text-brand-600" />
                Download Android APK
              </Link>
            </div>

            {/* Quick Metrics stats */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-neutral-200/80 max-w-md">
              <div>
                <span className="block text-2xl font-bold text-neutral-900 font-display">98.4%</span>
                <span className="text-xs text-neutral-500">OCR Accuracy</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-neutral-900 font-display">&lt; 3s</span>
                <span className="text-xs text-neutral-500">Gemini Parsing</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-neutral-900 font-display">Offline</span>
                <span className="text-xs text-neutral-500">Room Local DB</span>
              </div>
            </div>
          </motion.div>

          {/* Hero Right Visuals */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative lg:ml-6"
          >
            {/* Interactive Backdrop Vector */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-brand-400/10 blur-[80px] pointer-events-none" />

            {/* Floating UI Cards representing App interface */}
            <div className="relative mx-auto max-w-sm sm:max-w-md bg-white rounded-premium border border-neutral-200/60 p-6 shadow-premium relative">
              <div className="absolute -top-3 -right-3 w-16 h-16 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center shadow-lg transform rotate-6 animate-bounce">
                <Sparkles className="w-8 h-8 text-brand-600" />
              </div>
              
              <div className="flex items-center gap-3 border-b border-neutral-100 pb-4 mb-4">
                <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-neutral-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 text-sm">Image Upload Parser</h3>
                  <p className="text-xs text-neutral-500">Analyzing ingredients and steps...</p>
                </div>
              </div>

              {/* Clean structured recipe preview visual card */}
              <div className="space-y-3">
                <div className="h-4 bg-neutral-100 rounded w-2/3 animate-pulse" />
                <div className="h-3 bg-neutral-100 rounded w-1/2 animate-pulse" />
                
                <div className="p-3 bg-brand-50/50 rounded-xl border border-brand-100/50 space-y-2 mt-4">
                  <div className="flex items-center justify-between text-xs text-brand-800 font-semibold">
                    <span>Parsed via Gemini Flash AI</span>
                    <span>Confidence: 96%</span>
                  </div>
                  <div className="h-2 bg-brand-200/50 rounded w-full" />
                </div>

                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center gap-2 text-xs text-neutral-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-100" />
                    <span>Parsed: 6 Ingredients scaled</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-100" />
                    <span>Parsed: 4 Chronological directions</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-100" />
                    <span>Parsed: Active Cook Time: 15 mins</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. FEATURES SECTION */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-neutral-900">
              Built with High-Performance Tech Architecture
            </h2>
            <p className="text-neutral-600">
              RecipeBook combines native Android processing power with robust TypeScript Cloud pipelines to make recipe saving flawless.
            </p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {/* Feature A */}
            <motion.div variants={itemVariants} className="p-8 rounded-premium border border-neutral-200/70 hover:border-brand-200 transition-all hover:shadow-premium group">
              <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-neutral-900 mb-3">On-Device OCR Engine</h3>
              <p className="text-neutral-600 text-sm leading-relaxed">
                Using Google ML Kit Text Recognition on the Android app, we extract text blocks directly on your phone. Completely offline, super fast, saving cloud request bandwidth.
              </p>
            </motion.div>

            {/* Feature B */}
            <motion.div variants={itemVariants} className="p-8 rounded-premium border border-neutral-200/70 hover:border-brand-200 transition-all hover:shadow-premium group">
              <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-neutral-900 mb-3">Gemini Parse & Moderate</h3>
              <p className="text-neutral-600 text-sm leading-relaxed">
                The Fastify API feeds raw text to Gemini AI models. It classifies safety metrics (identifying toxic recipes), measures instructional clarity, and outputs clean recipes.
              </p>
            </motion.div>

            {/* Feature C */}
            <motion.div variants={itemVariants} className="p-8 rounded-premium border border-neutral-200/70 hover:border-brand-200 transition-all hover:shadow-premium group">
              <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-neutral-900 mb-3">SQLite Room & Sync</h3>
              <p className="text-neutral-600 text-sm leading-relaxed">
                All parsed profiles write directly to local SQLite databases. A persistent Room background worker queues offline recipes and synchronizes with the server once connected.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 3. DOWNLOAD APK APP SHOWCASE */}
      <section id="download" className="py-20 bg-neutral-900 text-white relative overflow-hidden">
        <div className="absolute top-1/2 right-10 -translate-y-1/2 w-96 h-96 rounded-full bg-brand-600/20 blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-900/50 text-brand-200 text-xs font-semibold uppercase tracking-wider border border-brand-800">
              Download APK
            </div>
            
            <h2 className="font-display font-bold text-3xl sm:text-4xl leading-tight">
              Get RecipeBook on Your Android Smartphone
            </h2>
            
            <p className="text-neutral-400 leading-relaxed text-sm sm:text-base">
              Compile and install the Kotlin + Jetpack Compose mobile client. Unlock real-time OCR camera capture, local Room storage caching, instant ingredient resizing multipliers, and Firebase push update notifications.
            </p>

            {/* Android features list */}
            <ul className="space-y-3 pt-2">
              <li className="flex items-center gap-2.5 text-sm text-neutral-300">
                <CheckCircle2 className="w-4 h-4 text-brand-500 fill-brand-950" />
                Jetpack Compose Material 3 (Red accents UI)
              </li>
              <li className="flex items-center gap-2.5 text-sm text-neutral-300">
                <CheckCircle2 className="w-4 h-4 text-brand-500 fill-brand-950" />
                Local Room Database Offline Sync Cache
              </li>
              <li className="flex items-center gap-2.5 text-sm text-neutral-300">
                <CheckCircle2 className="w-4 h-4 text-brand-500 fill-brand-950" />
                Firebase Cloud Messaging Push Alerts
              </li>
            </ul>

            <div className="pt-4 flex flex-wrap gap-4">
              <a href="#" className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-brand-600/30 active:scale-95 transition-all text-sm">
                <Smartphone className="w-5 h-5" />
                Download Android APK Mockup (v1.0)
              </a>
              <span className="text-xs text-neutral-500 self-center">Size: ~12MB | Target Android 13+ (API 33)</span>
            </div>
          </div>

          {/* Android Showcase Mockups */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-72 sm:w-80 h-[500px] bg-neutral-950 rounded-[40px] border-4 border-neutral-800 p-3.5 shadow-2xl relative overflow-hidden flex flex-col justify-between">
              {/* Camera punch hole */}
              <div className="w-3.5 h-3.5 bg-neutral-800 rounded-full mx-auto mb-2" />
              
              {/* Mock App Interface */}
              <div className="flex-grow bg-white rounded-[26px] p-4 flex flex-col justify-between overflow-hidden relative text-neutral-900">
                {/* App Splash/Home Mock */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-extrabold text-sm text-brand-700">🍳 RecipeBook</span>
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                  </div>

                  <div className="p-3 bg-brand-50 rounded-xl border border-brand-100 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-brand-600" />
                    <span className="text-xs font-semibold text-brand-800">Scan food instructions...</span>
                  </div>

                  <span className="block text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">Community Feed</span>
                  
                  {/* Mock recipe item */}
                  <div className="border border-neutral-100 rounded-xl p-2.5 space-y-1.5 shadow-sm">
                    <div className="h-20 bg-neutral-100 rounded-lg relative overflow-hidden">
                      <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-brand-600 text-white text-[8px] font-bold">
                        96% AI Score
                      </div>
                    </div>
                    <span className="block text-xs font-bold text-neutral-800">Spaghetti Carbonara</span>
                    <div className="flex justify-between items-center text-[9px] text-neutral-500">
                      <span>4 Servings</span>
                      <span>15 Mins Cook</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-neutral-100 pt-2 flex items-center justify-between text-[9px] text-neutral-400 font-medium">
                  <span className="text-brand-600 font-bold">🏠 Home</span>
                  <span>📷 Scan OCR</span>
                  <span>👥 Feed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
