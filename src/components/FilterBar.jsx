import React from 'react';
import { CATEGORIES, GENDERS, SIZES } from '../data/initialShoes';
import { Filter, ArrowUpDown, Tag, Check, Sparkles } from 'lucide-react';

export function FilterBar({
  selectedCategory,
  setSelectedCategory,
  selectedGender,
  setSelectedGender,
  selectedSize,
  setSelectedSize,
  onlyOffers,
  setOnlyOffers,
  sortBy,
  setSortBy,
  totalResults
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-4">
      
      {/* Category Pills (Horizontal scroll on mobile) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all shadow-sm ${
                isActive
                  ? 'bg-slate-900 text-white shadow-slate-900/20 scale-[1.02]'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {cat === 'Todos' && '👟 '}
              {cat === 'Deportivo' && '⚡ '}
              {cat === 'Casual' && '✨ '}
              {cat === 'Formal' && '👔 '}
              {cat === 'Botas' && '🥾 '}
              {cat === 'Sandalias' && '☀️ '}
              {cat}
            </button>
          );
        })}
      </div>

      {/* Sub-Filters: Gender, Size, Offer toggle, Sorting */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Gender + Offer */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
            Para:
          </span>
          {GENDERS.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGender(g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedGender === g
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {g}
            </button>
          ))}

          <button
            onClick={() => setOnlyOffers(!onlyOffers)}
            className={`ml-1 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              onlyOffers
                ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30'
                : 'bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>En Oferta</span>
            {onlyOffers && <Check className="w-3 h-3 ml-0.5" />}
          </button>
        </div>

        {/* Sizes Quick Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            Talla:
          </span>
          <button
            onClick={() => setSelectedSize(null)}
            className={`px-2.5 py-1 rounded-md text-xs font-bold shrink-0 ${
              selectedSize === null
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todas
          </button>
          {SIZES.map((sz) => (
            <button
              key={sz}
              onClick={() => setSelectedSize(selectedSize === sz ? null : sz)}
              className={`w-7 h-7 rounded-md text-xs font-bold flex items-center justify-center shrink-0 transition-all ${
                selectedSize === sz
                  ? 'bg-emerald-600 text-white shadow-sm scale-110'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {sz}
            </button>
          ))}
        </div>

        {/* Sorting + Count */}
        <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
          <span className="text-xs font-medium text-slate-500">
            {totalResults} {totalResults === 1 ? 'modelo' : 'modelos'}
          </span>
          
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-1.5 px-2.5 rounded-lg border-0 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="featured">Destacados</option>
              <option value="price-low">Precio: Menor a Mayor</option>
              <option value="price-high">Precio: Mayor a Menor</option>
              <option value="rating">Mejor Calificación</option>
              <option value="newest">Más Recientes</option>
            </select>
          </div>
        </div>

      </div>

    </div>
  );
}
