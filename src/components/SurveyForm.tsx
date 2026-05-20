import React, { useState } from 'react';
import type { SurveyData } from '../types';

interface Props {
  onSubmit: (data: SurveyData) => void;
}

const AGE_GROUPS = ["14-18", "19-30", "31-54", "55 and up"];
const SITES = ["Facebook", "Instagram", "Twitter", "SnapChat", "Linkedin", "WhatsApp", "Pinterest", "Reddit", "Other"];
const FREQUENCIES = ["Daily", "Every Other Day", "Once a Week", "Every Two Weeks", "Very Occasionally", "Never"];

const CONCERNS_QUESTIONS = [
  "In general, how concerned are you about your privacy while you are using social media sites?",
  "Are you concerned about online organizations not being who they claim they are?",
  "Are you concerned that you are asked for too much personal information when you register or make online purchases?",
  "Are you concerned about online identity theft?",
  "Are you concerned about people online not being who they say they are?",
  "Are you concerned that information about you could be found on an old computer?",
  "Are you concerned about people you do not know obtaining personal information about you from your social media site(s)?",
  "Are you concerned about who might see your information online?"
];

const BEHAVIORS_QUESTIONS = [
  "Do you clear your browser history regularly?",
  "Do you read a website's privacy policy before you register your information?",
  "Do you control what people can see about you online (e.g., have a private versus public profile)?",
  "Do you think about what you are posting and who might see it before you put it online?",
  "Do you limit what you post online (e.g., don't post pictures of children or certain social activities - drinking)?"
];

export function SurveyForm({ onSubmit }: Props) {
  const [age, setAge] = useState("");
  const [site, setSite] = useState("");
  const [siteOther, setSiteOther] = useState("");
  const [frequency, setFrequency] = useState("");
  
  const [qConcerns, setQConcerns] = useState<number[]>(Array(8).fill(0));
  const [qBehaviors, setQBehaviors] = useState<number[]>(Array(5).fill(0));

  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState("");

  const handleNext = () => {
    setError("");
    if (currentStep === 1) {
      if (!age || !site || !frequency || (site === "Other" && !siteOther.trim())) {
        setError("Please complete all fields before continuing.");
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (qConcerns.includes(0)) {
        setError("Please answer all questions before continuing.");
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (qBehaviors.includes(0)) {
        setError("Please answer all questions before submitting.");
        return;
      }
      handleSubmit();
    }
  };

  const handleBack = () => {
    setError("");
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    setError("");
    const scoreConcerns = qConcerns.reduce((a, b) => a + b, 0);
    const scoreBehaviors = qBehaviors.reduce((a, b) => a + b, 0);

    onSubmit({
      age,
      site,
      siteOther: site === "Other" ? siteOther : undefined,
      frequency,
      qConcerns,
      qBehaviors,
      scoreConcerns,
      scoreBehaviors
    });
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium text-slate-800">
            {currentStep === 1 && "Social Media Site Usage"}
            {currentStep === 2 && "Privacy Attitudes (Part 1)"}
            {currentStep === 3 && "Privacy Behaviors (Part 2)"}
          </h2>
          <span className="text-sm font-medium text-slate-500">Step {currentStep} of 3</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2">
          <div 
            className="bg-indigo-500 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {currentStep === 1 && (
        <div className="space-y-8 animate-in mt-4 fade-in slide-in-from-bottom-2">
          {/* Age Group */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Age Group</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {AGE_GROUPS.map(g => (
                <label key={g} className={`
                  cursor-pointer flex items-center justify-center p-3 rounded-xl border text-sm font-medium transition-colors
                  ${age === g ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}
                `}>
                  <input type="radio" className="hidden" name="age" value={g} checked={age === g} onChange={(e) => setAge(e.target.value)} />
                  {g}
                </label>
              ))}
            </div>
          </div>

          {/* Site */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Site Most Frequently Used</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SITES.map(s => (
                <label key={s} className={`
                  cursor-pointer flex items-center justify-center p-3 rounded-xl border text-sm font-medium transition-colors
                  ${site === s ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}
                `}>
                  <input type="radio" className="hidden" name="site" value={s} checked={site === s} onChange={(e) => setSite(e.target.value)} />
                  {s}
                </label>
              ))}
            </div>
            {site === "Other" && (
              <div className="mt-3">
                <input 
                  type="text" 
                  placeholder="Please specify" 
                  value={siteOther}
                  onChange={(e) => setSiteOther(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm text-slate-800"
                />
              </div>
            )}
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Frequency of Site Usage</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {FREQUENCIES.map(f => (
                <label key={f} className={`
                  cursor-pointer flex items-center justify-center p-3 rounded-xl border text-sm font-medium transition-colors text-center
                  ${frequency === f ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}
                `}>
                  <input type="radio" className="hidden" name="frequency" value={f} checked={frequency === f} onChange={(e) => setFrequency(e.target.value)} />
                  {f}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
          <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            We are interested in any privacy concerns you might have when online. Please answer every question using the full scale provided (1 = not at all, 5 = very much).
          </p>
          {CONCERNS_QUESTIONS.map((q, idx) => (
            <div key={idx} className="bg-slate-50 p-5 rounded-xl">
              <label className="block text-sm font-medium text-slate-800 mb-4">{idx + 1}. {q}</label>
              <div className="flex justify-between items-center sm:px-4 gap-2">
                <span className="text-xs text-slate-500 hidden sm:block">Not at all</span>
                <div className="flex space-x-2 sm:space-x-4 w-full sm:w-auto justify-between sm:justify-center">
                  {[1, 2, 3, 4, 5].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        const newQ = [...qConcerns];
                        newQ[idx] = val;
                        setQConcerns(newQ);
                      }}
                      className={`
                        w-10 h-10 rounded-full font-medium transition-all text-sm
                        ${qConcerns[idx] === val 
                          ? 'bg-indigo-600 text-white shadow-md' 
                          : 'bg-white border border-slate-300 text-slate-600 hover:border-indigo-400 hover:text-indigo-600'}
                      `}
                    >
                      {val}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-slate-500 hidden sm:block">Very much</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {currentStep === 3 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
          <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            We are interested in your online privacy related behaviours. Please answer every question using the full scale provided (1 = never, 5 = always).
          </p>
          {BEHAVIORS_QUESTIONS.map((q, idx) => (
            <div key={idx} className="bg-slate-50 p-5 rounded-xl">
              <label className="block text-sm font-medium text-slate-800 mb-4">{idx + 1}. {q}</label>
              <div className="flex justify-between items-center sm:px-4 gap-2">
                <span className="text-xs text-slate-500 hidden sm:block">Never</span>
                <div className="flex space-x-2 sm:space-x-4 w-full sm:w-auto justify-between sm:justify-center">
                  {[1, 2, 3, 4, 5].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        const newQ = [...qBehaviors];
                        newQ[idx] = val;
                        setQBehaviors(newQ);
                      }}
                      className={`
                        w-10 h-10 rounded-full font-medium transition-all text-sm
                        ${qBehaviors[idx] === val 
                          ? 'bg-indigo-600 text-white shadow-md' 
                          : 'bg-white border border-slate-300 text-slate-600 hover:border-indigo-400 hover:text-indigo-600'}
                      `}
                    >
                      {val}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-slate-500 hidden sm:block">Always</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 flex justify-between">
        {currentStep > 1 ? (
          <button 
            type="button" 
            onClick={handleBack}
            className="px-6 py-2.5 rounded-xl font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Back
          </button>
        ) : <div></div>}
        
        <button 
          type="button" 
          onClick={handleNext}
          className="px-8 py-2.5 rounded-xl font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
        >
          {currentStep === 3 ? "Submit Survey" : "Next Step"}
        </button>
      </div>
    </div>
  );
}
