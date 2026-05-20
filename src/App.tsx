import React, { useState } from 'react';
import { SurveyForm } from './components/SurveyForm';
import type { SurveyData } from './types';
import { ShieldCheck, Activity } from 'lucide-react';

export default function App() {
  const [submittedData, setSubmittedData] = useState<SurveyData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSurveySubmit = async (data: SurveyData) => {
    setIsSubmitting(true);
    setError('');
    try {
      const response = await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to submit survey');
      }

      setSubmittedData(data);
    } catch (err) {
      console.error(err);
      setError('An error occurred while saving your response. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedData) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-900">
        <div className="max-w-2xl mx-auto text-center mt-10">
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200">
            <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-4 tracking-tight">Survey Completed</h1>
            <p className="text-slate-600 text-lg mb-8 leading-relaxed">
              Thank you for participating! Here are your generated scores based on your responses.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
              <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 flex flex-col items-center">
                <span className="text-sm font-medium text-indigo-800 mb-2 uppercase tracking-wider">Attitudes Score</span>
                <span className="text-5xl font-bold text-indigo-600 tracking-tight">{submittedData.scoreConcerns}</span>
                <span className="text-xs text-indigo-500 mt-2 font-medium">Out of 40</span>
                <p className="text-xs text-center text-indigo-700 mt-4">
                  Higher scores indicate greater concern for online privacy.
                </p>
              </div>
              <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex flex-col items-center">
                <span className="text-sm font-medium text-emerald-800 mb-2 uppercase tracking-wider">Behaviors Score</span>
                <span className="text-5xl font-bold text-emerald-600 tracking-tight">{submittedData.scoreBehaviors}</span>
                <span className="text-xs text-emerald-500 mt-2 font-medium">Out of 25</span>
                <p className="text-xs text-center text-emerald-700 mt-4">
                  Higher scores indicate more proactive privacy behaviors.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto mb-10 text-center">
        <div className="w-16 h-16 bg-white border border-slate-200 shadow-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Activity className="w-8 h-8 text-indigo-600" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
          Social Media & Privacy Survey
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed">
          We want to understand your social media usage patterns and your attitudes towards online privacy. This survey will take approximately 2 minutes.
        </p>
      </div>

      {error && (
        <div className="max-w-3xl mx-auto mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-center font-medium">
          {error}
        </div>
      )}

      {isSubmitting ? (
        <div className="max-w-3xl mx-auto bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-slate-600 font-medium">Saving your responses...</p>
        </div>
      ) : (
        <SurveyForm onSubmit={handleSurveySubmit} />
      )}
    </div>
  );
}
