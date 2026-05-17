import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  Home, 
  RotateCcw, 
  ArrowRight,
  TrendingUp,
  Target,
  Hash,
  Calendar,
  Activity
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card } from '../../components/ui/card';

import type { AttemptResult } from '../../types/practice';

const PracticeResultPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const result = location.state?.result as AttemptResult;

  // Fallback if no result in state
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] space-y-6 text-center">
        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground/30">
          <Target size={40} />
        </div>
        <div className="space-y-2">
            <h2 className="text-2xl font-black">No Result Found</h2>
            <p className="text-muted-foreground">We couldn't find the result for this test session.</p>
        </div>
        <Button onClick={() => navigate('/practice')} className="rounded-xl font-bold">Go to Practice Hub</Button>
      </div>
    );
  }

  const percentage = Math.round((result.score / result.total_questions) * 100);
  const isPass = percentage >= 40; // Default pass mark 40%

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 lg:p-12 animate-in fade-in duration-1000">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Main Result Card */}
        <Card className="border-0 shadow-2xl shadow-slate-200/60 rounded-[3rem] overflow-hidden bg-white">
          <div className="grid grid-cols-1 md:grid-cols-12">
            
            {/* Left Side: Score Visualization */}
            <div className={`md:col-span-5 p-8 md:p-12 text-white flex flex-col items-center justify-center text-center relative overflow-hidden ${isPass ? 'bg-gradient-to-br from-indigo-600 to-violet-700' : 'bg-gradient-to-br from-slate-700 to-slate-900'}`}>
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
              
              <div className="relative z-10 space-y-6">
                <div className="relative inline-flex items-center justify-center">
                  {/* Circular Progress Path */}
                  <svg className="w-40 h-40 transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-white/10"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={440}
                      strokeDashoffset={440 - (440 * percentage) / 100}
                      strokeLinecap="round"
                      className="text-white transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black">{percentage}%</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Score</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight">
                    {isPass ? 'Excellent Work!' : 'Good Effort!'}
                  </h2>
                  <p className="text-white/70 text-sm leading-relaxed max-w-[200px] mx-auto">
                    {isPass 
                      ? 'You have mastered this test section.' 
                      : 'Keep practicing to improve your score.'}
                  </p>
                </div>

                <div className="pt-4">
                  {isPass ? (
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                      <Trophy size={14} /> Passed
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
                      <Activity size={14} /> Completed
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side: Details & Stats */}
            <div className="md:col-span-7 p-8 md:p-12 bg-white flex flex-col justify-between">
              <div className="space-y-8">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                    <TrendingUp size={14} className="text-indigo-600" /> Performance Breakdown
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-100/50 space-y-1">
                      <div className="flex items-center justify-between">
                        <CheckCircle2 size={18} className="text-emerald-500" />
                        <span className="text-2xl font-black text-emerald-700">{result.correct_answers}</span>
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600/70">Correct</p>
                    </div>

                    <div className="p-5 rounded-3xl bg-rose-50 border border-rose-100/50 space-y-1">
                      <div className="flex items-center justify-between">
                        <XCircle size={18} className="text-rose-500" />
                        <span className="text-2xl font-black text-rose-700">{result.total_questions - result.correct_answers}</span>
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-rose-600/70">Incorrect</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                        <Target size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Accuracy</p>
                        <p className="text-sm font-bold text-slate-700">High Precision</p>
                      </div>
                    </div>
                    <span className="text-lg font-black text-slate-900">{percentage}%</span>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                        <Hash size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Score</p>
                        <p className="text-sm font-bold text-slate-700">Points Earned</p>
                      </div>
                    </div>
                    <span className="text-lg font-black text-slate-900">{result.score} pts</span>
                  </div>
                </div>
              </div>

              {/* Summary Footer */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-tight">Attempt #{result.attempt_id}</span>
                </div>
                <Badge className="bg-slate-900 text-white hover:bg-slate-800 rounded-full text-[10px] font-bold px-3 py-1">FINAL RESULT</Badge>
              </div>
            </div>
          </div>
        </Card>

          {/* Action Buttons Container */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in slide-in-from-bottom-4 duration-1000 delay-300">
            <Button 
              onClick={() => navigate(`/practice/review/${result.attempt_id}`)}
              className="w-full sm:w-auto min-w-[200px] rounded-2xl h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xl shadow-emerald-200 transition-all hover:scale-105 active:scale-95 gap-2"
            >
              <CheckCircle2 size={20} /> Review Questions
            </Button>

            <Button 
              onClick={() => navigate(`/practice/test/${testId}`)}
              className="w-full sm:w-auto min-w-[200px] rounded-2xl h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xl shadow-indigo-200 transition-all hover:scale-105 active:scale-95 gap-2"
            >
              <RotateCcw size={20} /> Retake Practice
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate('/practice')}
              className="w-full sm:w-auto min-w-[200px] rounded-2xl h-14 bg-white border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all hover:scale-105 active:scale-95 gap-2"
            >
              <Home size={20} /> Practice Hub
            </Button>
          </div>
          
          <div className="flex justify-center mt-4">
            <Button 
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-slate-400 font-bold hover:text-indigo-600 transition-colors gap-2"
            >
              Back to Dashboard <ArrowRight size={18} />
            </Button>
          </div>
      </div>
    </div>
  );
};

export default PracticeResultPage;
