import React, { useState } from 'react';
import { SurveyForm } from './components/SurveyForm';
import type { SurveyData } from './types';
import { ShieldCheck, Activity, Download } from 'lucide-react';

export default function App() {
  const [submittedData, setSubmittedData] = useState<SurveyData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
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

  const handleDownloadExcel = async () => {
    setIsDownloading(true);
    setError('');
    try {
      const response = await fetch('/api/results');
      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }
      const results = await response.json();
      
      if (!results || results.length === 0) {
        setError('No survey responses available to download.');
        return;
      }

      // Calculate averages by age group
      const AGE_GROUPS = ["14-18", "19-30", "31-54", "55 and up"];
      const averagesByAgeGroup = AGE_GROUPS.map(group => {
        const groupResponses = results.filter((r: any) => r.age === group);
        if (groupResponses.length === 0) {
          return { group, avgConcern: "N/A", avgBehavior: "N/A" };
        }
        const sumConcern = groupResponses.reduce((sum: number, r: any) => sum + (r.score_concerns || 0), 0);
        const sumBehavior = groupResponses.reduce((sum: number, r: any) => sum + (r.score_behaviors || 0), 0);
        return {
          group,
          avgConcern: (sumConcern / groupResponses.length).toFixed(2),
          avgBehavior: (sumBehavior / groupResponses.length).toFixed(2)
        };
      });

      const escapeCSV = (val: any) => {
        if (val === null || val === undefined) return '';
        const str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const headers = [
        "Referrer",
        "Age",
        "SiteUsedMostFrequently",
        "FrequencyOfUse",
        "PrivacyConcernScore",
        "PrivacyBehaviorScore",
        "",
        "Age Group",
        "Average Privacy Concern Score",
        "Average Privacy Behavior Score"
      ];

      const rows = [headers.join(",")];
      const maxLength = Math.max(results.length, averagesByAgeGroup.length);

      for (let i = 0; i < maxLength; i++) {
        const rowParts: string[] = [];
        
        // Left side: Raw survey data
        if (i < results.length) {
          const r = results[i];
          const siteVal = r.site === "Other" && r.site_other ? `Other (${r.site_other})` : r.site;
          rowParts.push(
            escapeCSV(r.referred_by || "Direct / Unknown"),
            escapeCSV(r.age),
            escapeCSV(siteVal),
            escapeCSV(r.frequency),
            escapeCSV(r.score_concerns),
            escapeCSV(r.score_behaviors)
          );
        } else {
          rowParts.push("", "", "", "", "", "");
        }

        // Empty column separator
        rowParts.push("");

        // Right side: Averages by age group
        if (i < averagesByAgeGroup.length) {
          const avg = averagesByAgeGroup[i];
          rowParts.push(
            escapeCSV(avg.group),
            escapeCSV(avg.avgConcern),
            escapeCSV(avg.avgBehavior)
          );
        } else {
          rowParts.push("", "", "");
        }

        rows.push(rowParts.join(","));
      }

      const csvContent = "\uFEFF" + rows.join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `survey_responses_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      setError('Failed to download the survey results. Please try again.');
    } finally {
      setIsDownloading(false);
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
        <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed mb-6">
          We want to understand your social media usage patterns and your attitudes towards online privacy. This survey will take approximately 2 minutes.
        </p>
        <button
          onClick={handleDownloadExcel}
          disabled={isDownloading}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100 transition-all shadow-sm disabled:opacity-50 cursor-pointer hover:shadow"
        >
          <Download className="w-4 h-4 text-indigo-600" />
          {isDownloading ? 'Generating Report...' : 'Download Excel Report'}
        </button>
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
