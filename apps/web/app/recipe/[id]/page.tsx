"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sparkles, Clock, Users, ArrowLeft, Heart, Bookmark, Plus, Minus, Send, MessageSquare } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  userName: string;
  createdAt: string;
}

interface Recipe {
  id: string;
  title: string;
  description: string | null;
  ingredients: string[];
  instructions: string[];
  servings: number;
  prepTime: number;
  cookTime: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  image: string | null;
  authorName: string;
  confidenceScore: number;
  tags: string[];
  likesCount: number;
  commentsCount: number;
  isLikedByMe: boolean;
  isSavedByMe: boolean;
  comments?: Comment[];
}

const mockRecipeDetail: Recipe = {
  id: "carbonara-mock-id",
  title: "Classic Spaghetti Carbonara",
  description: "A rich, creamy, and traditional Roman pasta dish made with eggs, hard cheese, cured pork, and black pepper.",
  ingredients: ["400g Spaghetti", "150g Guanciale", "4 Large Eggs", "75g Pecorino Romano", "Black Pepper"],
  instructions: [
    "Bring a large pot of salted water to boil. Cook spaghetti according to package directions until al dente.",
    "While cooking pasta, heat a skillet over medium heat. Add cubed guanciale and fry until crispy. Remove from heat, leaving guanciale and rendered fat in the skillet.",
    "In a bowl, whisk eggs together with grated cheese and plenty of cracked black pepper.",
    "Drain pasta, reserving 1 cup of pasta water. Add pasta directly into the skillet with warm guanciale fat, tossing for 1 minute to cool slightly.",
    "Pour egg-cheese mixture over the warm pasta, stirring rapidly. Add small splashes of reserved pasta water if needed to create a smooth, glossy sauce. Do not cook on heat, or eggs will scramble."
  ],
  servings: 4,
  prepTime: 10,
  cookTime: 15,
  difficulty: "MEDIUM",
  image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&auto=format&fit=crop&q=80",
  authorName: "Sarah Chef",
  confidenceScore: 0.96,
  tags: ["Italian", "AI-Parsed"],
  likesCount: 24,
  commentsCount: 2,
  isLikedByMe: false,
  isSavedByMe: false,
  comments: [
    { id: "com-1", content: "Absolutely stellar recipe! The instructions are so precise, no scrambled egg messes.", userName: "John Baker", createdAt: "2026-05-25T12:00:00Z" },
    { id: "com-2", content: "Classic and simple, just the way it should be.", userName: "Emily Miller", createdAt: "2026-05-24T18:30:00Z" }
  ]
};

export default function RecipeDetail() {
  const params = useParams();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [targetServings, setTargetServings] = useState(4);
  const [scaledIngredients, setScaledIngredients] = useState<string[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentsList, setCommentsList] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch recipe details
  useEffect(() => {
    async function fetchRecipe() {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/recipes/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setRecipe(data);
          setTargetServings(data.servings);
          setScaledIngredients(data.ingredients);
          setCommentsList(data.comments || []);
        } else {
          loadMockData();
        }
      } catch (err) {
        console.warn("⚠️ Fetch error. Using mockup recipe detail.");
        loadMockData();
      } finally {
        setLoading(false);
      }
    }

    fetchRecipe();
  }, [params.id]);

  function loadMockData() {
    setRecipe(mockRecipeDetail);
    setTargetServings(mockRecipeDetail.servings);
    setScaledIngredients(mockRecipeDetail.ingredients);
    setCommentsList(mockRecipeDetail.comments || []);
  }

  // Handle local ingredients scaling multipliers
  const scaleIngredients = (newServs: number) => {
    if (!recipe || newServs < 1) return;
    setTargetServings(newServs);
    
    const factor = newServs / recipe.servings;
    
    const scaled = recipe.ingredients.map(ing => {
      const numberRegex = /(\d+(\.\d+)?)/g;
      return ing.replace(numberRegex, (match) => {
        const value = parseFloat(match);
        const multiplied = value * factor;
        return Number(multiplied.toFixed(2)).toString();
      });
    });
    setScaledIngredients(scaled);
  };

  // Publish comment handler
  const handleCommentPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const freshComment: Comment = {
      id: `new-c-${Date.now()}`,
      content: newComment.trim(),
      userName: "You (Reviewer)",
      createdAt: new Date().toISOString()
    };

    setCommentsList(prev => [freshComment, ...prev]);
    setNewComment("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          <span className="text-neutral-500 text-sm font-semibold">Parsing culinary details...</span>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h2 className="font-display font-bold text-xl text-neutral-800">Recipe not found</h2>
          <button onClick={() => router.push("/community")} className="text-brand-600 hover:underline">
            Return to feed
          </button>
        </div>
      </div>
    );
  }

  return (
    <article className="py-12 bg-neutral-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Back Link */}
        <button 
          onClick={() => router.push("/community")}
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-brand-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Community Feed
        </button>

        {/* Hero Section Banner */}
        <div className="relative h-64 sm:h-[400px] rounded-premium overflow-hidden border border-neutral-200/50 shadow-lg mb-8">
          <img 
            src={recipe.image || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&auto=format&fit=crop&q=80"} 
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          
          <div className="absolute bottom-6 left-6 right-6 text-white space-y-3 pointer-events-none">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-900/90 text-white text-[10px] font-bold shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-brand-300 fill-brand-300" />
              <span>Gemini Cleansed ({Math.round(recipe.confidenceScore * 100)}% accuracy)</span>
            </div>
            
            <h1 className="font-display font-extrabold text-2xl sm:text-4xl tracking-tight leading-tight">
              {recipe.title}
            </h1>
          </div>
        </div>

        {/* Recipe Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          
          {/* LEFT COLUMN: Scaling and Ingredients list */}
          <div className="md:col-span-1 space-y-6">
            
            {/* Interactive Scaling Widget */}
            <div className="bg-white rounded-premium border border-neutral-200/60 p-5 shadow-premium space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase font-bold text-neutral-400 tracking-wider">Scale Recipe</span>
                <span className="text-xs font-bold text-neutral-500">Servings</span>
              </div>
              
              <div className="flex justify-between items-center gap-4 bg-neutral-50 border border-neutral-100 p-2 rounded-xl">
                <button 
                  onClick={() => scaleIngredients(targetServings - 1)}
                  className="w-9 h-9 rounded-lg bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors flex items-center justify-center"
                >
                  <Minus className="w-4 h-4" />
                </button>
                
                <span className="font-display font-extrabold text-xl text-neutral-800">
                  {targetServings}
                </span>

                <button 
                  onClick={() => scaleIngredients(targetServings + 1)}
                  className="w-9 h-9 rounded-lg bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="text-[10px] text-neutral-400 text-center">
                Amounts adapt dynamically as servings adjust.
              </div>
            </div>

            {/* Structured Ingredients Checklist */}
            <div className="bg-white rounded-premium border border-neutral-200/60 p-5 shadow-premium space-y-4">
              <h3 className="font-display font-bold text-neutral-900 text-base">Ingredients</h3>
              
              <ul className="space-y-3">
                {scaledIngredients.map((ing, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-700 leading-relaxed">
                    <input 
                      type="checkbox" 
                      className="mt-1.5 accent-brand-600 rounded" 
                    />
                    <span>{ing}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* RIGHT COLUMN: Chronological Steps & Comments */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Steps panel */}
            <div className="bg-white rounded-premium border border-neutral-200/60 p-6 shadow-premium space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                <h3 className="font-display font-bold text-neutral-900 text-lg">Instructions</h3>
                
                <div className="flex gap-4 text-xs font-semibold text-neutral-500">
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-neutral-400" /> Cook: {recipe.cookTime}m</span>
                  <span className="flex items-center gap-1"><Users className="w-4 h-4 text-neutral-400" /> Yield: {targetServings}</span>
                </div>
              </div>

              <ol className="space-y-6">
                {recipe.instructions.map((step, index) => (
                  <li key={index} className="flex gap-4 items-start">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center font-display font-bold text-xs text-brand-850">
                      {index + 1}
                    </span>
                    <p className="text-neutral-700 text-sm sm:text-base leading-relaxed pt-0.5">
                      {step}
                    </p>
                  </li>
                ))}
              </ol>
            </div>

            {/* Comments Board Panel */}
            <div className="bg-white rounded-premium border border-neutral-200/60 p-6 shadow-premium space-y-6">
              <div className="flex items-center gap-2 border-b border-neutral-100 pb-4">
                <MessageSquare className="w-5 h-5 text-neutral-400" />
                <h3 className="font-display font-bold text-neutral-900 text-lg">Reviews ({commentsList.length})</h3>
              </div>

              {/* Compose new comment */}
              <form onSubmit={handleCommentPost} className="flex gap-3">
                <input 
                  type="text" 
                  placeholder="Share your culinary results..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-grow px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none text-neutral-800 text-sm transition-all"
                />
                
                <button 
                  type="submit" 
                  className="bg-brand-900 text-white hover:bg-brand-800 p-3 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              {/* Comments renders */}
              <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
                {commentsList.map((com) => (
                  <div key={com.id} className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-100 space-y-2">
                    <div className="flex justify-between items-center text-[10px] text-neutral-400 font-semibold">
                      <span className="text-neutral-700 font-bold">{com.userName}</span>
                      <span>{new Date(com.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                      {com.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </article>
  );
}
