import React, { useState } from 'react';
import { Sparkles, ArrowRight, RotateCcw, CheckCircle2, Flame, Wallet, MapPin, Heart } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import { ProductGridSkeleton } from '../components/common/LoadingSkeleton';
import { recommendationService } from '../services/recommendationService';

const stepsData = [
  {
    id: 'foodType',
    title: "What are you craving today?",
    subtitle: "Select your main food craving or shopping goal",
    options: [
      { label: 'Spicy', icon: '🌶️', desc: 'Pickles, coarse chutneys & curry masalas' },
      { label: 'Sweet', icon: '🍯', desc: 'Puran Poli, Besan Ladoo & Alphonso preserves' },
      { label: 'Snacks', icon: '🥨', tag: 'Chivda & Bakarwadi', desc: 'Crispy evening tea-time savories' },
      { label: 'Healthy', icon: '🌾', desc: 'Millet crispies, Jowar pops & A2 ghee' },
      { label: 'Traditional', icon: '🍲', desc: 'Heritage recipes & comfort grain powders' },
      { label: 'Gift', icon: '🎁', desc: 'Festive trunks & sweet boxes' }
    ]
  },
  {
    id: 'budget',
    title: "What is your budget?",
    subtitle: "Choose your preferred price window",
    options: [
      { label: 'Under ₹200', value: 'under200', icon: '🪙', desc: 'Affordable everyday snacks & masalas' },
      { label: '₹200–₹500', value: '200-500', icon: '💵', desc: 'Standard pack sizes & sweet boxes' },
      { label: '₹500+', value: '500plus', icon: '✨', desc: 'Premium gift trunks & pure A2 ghee' }
    ]
  },
  {
    id: 'spiceLevel',
    title: "How spicy do you like it?",
    subtitle: "Set your heat tolerance level",
    options: [
      { label: 'Mild', icon: '🟢', desc: 'Gentle aromatic spice blend' },
      { label: 'Medium', icon: '🟡', desc: 'Balanced Maharashtrian heat' },
      { label: 'Spicy', icon: '🔴', desc: 'Fiery Kolhapuri & Saoji punch' },
      { label: "Doesn't matter", icon: '⚪', desc: 'Show all spice levels' }
    ]
  },
  {
    id: 'region',
    title: "What's your regional preference?",
    subtitle: "Select your regional culinary focus",
    options: [
      { label: 'Maharashtrian', icon: '🚩', desc: 'Authentic Konkan, Kolhapur, Vidarbha & Pune' },
      { label: 'Traditional Indian', icon: '🪔', desc: 'Pan-Indian heritage snacks' },
      { label: 'Any', icon: '🌏', desc: 'Explore all regional specialties' }
    ]
  }
];

const SmartFinder = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({
    foodType: '',
    budget: '',
    spiceLevel: '',
    region: ''
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

  const submitQuiz = async (finalAnswers) => {
    try {
      setLoading(true);
      setCompleted(true);
      const res = await recommendationService.submitSmartFinder(finalAnswers);
      if (res.success) {
        setResults(res.data);
      }
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAnswers({ foodType: '', budget: '', spiceLevel: '', region: '' });
    setCurrentStep(0);
    setCompleted(false);
    setResults([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100 text-brand-700 text-xs font-bold border border-brand-200 shadow-2xs">
          <Sparkles className="w-4 h-4 text-brand-600" />
          <span>Interactive Taste Guide</span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-charcoal">
          Find Delicacies Matched to Your Taste
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-muted">
          Answer 4 quick questions to get personalized food recommendations based on your taste, budget, and heat tolerance.
        </p>
      </div>

      {!completed ? (
        /* QUESTIONNAIRE FLOW */
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-warmbg-accent shadow-sm space-y-8">
          
          {/* Progress Indicator */}
          <div>
            <div className="flex justify-between text-xs font-bold text-charcoal-muted mb-2">
              <span>Step {currentStep + 1} of {stepsData.length}</span>
              <span>{Math.round(((currentStep + 1) / stepsData.length) * 100)}% Completed</span>
            </div>
            <div className="w-full h-2.5 bg-warmbg-card rounded-full overflow-hidden border border-warmbg-accent">
              <div 
                className="h-full bg-brand-600 rounded-full transition-all duration-300"
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
                  className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 group ${
                    isSelected 
                      ? 'border-brand-600 bg-brand-50 shadow-sm' 
                      : 'border-warmbg-accent bg-warmbg-card hover:border-brand-300 hover:bg-white'
                  }`}
                >
                  <span className="text-2xl p-2 rounded-xl bg-white shadow-2xs group-hover:scale-110 transition-transform">{opt.icon}</span>
                  <div>
                    <h3 className="font-display font-bold text-sm text-charcoal group-hover:text-brand-600 transition-colors">{opt.label}</h3>
                    <p className="text-xs text-charcoal-muted leading-snug mt-0.5">{opt.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          {currentStep > 0 && (
            <div className="flex justify-between items-center pt-4 border-t border-warmbg-soft text-xs">
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="font-bold text-charcoal-muted hover:text-charcoal transition-colors"
              >
                ← Back
              </button>
            </div>
          )}

        </div>
      ) : (
        /* RECOMMENDATION RESULTS VIEW */
        <div className="space-y-8 animate-in fade-in duration-500">
          
          {/* Results Summary Bar */}
          <div className="bg-brand-50 rounded-2xl p-6 border border-brand-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h2 className="font-display font-bold text-lg text-charcoal">Recommended For Your Taste</h2>
              </div>
              <p className="text-xs text-charcoal-muted">
                Selection based on: Craving ({answers.foodType}), Budget ({answers.budget}), Spice ({answers.spiceLevel}), Region ({answers.region}).
              </p>
            </div>

            <button
              onClick={handleReset}
              className="px-4 py-2 bg-white hover:bg-warmbg-soft text-charcoal font-bold text-xs rounded-xl border border-warmbg-accent flex items-center gap-2 shadow-2xs transition-all flex-shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5 text-brand-600" />
              Retake Guide
            </button>
          </div>

          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : results.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-warmbg-accent">
              <p className="text-sm text-charcoal-muted mb-4">No exact matches found for your criteria.</p>
              <button onClick={handleReset} className="px-6 py-2.5 bg-brand-600 text-white font-bold rounded-xl text-xs">
                Try Different Options
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {results.map((product) => (
                <div key={product._id} className="relative flex flex-col h-full">
                  
                  {/* Match Badge Header */}
                  <div className="bg-charcoal text-white text-xs px-3 py-2 rounded-t-2xl flex items-center justify-between border-b border-white/10">
                    <span className="font-display font-black text-amber-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      {product.matchScore}% Taste Match
                    </span>
                    <span className="text-[10px] text-charcoal-light truncate max-w-[120px]">
                      {product.recommendationReasons?.[0] || 'Top Match'}
                    </span>
                  </div>

                  <ProductCard product={product} />

                  {/* Why recommended rationale */}
                  {product.recommendationReasons && product.recommendationReasons.length > 0 && (
                    <div className="bg-amber-50/80 p-2.5 rounded-b-2xl border-x border-b border-amber-200/80 text-[11px] text-amber-900 space-y-1">
                      <span className="font-bold block text-[10px] uppercase tracking-wider text-brand-700">Why this fits your taste:</span>
                      <ul className="space-y-0.5">
                        {product.recommendationReasons.slice(0, 2).map((reason, idx) => (
                          <li key={idx} className="flex items-center gap-1">
                            <span className="text-brand-600">•</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default SmartFinder;
