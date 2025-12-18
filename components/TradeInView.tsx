import React, { useState } from 'react';
import { estimateTradeInValue } from '../services/geminiService';
import { Smartphone, CheckCircle, Loader2, ArrowRight } from 'lucide-react';

export const TradeInView: React.FC = () => {
  const [formData, setFormData] = useState({
    model: '',
    storage: '128GB',
    condition: 'good'
  });
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.model) return;

    setLoading(true);
    setResult(null);

    const estimation = await estimateTradeInValue(
      formData.model,
      formData.condition,
      formData.storage
    );

    setResult(estimation);
    setLoading(false);
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-12">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden md:flex border border-slate-100 dark:border-slate-700 transition-colors duration-200">
        
        {/* Left Side: Form */}
        <div className="p-8 md:w-1/2 bg-white dark:bg-slate-800 transition-colors duration-200">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
              <Smartphone className="mr-3 text-slate-900 dark:text-white" />
              Trade-in Value
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
              Get an instant AI-powered estimate for your current device.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Device Model</label>
              <input
                type="text"
                required
                placeholder="e.g. iPhone 13 Pro Max"
                value={formData.model}
                onChange={(e) => setFormData({...formData, model: e.target.value})}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-2xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 dark:bg-slate-700 dark:text-white transition-colors outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Storage</label>
              <select
                value={formData.storage}
                onChange={(e) => setFormData({...formData, storage: e.target.value})}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-2xl focus:ring-2 focus:ring-slate-500 outline-none bg-white dark:bg-slate-700 dark:text-white appearance-none"
              >
                {['64GB', '128GB', '256GB', '512GB', '1TB'].map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Condition</label>
              <div className="grid grid-cols-3 gap-2">
                {['poor', 'good', 'mint'].map((cond) => (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => setFormData({...formData, condition: cond})}
                    className={`py-2.5 px-3 text-sm rounded-xl capitalize border transition-all ${
                      formData.condition === cond
                        ? 'bg-slate-100 dark:bg-slate-600 border-slate-900 dark:border-white text-slate-900 dark:text-white font-bold'
                        : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cond}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-slate-900 text-white py-3.5 rounded-2xl hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 transition-colors flex justify-center items-center font-bold disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Analyzing Market...
                </>
              ) : (
                'Get Estimate'
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Result */}
        <div className="md:w-1/2 bg-slate-50 dark:bg-slate-900 p-8 flex flex-col justify-center border-l border-slate-100 dark:border-slate-700 transition-colors duration-200">
          {!result && !loading && (
            <div className="text-center text-slate-400 dark:text-slate-500">
              <Smartphone className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p>Enter your device details to see how much you can save on your next upgrade.</p>
            </div>
          )}

          {loading && (
             <div className="text-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-full mb-3"></div>
                    <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded-full mb-3"></div>
                    <div className="h-10 w-1/3 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">Consulting real-time market data...</p>
             </div>
          )}

          {result && !loading && (
            <div className="animate-fade-in-up">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-600">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold tracking-wider text-slate-900 dark:text-white uppercase">Estimated Value</span>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                
                {/* We render the text with line breaks */}
                <div className="whitespace-pre-line text-slate-800 dark:text-slate-200 text-sm leading-relaxed">
                  {result}
                </div>
              </div>

              <div className="mt-6">
                <button className="w-full group flex items-center justify-between px-5 py-3.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-2xl text-slate-700 dark:text-slate-200 hover:border-slate-900 hover:text-slate-900 dark:hover:border-white dark:hover:text-white transition-all shadow-sm">
                  <span className="font-bold">Apply to Purchase</span>
                  <ArrowRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};