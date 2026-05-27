"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, Clock, Users, Heart, Bookmark, Loader2, ArrowRight, AlertCircle } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://recipebook-api-160271972570.us-central1.run.app";

interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  servings: number;
  prepTime: number;
  cookTime: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  image: string;
  authorName: string;
  confidenceScore: number;
  tags: string[];
  likesCount: number;
  commentsCount: number;
  isLikedByMe: boolean;
  isSavedByMe: boolean;
}

export default function Community() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "trending">("latest");
  const [totalCount, setTotalCount] = useState(0);

  const categories = ["All", "Italian", "Healthy", "Quick & Easy", "Dessert", "AI-Parsed"];

  useEffect(() => {
    async function fetchFeed() {
      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams({
          search,
          category: category === "All" ? "" : category,
          sort: sortBy
        });
        
        const response = await fetch(`${API_URL}/recipes/feed?${queryParams.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setRecipes(data.recipes || []);
          setTotalCount(data.pagination?.totalCount || 0);
        } else {
          const errData = await response.json().catch(() => ({}));
          setError(errData.error || `Server returned ${response.status}`);
          setRecipes([]);
        }
      } catch (err) {
        console.error("Feed fetch error:", err);
        setError("Cannot connect to RecipeBook API. The backend may be starting up — please try again in a moment.");
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchFeed();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, category, sortBy]);

  const handleLike = async (id: string) => {
    // Optimistic UI update
    setRecipes(prev => prev.map(rec => {
      if (rec.id === id) {
        return {
          ...rec,
          isLikedByMe: !rec.isLikedByMe,
          likesCount: rec.isLikedByMe ? rec.likesCount - 1 : rec.likesCount + 1
        };
      }
      return rec;
    }));

    // Fire API call
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("rb_auth_token") : null;
      if (token) {
        await fetch(`${API_URL}/recipes/${id}/like`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` }
        });
      }
    } catch {}
  };

  const handleSave = async (id: string) => {
    setRecipes(prev => prev.map(rec => {
      if (rec.id === id) {
        return { ...rec, isSavedByMe: !rec.isSavedByMe };
      }
      return rec;
    }));

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("rb_auth_token") : null;
      if (token) {
        await fetch(`${API_URL}/recipes/${id}/save`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` }
        });
      }
    } catch {}
  };

  return (
    <section className="py-12 bg-neutral-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-neutral-900 tracking-tight">
              Community Recipe Book
            </h1>
            <p className="text-neutral-600 max-w-xl">
              Explore recipes uploaded by foodies and parsed by AI. Only workable instructions with high confidence scores pass through.
            </p>
            {totalCount > 0 && (
              <p className="text-xs text-brand-600 font-semibold">{totalCount} recipes in the community</p>
            )}
          </div>
          
          {/* Sorting filter */}
          <div className="flex gap-2 bg-neutral-200/60 p-1 rounded-xl self-start">
            <button 
              onClick={() => setSortBy("latest")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${sortBy === "latest" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-600 hover:text-neutral-900"}`}
            >
              Latest
            </button>
            <button 
              onClick={() => setSortBy("trending")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${sortBy === "trending" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-600 hover:text-neutral-900"}`}
            >
              Trending
            </button>
          </div>
        </div>

        {/* Search and Categories */}
        <div className="space-y-6 mb-10">
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search recipes by title or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-neutral-200 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none text-neutral-800 text-sm shadow-premium transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-2.5">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat === "All" ? "" : cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                  (cat === "All" && category === "") || category === cat
                    ? "bg-brand-900 border-brand-900 text-white shadow-sm"
                    : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Recipes Grid */}
        <AnimatePresence mode="popLayout">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-premium border border-neutral-200/60 p-4 space-y-4">
                  <div className="h-48 bg-neutral-200/60 rounded-xl animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 bg-neutral-200/60 rounded w-2/3 animate-pulse" />
                    <div className="h-3 bg-neutral-200/60 rounded w-full animate-pulse" />
                    <div className="h-3 bg-neutral-200/60 rounded w-5/6 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-white border border-brand-200/60 rounded-premium p-8"
            >
              <AlertCircle className="w-12 h-12 text-brand-400 mx-auto mb-4" />
              <h3 className="font-display font-bold text-lg text-neutral-800">Connection Issue</h3>
              <p className="text-neutral-500 text-sm max-w-md mx-auto mt-2">{error}</p>
              <button 
                onClick={() => { setSearch(s => s + " "); setTimeout(() => setSearch(s => s.trimEnd()), 100); }}
                className="mt-6 inline-flex items-center gap-2 bg-brand-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-700 transition-all"
              >
                Retry Connection
              </button>
            </motion.div>
          ) : recipes.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-white border border-neutral-200/60 rounded-premium p-8"
            >
              <Users className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <h3 className="font-display font-bold text-lg text-neutral-800">No Recipes Yet</h3>
              <p className="text-neutral-500 text-sm max-w-sm mx-auto mt-2">
                The community feed is empty. Upload a recipe from the Android app to see it appear here!
              </p>
            </motion.div>
          ) : (
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {recipes.map(recipe => (
                <motion.div
                  key={recipe.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-premium border border-neutral-200/50 overflow-hidden shadow-premium hover:shadow-lg transition-all group flex flex-col justify-between"
                >
                  {/* Card Image */}
                  <div className="relative h-48 sm:h-52 bg-neutral-100 overflow-hidden">
                    {recipe.image ? (
                      <img 
                        src={recipe.image} 
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100">
                        <Sparkles className="w-10 h-10 text-brand-300" />
                      </div>
                    )}
                    
                    {/* Confidence score badge */}
                    <div className="absolute top-4 left-4 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-brand-900/90 backdrop-blur-md text-white text-[10px] font-bold shadow-lg">
                      <Sparkles className="w-3 h-3 text-brand-300 fill-brand-300" />
                      <span>{Math.round(recipe.confidenceScore * 100)}% AI Score</span>
                    </div>

                    {/* Difficulty Badge */}
                    <div className="absolute top-4 right-4 inline-flex items-center px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-neutral-900 text-[10px] font-bold border border-neutral-200/30">
                      {recipe.difficulty}
                    </div>
                  </div>

                  {/* Content body */}
                  <div className="p-5 space-y-4 flex-grow flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider text-brand-600">
                        {recipe.tags?.[0] || "Recipe"}
                      </div>
                      
                      <Link href={`/recipe/${recipe.id}`} className="block">
                        <h3 className="font-display font-bold text-lg text-neutral-900 hover:text-brand-700 transition-colors line-clamp-1">
                          {recipe.title}
                        </h3>
                      </Link>
                      
                      <p className="text-neutral-500 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                        {recipe.description || "A recipe extracted by RecipeBook AI."}
                      </p>
                    </div>

                    {/* Preparation metrics */}
                    <div className="grid grid-cols-2 gap-4 py-3 border-y border-neutral-100 my-2 text-neutral-600 text-[11px] font-semibold">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Prep: {recipe.prepTime + recipe.cookTime}m</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Serves: {recipe.servings}</span>
                      </div>
                    </div>

                    {/* Bottom controls */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] text-neutral-500">
                        By <span className="font-bold text-neutral-700">{recipe.authorName}</span>
                      </span>

                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleLike(recipe.id)}
                          className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${
                            recipe.isLikedByMe 
                              ? "bg-brand-50 border-brand-200 text-brand-700" 
                              : "bg-white border-neutral-200 text-neutral-500 hover:text-neutral-700"
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${recipe.isLikedByMe ? "fill-brand-600 text-brand-600" : ""}`} />
                          <span>{recipe.likesCount}</span>
                        </button>

                        <button 
                          onClick={() => handleSave(recipe.id)}
                          className={`p-1.5 rounded-lg border transition-all ${
                            recipe.isSavedByMe
                              ? "bg-brand-50 border-brand-200 text-brand-700"
                              : "bg-white border-neutral-200 text-neutral-500 hover:text-neutral-700"
                          }`}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${recipe.isSavedByMe ? "fill-brand-600 text-brand-600" : ""}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
