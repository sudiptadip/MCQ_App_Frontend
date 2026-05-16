import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronLeft, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Hash,
  ArrowLeft,
  Info
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import type { PracticeQuestion } from '../../types/practice';

import { useQuery } from '@tanstack/react-query';
import { fetchAttemptReview } from '../../features/practice/api/practice.api';
import Loading from '../../components/common/Loading';

const PracticeReviewPage: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const attemptIdNum = Number(attemptId);

  const { data: reviewRes, isLoading } = useQuery({
    queryKey: ['attempt-review', attemptIdNum],
    queryFn: () => fetchAttemptReview(attemptIdNum),
    enabled: !!attemptIdNum
  });

  // Prioritize API data
  const reviewData = reviewRes?.isSuccess ? reviewRes.data : null;
  
  // If we have reviewData from API, use its structure. 
  // Otherwise try to reconstruct from location state (for legacy or immediate view)
  const questions = reviewData?.questions;

  if (isLoading) return <Loading />;

  if (!questions) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300 mb-4">
          <Info size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Review Data Not Found</h2>
        <p className="text-slate-500 mt-2 max-w-xs">We couldn't load the review for this attempt. Please go back to the history.</p>
        <Button onClick={() => navigate('/practice/history')} className="mt-6 rounded-xl font-bold">Go to History</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full hover:bg-slate-100">
              <ArrowLeft size={20} className="text-slate-500" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Review Answers</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Hash size={10} /> {questions.length} Questions Reviewed
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="rounded-xl font-bold border-slate-200 text-slate-600">
            Back to Result
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3 text-blue-700">
          <Info size={20} className="shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold">Review Mode</p>
            <p className="opacity-80">Check your performance below. Correct answers are highlighted in green, and your mistakes are marked in red.</p>
          </div>
        </div>

        <div className="space-y-6">
          {questions.map((question, qIdx) => {
            const userAnswerId = question.userSelectedOptionId;
            const correctOption = question.options.find(o => o.isCorrect);
            const isCorrect = userAnswerId === correctOption?.id;

            return (
              <Card key={question.id} className="border-0 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
                <CardHeader className="p-6 border-b border-slate-50 bg-slate-50/30">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className={`${isCorrect ? 'bg-emerald-500' : userAnswerId ? 'bg-rose-500' : 'bg-slate-400'} text-white px-3 py-0.5 rounded-full text-[10px] font-bold tracking-tight`}>
                        {isCorrect ? 'CORRECT' : userAnswerId ? 'INCORRECT' : 'UNANSWERED'}
                      </Badge>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Question {qIdx + 1}</span>
                    </div>
                    <CardTitle className="text-lg font-bold text-slate-800 leading-tight">
                      {question.questionText}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    {question.options.map((option, oIdx) => {
                      const isUserChoice = userAnswerId === option.id;
                      const isOptionCorrect = option.isCorrect;
                      
                      let variantClasses = 'border-slate-100 bg-white text-slate-600';
                      if (isOptionCorrect) {
                        variantClasses = 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500/20';
                      } else if (isUserChoice && !isOptionCorrect) {
                        variantClasses = 'border-rose-500 bg-rose-50 text-rose-900 ring-1 ring-rose-500/20';
                      }

                      return (
                        <div
                          key={option.id}
                          className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${variantClasses}`}
                        >
                          <div className={`h-8 w-8 shrink-0 rounded-xl border flex items-center justify-center font-bold text-sm ${
                            isOptionCorrect ? 'bg-emerald-500 border-emerald-500 text-white' : 
                            isUserChoice ? 'bg-rose-500 border-rose-500 text-white' : 
                            'border-slate-200 text-slate-400 bg-slate-50'
                          }`}>
                            {String.fromCharCode(65 + oIdx)}
                          </div>
                          <span className="flex-1 text-sm font-medium">
                            {option.optionText}
                          </span>
                          {isOptionCorrect && (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                          )}
                          {isUserChoice && !isOptionCorrect && (
                            <XCircle className="h-5 w-5 text-rose-500 shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {!userAnswerId && (
                    <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-slate-500 text-xs font-medium">
                      <AlertCircle size={14} />
                      This question was not answered.
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 p-4 z-40">
         <div className="max-w-4xl mx-auto flex items-center justify-center">
            <Button onClick={() => navigate(-1)} className="rounded-xl h-12 px-10 font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all hover:scale-105 active:scale-95">
               Close Review
            </Button>
         </div>
      </div>
    </div>
  );
};

export default PracticeReviewPage;
