"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, Clock, Users, Heart, Bookmark, Loader2, ArrowRight } from "lucide-react";

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

const mockRecipes: Recipe[] = [
  {
    id: "carbonara-mock-id",
    title: "Classic Spaghetti Carbonara",
    description: "A rich, creamy, and traditional Roman pasta dish made with eggs, hard cheese, cured pork, and black pepper.",
    ingredients: ["400g Spaghetti", "150g Guanciale", "4 Large Eggs", "75g Pecorino Romano", "Black Pepper"],
    instructions: ["Boil spaghetti in salted water.", "Fry guanciale until crispy.", "Whisk eggs with Pecorino.", "Toss pasta with guanciale fat, pour egg mixture off heat and stir rapidly."],
    servings: 4,
    prepTime: 10,
    cookTime: 15,
    difficulty: "MEDIUM",
    image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&auto=format&fit=crop&q=80",
    authorName: "Sarah Chef",
    confidenceScore: 0.96,
    tags: ["Italian", "AI-Parsed"],
    likesCount: 24,
    commentsCount: 3,
    isLikedByMe: false,
    isSavedByMe: false
  },
  {
    id: "blender-muffins-mock-id",
    title: "Quick AI Banana Oatmeal Muffins",
    description: "Easy and healthy breakfast muffins made in a single blender. No added sugar!",
    ingredients: ["3 ripe bananas", "2 cups rolled oats", "2 large eggs", "1/3 cup honey", "1 tsp baking soda"],
    instructions: ["Preheat oven to 350°F.", "Blend all ingredients until smooth.", "Pour into muffin tins.", "Bake for 15-18 minutes."],
    servings: 12,
    prepTime: 5,
    cookTime: 18,
    difficulty: "EASY",
    image: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=800&auto=format&fit=crop&q=80",
    authorName: "Dawood Developer",
    confidenceScore: 0.88,
    tags: ["Healthy", "Quick & Easy"],
    likesCount: 12,
    commentsCount: 1,
    isLikedByMe: false,
    isSavedByMe: false
  }
];

export default function Community() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "trending">("latest");

  const categories = ["All", "Italian", "Healthy", "Quick & Easy", "Dessert", "AI-Parsed"];

  useEffect(() => {
    async function fetchFeed() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          search,
          category: category === "All" ? "" : category,
          sort: sortBy
        });
        
        const response = await fetch(`http://localhost:5000/recipes/feed?${queryParams.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setRecipes(data.recipes.length > 0 ? data.recipes : mockRecipes);
        } else {
          setRecipes(mockRecipes); // Fallback to mock
        }
      } catch (error) {
        console.warn("⚠️ Cannot fetch real-time feed (Backend API likely offline). Operating in visual mockup state.");
        setRecipes(mockRecipes);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchFeed();
    }, 300); // Debounce inputs

    return () => clearTimeout(timer);
  }, [search, category, sortBy]);

  // Dynamic like click handler
  const handleLike = (id: string) => {
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
  };

  const handleSave = (id: string) => {
    setRecipes(prev => prev.map(rec => {
      if (rec.id === id) {
        return {
          ...rec,
          isSavedByMe: !rec.isSavedByMe
        };
      }
      return rec;
    }));
  };

  return (
    <section className="py-12 bg-neutral-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Pitch */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-neutral-900 tracking-tight">
              Community Recipe Book
            </h1>
            <p className="text-neutral-600 max-w-xl">
              Explore recipes uploaded by foodies and parsed by AI. Only workable instructions with high confidence scores pass through.
            </p>
          </div>
          
          {/* Sorting filter toggler */}
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

        {/* Search and Categories section */}
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

          {/* Categories tag rows */}
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
            // Skeleton Loader cards
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-premium border border-neutral-200/60 p-4 space-y-4">
                  <div className="h-48 bg-neutral-200/60 rounded-xl animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4.5 bg-neutral-200/60 rounded w-2/3 animate-pulse" />
                    <div className="h-3 bg-neutral-200/60 rounded w-full animate-pulse" />
                    <div className="h-3 bg-neutral-200/60 rounded w-5/6 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : recipes.length === 0 ? (
            // Empty State
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-white border border-neutral-200/60 rounded-premium p-8"
            >
              <Users className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <h3 className="font-display font-bold text-lg text-neutral-800">No Recipes Found</h3>
              <p className="text-neutral-500 text-sm max-w-sm mx-auto mt-2">
                Try expanding your search query or switching category tags to find community culinary items.
              </p>
            </motion.div>
          ) : (
            // Active cards rendering
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
                  className="bg-white rounded-premium border border-neutral-200/50 overflow-hidden shadow-premium hover:shadow-lg transition-premium group flex flex-col justify-between"
                >
                  {/* Card Image preview & OCR accuracy stats */}
                  <div className="relative h-48 sm:h-52 bg-neutral-100 overflow-hidden">
                    <img 
                      src={recipe.image} 
                      alt={recipe.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
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
                        {recipe.tags[0] || "Recipe"}
                      </div>
                      
                      <Link href={`/recipe/${recipe.id}`} className="block">
                        <h3 className="font-display font-bold text-lg text-neutral-900 hover:text-brand-700 transition-colors line-clamp-1">
                          {recipe.title}
                        </h3>
                      </Link>
                      
                      <p className="text-neutral-500 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                        {recipe.description || "A gorgeous food formulation extracted by RecipeBook AI."}
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

                    {/* Bottom controls bar */}
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
