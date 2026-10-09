import React, { useState, useEffect } from 'react';
import { 
  MessageSquareHeart, 
  Send, 
  CheckCircle2, 
  Star, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  FileText,
  Clock,
  Tag
} from 'lucide-react';
import { UserSession, ScanResponse } from '../types';

interface FeedbackViewProps {
  userSession?: UserSession | null;
  currentScan?: ScanResponse | null;
}

interface FeedbackEntry {
  id: string;
  name: string;
  email: string;
  category: string;
  rating: number;
  subject: string;
  message: string;
  scanId?: string;
  timestamp: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'RESOLVED';
}

export const FeedbackView: React.FC<FeedbackViewProps> = ({ 
  userSession, 
  currentScan 
}) => {
  const [name, setName] = useState(userSession?.displayName || '');
  const [email, setEmail] = useState(userSession?.email || '');
  const [category, setCategory] = useState('Experience');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [includeScan, setIncludeScan] = useState(!!currentScan);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackEntry[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('px_feedback_list');
      if (saved) {
        setFeedbackHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !subject.trim()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const newEntry: FeedbackEntry = {
        id: `FB-${Date.now().toString().slice(-6)}`,
        name: name.trim() || 'Anonymous Specialist',
        email: email.trim() || 'user@vyomra.soc',
        category,
        rating,
        subject: subject.trim(),
        message: message.trim(),
        scanId: includeScan && currentScan ? currentScan.scan_id : undefined,
        timestamp: new Date().toISOString(),
        status: 'SUBMITTED'
      };

      const updated = [newEntry, ...feedbackHistory];
      setFeedbackHistory(updated);
      try {
        localStorage.setItem('px_feedback_list', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }

      setIsSubmitting(false);
      setSubmitted(true);
      setSubject('');
      setMessage('');

      // Auto dismiss success toast after 4 seconds
      setTimeout(() => setSubmitted(false), 4000);
    }, 400);
  };

  const categories = [
    { id: 'Experience', label: 'General Experience', icon: '⭐' },
    { id: 'Accuracy', label: 'Detection Accuracy / False Positive', icon: '🎯' },
    { id: 'Feature', label: 'Feature Suggestion', icon: '💡' },
    { id: 'Bug', label: 'Bug / Performance Issue', icon: '🐞' },
    { id: 'Security', label: 'Security Vulnerability', icon: '🛡️' }
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-mono font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>CONTINUOUS IMPROVEMENT PORTAL</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            User Feedback & Threat Research QA
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Help us refine VYOMRA's autonomous forensic models, heuristic detectors, and security command features.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Active QA Feedback Channel</span>
        </div>
      </div>

      {/* Success Notification */}
      {submitted && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-center space-x-3 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs">
            <span className="font-bold">Thank you for your valuable feedback! </span>
            <span>Your report has been logged into the platform telemetry vault.</span>
          </div>
        </div>
      )}

      {/* Main Feedback Form Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Your Name / Callsign
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Elena Rostova"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@vyomra.soc"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all font-mono"
              />
            </div>
          </div>

          {/* Interactive Rating */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Overall Experience & System Rating
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-6 h-6 ${
                      (hoverRating || rating) >= star
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-mono font-bold text-slate-600 ml-2">
                {rating === 5 && 'Outstanding (5/5)'}
                {rating === 4 && 'Very Good (4/5)'}
                {rating === 3 && 'Good / Satisfactory (3/5)'}
                {rating === 2 && 'Needs Improvement (2/5)'}
                {rating === 1 && 'Unsatisfactory (1/5)'}
              </span>
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Feedback Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-left flex flex-col justify-between ${
                    category === cat.id
                      ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="text-base mb-1">{cat.icon}</span>
                  <span className="text-[11px] leading-tight">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Subject Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Subject
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Accuracy of homoglyph detection on Cyrillic domains"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
            />
          </div>

          {/* Message Textarea */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Feedback Details & Suggestions
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Please describe your experience, findings, or any improvements you would like to see in VYOMRA..."
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all resize-y"
            />
          </div>

          {/* Attach Current Scan Reference */}
          {currentScan && (
            <div className="flex items-center space-x-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                id="attachScan"
                checked={includeScan}
                onChange={(e) => setIncludeScan(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="attachScan" className="text-slate-700 font-medium cursor-pointer">
                Attach current investigation reference: <span className="font-mono font-bold text-blue-700">{currentScan.url_components.submitted_url}</span> (ID: {currentScan.scan_id})
              </label>
            </div>
          )}

          {/* Submit Action */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !subject.trim() || !message.trim()}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Transmitting Feedback...' : 'Submit Feedback'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Submitted Feedback History Section */}
      {feedbackHistory.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <MessageSquareHeart className="w-4 h-4 text-blue-600" />
              <span>Your Submitted Feedback History ({feedbackHistory.length})</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Persisted Locally</span>
          </div>

          <div className="space-y-3">
            {feedbackHistory.map((fb) => (
              <div key={fb.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">{fb.subject}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-blue-100 text-blue-800 font-semibold">
                      {fb.category}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-amber-500">
                    {Array.from({ length: fb.rating }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>

                <p className="text-slate-600 leading-relaxed">{fb.message}</p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/60 font-mono">
                  <span>By: {fb.name} ({fb.email})</span>
                  <span>{new Date(fb.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
