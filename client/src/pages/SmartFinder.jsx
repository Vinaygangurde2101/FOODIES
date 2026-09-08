import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, RotateCcw, CheckCircle2, SlidersHorizontal, Award } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import { ProductGridSkeleton } from '../components/common/LoadingSkeleton';
import { recommendationService } from '../services/recommendationService';
import { computeTasteRecommendations } from '../services/recommendationEngine';

const stepsData = [
  {
    id: 'foodType',
    title: "What are you craving today?",
    subtitle: "Select your main food craving or shopping goal",
    options: [
      { label: 'Spicy', icon: '🌶️', desc: 'Pickles, coarse chutneys & fiery curry masalas' },
      { label: 'Sweet', icon: '🍯', desc: 'Puran Poli, Besan Ladoo & Alphonso preserves' },
      { label: 'Snacks', icon: '🥨', desc: 'Crispy Puneri Chivda, Bakarwadi & tea savories' },
      { label: 'Healthy', icon: '🌾', desc: 'Millet crispies, Jowar pops & organic A2 ghee' },
      { label: 'Traditional', icon: '🍲', desc: 'Heritage regional recipes & comfort food' },
      { label: 'Gift', icon: '🎁', desc: 'Festive sweet trunks & handcrafted gift boxes' }
    ]
  },
  {
    id: 'budget',
    title: "What is your preferred budget?",
    subtitle: "Choose your preferred price window",
    options: [
      { label: 'Under ₹200', value: 'under200', icon: '🪙', desc: 'Affordable everyday masalas & light snacks' },
      { label: '₹200–₹500', value: '200-500', icon: '💵', desc: 'Standard family sizes & sweet boxes' },
      { label: '₹500+', value: '500plus', icon: '✨', desc: 'Premium gift sets & pure A2 Gir cow ghee' }
    ]
  },
  {
    id: 'spiceLevel',
    title: "How spicy do you like it?",
    subtitle: "Set your heat tolerance level",
    options: [
      { label: 'Mild', icon: '🟢', desc: 'Gentle, aromatic non-spicy flavors' },
      { label: 'Medium', icon: '🟡', desc: 'Balanced traditional heat' },
      { label: 'Spicy', icon: '🔴', desc: 'Fiery Kolhapuri & Saoji punch' },
      { label: "Doesn't matter", value: 'Any', icon: '⚪', desc: 'Explore all spice levels' }
    ]
  },
  {
    id: 'region',
    title: "What's your regional preference?",
    subtitle: "Select your preferred regional culinary focus",
    options: [
      { label: 'Maharashtrian', icon: '🚩', desc: 'Authentic Konkan, Kolhapur, Vidarbha & Pune' },
      { label: 'Traditional Indian', icon: '🪔', desc: 'Pan-Indian heritage snacks' },
      { label: 'Any', icon: '🌏', desc: 'Explore all regional delicacies' }
    ]
  }
];

const PRESETS = [
  { name: '🌶️ Kolhapuri Spice Master', answers: { foodType: 'Spicy', budget: '200-500', spiceLevel: 'Spicy', region: 'Maharashtrian' } },
  { name: '🥨 Teatime Snack Lover', answers: { foodType: 'Snacks', budget: 'under200', spiceLevel: 'Medium', region: 'Maharashtrian' } },
  { name: '🍯 Festive Sweet Tooth', answers: { foodType: 'Sweet', budget: '200-500', spiceLevel: 'Mild', region: 'Maharashtrian' } },
  { name: '🌾 Healthy Organic', answers: { foodType: 'Healthy', budget: 'under200', spiceLevel: 'Mild', region: 'Any' } }
];

const SmartFinder = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({
    foodType: 'Spicy',
    budget: '200-500',
    spiceLevel: 'Spicy',
    region: 'Maharashtrian'
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const currentStepInfo = stepsData[currentStep];

  const handleSelectOption = (value) => {
    const field = currentStepInfo.id;
    const updatedAnswers = { ...answers, [field]: value };
    setAnswers(updatedAnswers);

    if (currentStep < stepsData.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      submitQuiz(updatedAnswers);
    }
  };

  const applyPreset = (presetAnswers) => {
    setAnswers(presetAnswers);
    submitQuiz(presetAnswers);
  };

  const submitQuiz = async (finalAnswers) => {
    setCompleted(true);
    setLoading(true);

    // 1. Instant local computation (0ms response guarantee)
    const localMatches = computeTasteRecommendations(finalAnswers, 12);
    if (localMatches && localMatches.length > 0) {
      setResults(localMatches);
    }
    setLoading(false);

    // 2. Background sync with server backend API if available
    try {
      const res = await recommendationService.submitSmartFinder(finalAnswers);
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        setResults(res.data);
      }
    } catch (err) {
      console.warn('Backend taste recommendation sync handled silently:', err.message);
    }
  };

  const handleLiveFilterChange = (field, value) => {
    const updated = { ...answers, [field]: value };
    setAnswers(updated);
    submitQuiz(updated);
  };

  const handleReset = () => {
    setAnswers({ foodType: 'Spicy', budget: '200-500', spiceLevel: 'Spicy', region: 'Maharashtrian' });
    setCurrentStep(0);
    setCompleted(false);
    setResults([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-100 text-brand-700 text-xs font-bold border border-brand-200 shadow-2xs">
          <Sparkles className="w-4 h-4 text-brand-600 animate-pulse" />
          <span>Smart Food Finder & Taste Matcher</span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-charcoal tracking-tight">
          Find Authentic Delicacies Matched to Your Exact Taste
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-muted max-w-xl mx-auto">
          Answer 4 quick taste questions or pick an instant preset to get personalized regional food recommendations scored with our AI taste algorithm.
        </p>

        {/* Instant Quick Presets Bar */}
        {!completed && (
          <div className="pt-4 flex flex-wrap justify-center items-center gap-2">
            <span className="text-xs font-bold text-charcoal-muted mr-1">Quick Picks:</span>
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset.answers)}
                className="px-3.5 py-1.5 rounded-full bg-white hover:bg-brand-50 border border-warmbg-accent hover:border-brand-300 text-charcoal text-xs font-semibold shadow-2xs transition-all flex items-center gap-1 hover:scale-105 active:scale-95 cursor-pointer"
              >
                {preset.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {!completed ? (
        /* QUESTIONNAIRE STEPPER FLOW */
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-warmbg-accent shadow-sm space-y-8 relative overflow-hidden">
          
          {/* Progress Indicator */}
          <div>
            <div className="flex justify-between text-xs font-bold text-charcoal-muted mb-2">
              <span>Step {currentStep + 1} of {stepsData.length}: <strong className="text-brand-600">{currentStepInfo.title}</strong></span>
              <span>{Math.round(((currentStep + 1) / stepsData.length) * 100)}%</span>
            </div>
            <div className="w-full h-3 bg-warmbg-card rounded-full overflow-hidden border border-warmbg-accent">
              <div 
                className="h-full bg-brand-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((currentStep + 1) / stepsData.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Header */}
          <div className="space-y-1 text-center">
            <h2 className="font-display font-bold text-2xl text-charcoal">{currentStepInfo.title}</h2>
            <p className="text-xs text-charcoal-muted">{currentStepInfo.subtitle}</p>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentStepInfo.options.map((opt) => {
              const val = opt.value || opt.label;
              const isSelected = answers[currentStepInfo.id] === val;

              return (
                <button
                  key={opt.label}
                  onClick={() => handleSelectOption(val)}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 group cursor-pointer ${
                    isSelected 
                      ? 'border-brand-600 bg-brand-50/80 shadow-md ring-2 ring-brand-500/20' 
                      : 'border-warmbg-accent bg-warmbg-card hover:border-brand-300 hover:bg-white hover:shadow-sm'
                  }`}
                >
                  <span className="text-2xl p-2.5 rounded-xl bg-white shadow-2xs group-hover:scale-110 transition-transform flex-shrink-0">{opt.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-sm text-charcoal group-hover:text-brand-600 transition-colors flex items-center justify-between">
                      <span>{opt.label}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
                    </h3>
                    <p className="text-xs text-charcoal-muted leading-snug mt-1">{opt.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center pt-4 border-t border-warmbg-soft text-xs">
            {currentStep > 0 ? (
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-4 py-2 font-bold text-charcoal-muted hover:text-charcoal hover:bg-warmbg-soft rounded-xl transition-colors"
              >
                ← Back
              </button>
            ) : (
              <span className="text-xs text-charcoal-muted">Select an option to proceed</span>
            )}

            <button
              onClick={() => {
                if (currentStep < stepsData.length - 1) {
                  setCurrentStep(prev => prev + 1);
                } else {
                  submitQuiz(answers);
                }
              }}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <span>{currentStep === stepsData.length - 1 ? 'Show Recommendations' : 'Next Step'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      ) : (
        /* RECOMMENDATION RESULTS DASHBOARD */
        <div className="space-y-8 animate-in fade-in duration-500">
          
          {/* Taste Profile Summary & Live Tuner Bar */}
          <div className="bg-white rounded-3xl p-6 border border-warmbg-accent shadow-sm space-y-4">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-warmbg-soft">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-5 h-5 text-brand-600" />
                  <h2 className="font-display font-bold text-xl text-charcoal">Your Personalized Taste Recommendations</h2>
                </div>
                <p className="text-xs text-charcoal-muted">
                  Scored based on your craving ({answers.foodType}), spice ({answers.spiceLevel}), budget ({answers.budget}), and region ({answers.region}).
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-warmbg-soft hover:bg-warmbg-card text-charcoal font-bold text-xs rounded-xl border border-warmbg-accent flex items-center gap-2 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-brand-600" />
                  Retake Quiz
                </button>
              </div>
            </div>

            {/* Live Filter Tuner Pills */}
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <span className="font-bold text-charcoal flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-brand-600" />
                Tune Taste Criteria:
              </span>

              {/* Craving Filter */}
              <div className="flex items-center gap-1.5 bg-warmbg-card px-3 py-1.5 rounded-xl border border-warmbg-accent">
                <span className="text-charcoal-muted font-medium">Craving:</span>
                <select
                  value={answers.foodType}
                  onChange={(e) => handleLiveFilterChange('foodType', e.target.value)}
                  className="bg-transparent font-bold text-brand-700 outline-none cursor-pointer"
                >
                  <option value="Spicy">Spicy</option>
                  <option value="Sweet">Sweet</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Healthy">Healthy</option>
                  <option value="Traditional">Traditional</option>
                  <option value="Gift">Gift</option>
                </select>
              </div>

              {/* Spice Filter */}
              <div className="flex items-center gap-1.5 bg-warmbg-card px-3 py-1.5 rounded-xl border border-warmbg-accent">
                <span className="text-charcoal-muted font-medium">Spice:</span>
                <select
                  value={answers.spiceLevel}
                  onChange={(e) => handleLiveFilterChange('spiceLevel', e.target.value)}
                  className="bg-transparent font-bold text-brand-700 outline-none cursor-pointer"
                >
                  <option value="Mild">Mild</option>
                  <option value="Medium">Medium</option>
                  <option value="Spicy">Spicy</option>
                  <option value="Any">All Spices</option>
                </select>
              </div>

              {/* Budget Filter */}
              <div className="flex items-center gap-1.5 bg-warmbg-card px-3 py-1.5 rounded-xl border border-warmbg-accent">
                <span className="text-charcoal-muted font-medium">Budget:</span>
                <select
                  value={answers.budget}
                  onChange={(e) => handleLiveFilterChange('budget', e.target.value)}
                  className="bg-transparent font-bold text-brand-700 outline-none cursor-pointer"
                >
                  <option value="under200">Under ₹200</option>
                  <option value="200-500">₹200–₹500</option>
                  <option value="500plus">₹500+</option>
                </select>
              </div>

              {/* Region Filter */}
              <div className="flex items-center gap-1.5 bg-warmbg-card px-3 py-1.5 rounded-xl border border-warmbg-accent">
                <span className="text-charcoal-muted font-medium">Region:</span>
                <select
                  value={answers.region}
                  onChange={(e) => handleLiveFilterChange('region', e.target.value)}
                  className="bg-transparent font-bold text-brand-700 outline-none cursor-pointer"
                >
                  <option value="Maharashtrian">Maharashtrian</option>
                  <option value="Traditional Indian">Traditional Indian</option>
                  <option value="Any">Any Region</option>
                </select>
              </div>

            </div>

          </div>

          {/* Results Grid */}
          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : results.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-warmbg-accent space-y-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto text-xl">
                🍲
              </div>
              <h3 className="font-display font-bold text-lg text-charcoal">No exact matches found</h3>
              <p className="text-xs text-charcoal-muted max-w-sm mx-auto">
                Try widening your budget or selecting "All Spices" in the taste tuner above to see delicious items.
              </p>
              <button 
                onClick={handleReset} 
                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer"
              >
                Reset Taste Finder
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {results.map((product, idx) => {
                const prodId = product._id || product.slug || `prod-${idx}`;
                const isSuperMatch = product.matchScore >= 90;

                return (
                  <div key={prodId} className="relative flex flex-col h-full group">
                    
                    {/* Match Score Header Badge */}
                    <div className={`text-white text-xs px-3 py-2 rounded-t-2xl flex items-center justify-between ${
                      isSuperMatch ? 'bg-emerald-900' : 'bg-charcoal'
                    }`}>
                      <span className={`font-display font-black flex items-center gap-1.5 ${
                        isSuperMatch ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        <Sparkles className="w-3.5 h-3.5" />
                        {product.matchScore}% Taste Match
                      </span>
                      <span className="text-[10px] text-white/80 font-medium truncate max-w-[110px]">
                        {product.recommendationReasons?.[0] || 'Top Recommendation'}
                      </span>
                    </div>

                    <ProductCard product={product} />

                    {/* Recommendation Reasons Rationale Box */}
                    {product.recommendationReasons && product.recommendationReasons.length > 0 && (
                      <div className="bg-amber-50/90 p-3 rounded-b-2xl border-x border-b border-amber-200/80 text-[11px] text-amber-950 space-y-1 mt-auto">
                        <span className="font-bold block text-[10px] uppercase tracking-wider text-brand-700">Why this fits your taste:</span>
                        <ul className="space-y-1">
                          {product.recommendationReasons.slice(0, 2).map((reason, rIdx) => (
                            <li key={rIdx} className="flex items-start gap-1.5">
                              <span className="text-brand-600 font-bold">•</span>
                              <span className="leading-snug">{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default SmartFinder;
