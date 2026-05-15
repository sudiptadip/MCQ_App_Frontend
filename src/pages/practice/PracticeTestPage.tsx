import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  Send,
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Hash,
  Timer
} from 'lucide-react';
import { fetchTestWithQuestions, startAttempt, submitAttempt } from '../../features/practice/api/practice.api';
import { practiceSession } from '../../utils/practiceSession';
import Loading from '../../components/common/Loading';
import Error from '../../components/common/Error';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { showToast } from '../../utils/toast';
import type { PracticeQuestion, PracticeSession as SessionType } from '../../types/practice';

const PracticeTestPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const testIdNum = Number(testId);

  // ── States ──────────────────────────────────────────────────────────────────
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [session, setSession] = useState<SessionType | null>(null);
  const [localAnswers, setLocalAnswers] = useState<Record<number, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<number[]>([]);

  // ── Data Fetching ──────────────────────────────────────────────────────────
  const { data: testData, isLoading, isError } = useQuery({
    queryKey: ['practiceTest', testIdNum],
    queryFn: () => fetchTestWithQuestions(testIdNum),
    enabled: !!testIdNum,
  });

  // ── Session Initialization ──────────────────────────────────────────────────
  useEffect(() => {
    if (!testData) return;

    let existingSession = practiceSession.get(testIdNum);

    if (existingSession && !existingSession.completed) {
      setSession(existingSession);
      setLocalAnswers(existingSession.answers);
      setFlaggedQuestions(existingSession.flagged);

      // Calculate remaining time
      const startTime = new Date(existingSession.startedAt).getTime();
      const endTime = startTime + (existingSession.durationMinutes * 60 * 1000);
      const remainingSeconds = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setTimeLeft(remainingSeconds);
    } else {
      // Create new session
      const newSession = practiceSession.create(
        testIdNum,
        testData.testName,
        testData.totalQuestions,
        testData.durationMinutes
      );
      setSession(newSession);
      setTimeLeft(testData.durationMinutes * 60);

      // Start backend attempt
      startAttemptMutation.mutate(testIdNum);
    }
  }, [testData, testIdNum]);

  // ── Mutations ───────────────────────────────────────────────────────────────
  const startAttemptMutation = useMutation({
    mutationFn: startAttempt,
    onSuccess: (res) => {
      if (res.isSuccess && res.data) {
        practiceSession.setAttemptId(testIdNum, res.data.id);
        setSession(prev => prev ? { ...prev, attemptId: res.data!.id } : null);
      }
    }
  });

  const submitMutation = useMutation({
    mutationFn: submitAttempt,
    onSuccess: (res) => {
      if (res.isSuccess) {
        practiceSession.complete(testIdNum);
        showToast.success('Test submitted successfully!');
        navigate(`/practice/result/${testIdNum}`, { state: { result: res.data } });
        practiceSession.clear(testIdNum);
      } else {
        showToast.error(res.message || 'Submission failed');
      }
    },
    onError: (err) => showToast.apiErrorShow(err)
  });

  // ── Timer Logic ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) {
      if (timeLeft === 0) handleAutoSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSelectOption = (questionId: number, optionId: number) => {
    setLocalAnswers(prev => ({ ...prev, [questionId]: optionId }));
    practiceSession.setAnswer(testIdNum, questionId, optionId);
  };

  const handleToggleFlag = (questionId: number) => {
    setFlaggedQuestions(prev => {
      const isFlagged = prev.includes(questionId);
      const newFlags = isFlagged ? prev.filter(id => id !== questionId) : [...prev, questionId];
      return newFlags;
    });
    practiceSession.toggleFlag(testIdNum, questionId);
  };

  const handleAutoSubmit = () => {
    showToast.warning("Time's up! Submitting your test automatically.");
    handleSubmit();
  };

  const handleSubmit = () => {
    if (!session?.attemptId) {
      showToast.error("No active attempt found. Please try again.");
      return;
    }

    const answersArray = Object.entries(localAnswers).map(([qId, oId]) => ({
      question_id: Number(qId),
      selected_option_id: oId
    }));

    submitMutation.mutate({
      attempt_id: session.attemptId,
      answers: answersArray
    });
  };

  // ── Formatting ──────────────────────────────────────────────────────────────
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ── Computed ───────────────────────────────────────────────────────────────
  const currentQuestion = testData?.questions[currentQuestionIndex];
  const progress = ((Object.keys(localAnswers).length) / (testData?.totalQuestions || 1)) * 100;
  const isLastQuestion = currentQuestionIndex === (testData?.questions.length || 0) - 1;

  if (isLoading) return <Loading message="Preparing your test session..." className="h-[600px]" />;
  if (isError) return <div className="p-12"><Error title="Load Error" message="Could not start the test. Please try again." onRetry={() => navigate(-1)} /></div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-8 animate-in slide-in-from-bottom-4 duration-700">

      {/* Top Navigation & Timer */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border border-muted/50 rounded-3xl p-4 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <X size={20} />
          </Button>
          <div className="hidden md:block">
            <h2 className="font-black text-lg truncate max-w-[200px]">{testData?.testName}</h2>
            <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-widest">
              <Hash size={12} /> Question {currentQuestionIndex + 1} of {testData?.totalQuestions}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Timer */}
          <div className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl border-2 transition-colors ${timeLeft && timeLeft < 300 ? 'border-destructive/30 bg-destructive/5 text-destructive animate-pulse' : 'border-primary/10 bg-primary/5 text-primary'}`}>
            <Timer size={20} className={timeLeft && timeLeft < 300 ? 'animate-bounce' : ''} />
            <span className="text-xl font-black tabular-nums">{timeLeft !== null ? formatTime(timeLeft) : '--:--'}</span>
          </div>

          <Button
            onClick={() => setShowConfirmSubmit(true)}
            className="hidden md:flex bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl px-6 h-11 gap-2 shadow-lg shadow-emerald-500/25"
          >
            <Send size={18} /> Finish Test
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Quiz Area */}
        <div className="lg:col-span-8 space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              <span>Overall Progress</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2 rounded-full bg-muted shadow-inner" />
          </div>

          {/* Question Card */}
          {currentQuestion && (
            <Card className="rounded-[2.5rem] border-0 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
              <CardHeader className="bg-muted/30 p-8 border-b">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <Badge variant="secondary" className="bg-primary/10 text-primary text-[10px] font-black tracking-widest uppercase rounded-full">Question {currentQuestionIndex + 1}</Badge>
                    <CardTitle className="text-2xl font-bold leading-snug pt-2">
                      {currentQuestion.question_text}
                    </CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`rounded-full shrink-0 ${flaggedQuestions.includes(currentQuestion.id) ? 'text-amber-500 bg-amber-500/10' : 'text-muted-foreground'}`}
                    onClick={() => handleToggleFlag(currentQuestion.id)}
                  >
                    <Flag size={20} fill={flaggedQuestions.includes(currentQuestion.id) ? "currentColor" : "none"} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = localAnswers[currentQuestion.id] === option.id;
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleSelectOption(currentQuestion.id, option.id)}
                        className={`flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all duration-300 group ${isSelected
                            ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10 ring-4 ring-primary/5'
                            : 'border-muted hover:border-primary/30 hover:bg-muted/50'
                          }`}
                      >
                        <div className={`h-8 w-8 rounded-lg border-2 flex items-center justify-center font-bold transition-colors ${isSelected ? 'bg-primary border-primary text-white' : 'border-muted-foreground/30 text-muted-foreground group-hover:border-primary/50 group-hover:text-primary'
                          }`}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span className={`flex-1 text-lg font-medium ${isSelected ? 'text-primary font-bold' : 'text-foreground'}`}>
                          {option.option_text}
                        </span>
                        {isSelected && <CheckCircle2 className="h-6 w-6 text-primary animate-in zoom-in-50 duration-300" />}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center gap-4 pt-4">
            <Button
              variant="outline"
              size="lg"
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
              className="rounded-2xl h-14 px-8 font-bold border-muted-foreground/10 hover:bg-muted"
            >
              <ChevronLeft className="mr-2" /> Previous
            </Button>

            {isLastQuestion ? (
              <Button
                size="lg"
                className="rounded-2xl h-14 px-10 font-black text-lg bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-500/20"
                onClick={() => setShowConfirmSubmit(true)}
              >
                Submit Final Test <Send className="ml-2" size={18} />
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                className="rounded-2xl h-14 px-10 font-black text-lg bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20"
              >
                Next Question <ChevronRight className="ml-2" />
              </Button>
            )}
          </div>
        </div>

        {/* Sidebar Status Panel */}
        <aside className="lg:col-span-4 sticky top-28 space-y-6">
          <Card className="rounded-[2rem] border-0 shadow-xl bg-card/50 backdrop-blur-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <AlertCircle size={16} /> Question Navigator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {testData?.questions.map((q, idx) => {
                  const isAnswered = localAnswers[q.id] !== undefined;
                  const isFlagged = flaggedQuestions.includes(q.id);
                  const isCurrent = currentQuestionIndex === idx;

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`h-11 rounded-xl font-bold text-sm transition-all duration-300 relative group ${isCurrent
                          ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110 z-10'
                          : isAnswered
                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                            : 'bg-muted text-muted-foreground border border-transparent hover:border-primary/30'
                        }`}
                    >
                      {idx + 1}
                      {isFlagged && (
                        <div className="absolute -top-1 -right-1 h-3 w-3 bg-amber-500 rounded-full border-2 border-background animate-bounce" />
                      )}
                      {isAnswered && !isCurrent && (
                        <div className="absolute -bottom-1 -right-1 h-2 w-2 bg-emerald-500 rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 pt-6 border-t space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-muted-foreground"><div className="h-3 w-3 rounded-full bg-primary" /> Current</span>
                  <span className="flex items-center gap-1.5 text-muted-foreground"><div className="h-3 w-3 rounded-full bg-emerald-500/50" /> Answered</span>
                  <span className="flex items-center gap-1.5 text-muted-foreground"><div className="h-3 w-3 rounded-full bg-amber-500" /> Flagged</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats Card */}
          <Card className="rounded-[2rem] border-0 shadow-xl bg-gradient-to-br from-primary/5 to-indigo-500/5 overflow-hidden">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Minimum Required</p>
                <p className="text-lg font-bold">{testData?.minAttempt} Questions</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-white/50 backdrop-blur-sm flex items-center justify-center text-primary shadow-inner">
                <HelpCircle size={24} />
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={() => setShowConfirmSubmit(true)}
            className="w-full md:hidden bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl h-14 gap-2 shadow-lg shadow-emerald-500/25"
          >
            <Send size={18} /> Finish & Submit Test
          </Button>
        </aside>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmSubmit} onOpenChange={setShowConfirmSubmit}>
        <DialogContent className="rounded-[2rem] border-0 shadow-2xl sm:max-w-md">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-black">Ready to Submit?</DialogTitle>
            <DialogDescription className="text-base font-medium">
              You have answered {Object.keys(localAnswers).length} out of {testData?.totalQuestions} questions.
              {flaggedQuestions.length > 0 && ` You also have ${flaggedQuestions.length} flagged items.`}
              Once submitted, you cannot change your answers.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="flex flex-col gap-2 p-4 rounded-2xl bg-muted/50 border">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-muted-foreground">Answered</span>
                <span className="text-emerald-600">{Object.keys(localAnswers).length}</span>
              </div>
              <div className="flex justify-between text-sm font-bold">
                <span className="text-muted-foreground">Unanswered</span>
                <span className="text-destructive">{(testData?.totalQuestions || 0) - Object.keys(localAnswers).length}</span>
              </div>
              <div className="flex justify-between text-sm font-bold">
                <span className="text-muted-foreground">Flagged</span>
                <span className="text-amber-500">{flaggedQuestions.length}</span>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-3 sm:gap-0">
            <Button variant="ghost" className="rounded-xl font-bold h-12" onClick={() => setShowConfirmSubmit(false)}>Keep Working</Button>
            <Button
              className="rounded-xl font-black h-12 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? 'Submitting...' : 'Yes, Submit Test'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PracticeTestPage;
