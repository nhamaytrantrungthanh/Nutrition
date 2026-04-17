/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Search, Info, Flame, Utensils, AlertCircle, Droplet } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getNutritionDetails, NutritionInfo } from "./services/gemini";

export default function App() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nutrition, setNutrition] = useState<NutritionInfo | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);
    setNutrition(null);

    try {
      const data = await getNutritionDetails(query);
      if (!data.isValidFood) {
        setError("We couldn't recognize that food. Try searching for something else, like \"Avocado toast\" or \"1 bowl of oatmeal\".");
      } else {
        setNutrition(data);
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while analyzing the food. Please try again.");
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <div className="min-h-screen w-full mx-auto max-w-4xl px-4 py-12 md:py-20 flex flex-col items-center">
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full text-center space-y-4 mb-10"
      >
        <div className="inline-flex items-center justify-center p-3 mb-2 rounded-full bg-orange-100 text-orange-600">
          <Utensils size={32} strokeWidth={1.5} />
        </div>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-900">
          Nutrition Explorer
        </h1>
        <p className="text-slate-500 text-lg md:text-xl max-w-xl mx-auto font-light">
          Get calorie and major nutrition details for any food or meal.
        </p>
      </motion.div>

      <motion.div 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        className="w-full max-w-2xl relative mb-12"
      >
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 md:pl-6 flex items-center pointer-events-none">
            <Search className="h-5 w-5 md:h-6 md:w-6 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isSearching}
            placeholder='e.g. "2 slices of avocado toast" or "Big Mac"'
            className="block w-full pl-12 md:pl-16 pr-32 py-4 md:py-5 text-lg md:text-xl text-slate-900 bg-white border-2 border-slate-200 rounded-full focus:ring-0 focus:border-orange-500 transition-all outline-none disabled:opacity-70 disabled:cursor-not-allowed shadow-sm hover:shadow-md focus:shadow-md"
          />
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="absolute right-2 md:right-3 top-2 md:top-2.5 bottom-2 md:bottom-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-medium rounded-full px-5 md:px-8 transition-colors text-sm md:text-base flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
          >
            {isSearching ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Analyzing
              </span>
            ) : (
              "Analyze"
            )}
          </button>
        </form>
      </motion.div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="w-full max-w-2xl bg-red-50 text-red-800 p-6 rounded-3xl flex items-start gap-4 border border-red-100 shadow-sm"
          >
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-lg leading-relaxed">{error}</p>
          </motion.div>
        )}

        {nutrition && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-full max-w-3xl nutrition-card overflow-hidden"
          >
            {/* Header section with Calories */}
            <div className="bg-slate-900 text-white p-8 md:p-10 flex flex-col md:flex-row md:items-end justify-between gap-6 overflow-hidden relative">
              <div className="absolute -right-20 -top-20 opacity-5 w-64 h-64 rounded-full bg-white blur-3xl pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 text-slate-300 font-medium mb-3 text-sm tracking-wide uppercase">
                  <Info size={16} />
                  <span>{nutrition.servingSize}</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-2 leading-tight capitalize">
                  {nutrition.foodName}
                </h2>
              </div>
              
              <div className="relative z-10 flex flex-col md:items-end">
                <div className="flex items-center gap-2 text-orange-400 mb-1">
                  <Flame fill="currentColor" strokeWidth={0} size={24} />
                  <span className="font-medium text-lg uppercase tracking-wider">Calories</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-6xl md:text-7xl font-bold tracking-tighter">
                    {nutrition.calories}
                  </span>
                  <span className="text-xl text-slate-400 font-medium">kcal</span>
                </div>
              </div>
            </div>

            {/* Macros Section */}
            <div className="p-8 md:p-10">
              <h3 className="text-lg font-semibold text-slate-900 mb-6 uppercase tracking-wider">Macronutrients</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {/* Protein */}
                <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 flex flex-col">
                  <div className="font-semibold text-rose-800 text-sm tracking-wider uppercase mb-4 flex items-center justify-between">
                    Protein
                    <Droplet size={16} className="text-rose-400" />
                  </div>
                  <div className="flex items-baseline gap-1 mt-auto">
                    <span className="text-4xl font-bold text-slate-900">{nutrition.proteinGrams}</span>
                    <span className="text-lg text-slate-500 font-medium">g</span>
                  </div>
                </div>

                {/* Carbs */}
                <div className="bg-sky-50 p-6 rounded-2xl border border-sky-100 flex flex-col">
                  <div className="font-semibold text-sky-800 text-sm tracking-wider uppercase mb-4 flex items-center justify-between">
                    Carbs
                    <Droplet size={16} className="text-sky-400" />
                  </div>
                  <div className="flex items-baseline gap-1 mt-auto">
                    <span className="text-4xl font-bold text-slate-900">{nutrition.carbsGrams}</span>
                    <span className="text-lg text-slate-500 font-medium">g</span>
                  </div>
                </div>

                {/* Fat */}
                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 flex flex-col">
                  <div className="font-semibold text-amber-800 text-sm tracking-wider uppercase mb-4 flex items-center justify-between">
                    Fat
                    <Droplet size={16} className="text-amber-400" />
                  </div>
                  <div className="flex items-baseline gap-1 mt-auto">
                    <span className="text-4xl font-bold text-slate-900">{nutrition.fatGrams}</span>
                    <span className="text-lg text-slate-500 font-medium">g</span>
                  </div>
                </div>
              </div>

              {/* Micros Details Check */}
              {(nutrition.sugarGrams !== undefined || nutrition.fiberGrams !== undefined || nutrition.sodiumMg !== undefined) && (
                <>
                  <div className="h-px w-full bg-slate-100 mb-8"></div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    {nutrition.sugarGrams !== undefined && nutrition.sugarGrams !== null && (
                      <div className="text-center">
                        <div className="text-slate-500 text-sm font-medium mb-1">Sugar</div>
                        <div className="text-xl font-semibold text-slate-800">{nutrition.sugarGrams}g</div>
                      </div>
                    )}
                    {nutrition.fiberGrams !== undefined && nutrition.fiberGrams !== null && (
                      <div className="text-center border-l border-slate-100">
                        <div className="text-slate-500 text-sm font-medium mb-1">Fiber</div>
                        <div className="text-xl font-semibold text-slate-800">{nutrition.fiberGrams}g</div>
                      </div>
                    )}
                    {nutrition.sodiumMg !== undefined && nutrition.sodiumMg !== null && (
                      <div className="text-center border-l border-slate-100">
                        <div className="text-slate-500 text-sm font-medium mb-1">Sodium</div>
                        <div className="text-xl font-semibold text-slate-800">{nutrition.sodiumMg}mg</div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
