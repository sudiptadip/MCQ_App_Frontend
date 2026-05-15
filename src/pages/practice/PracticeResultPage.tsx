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
  Award
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
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
    <div className="max-w-4xl mx-auto p-4 md:p-8 lg:p-12 animate-in zoom-in-95 duration-700">
      <Card className="rounded-[3rem] border-0 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden">
        {/* Top Header Section */}
        <CardHeader className={`p-10 md:p-16 text-center relative overflow-hidden ${isPass ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-rose-500 to-orange-600'}`}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          
          <div className="relative z-10 space-y-6">
            <div className="inline-flex h-24 w-24 rounded-full bg-white/20 backdrop-blur-xl items-center justify-center shadow-2xl border border-white/30 animate-bounce">
              {isPass ? <Trophy size={48} className="text-white" /> : <Award size={48} className="text-white" />}
            </div>
            
            <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                    {isPass ? 'Excellent Work!' : 'Good Effort!'}
                </h1>
                <p className="text-white/80 text-xl font-medium max-w-md mx-auto">
                    {isPass 
                      ? 'You have successfully completed the practice session with flying colors.' 
                      : 'Every attempt is a step closer to mastery. Review your weak areas and try again.'}
                </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8 md:p-12 space-y-12 bg-background">
          {/* Score Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="p-8 rounded-[2.5rem] bg-muted/30 border text-center space-y-2">
                <div className="flex justify-center mb-2"><TrendingUp size={24} className="text-primary" /></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Percentage</p>
                <h3 className="text-4xl font-black text-primary">{percentage}%</h3>
             </div>

             <div className="p-8 rounded-[2.5rem] bg-emerald-500/5 border border-emerald-500/10 text-center space-y-2">
                <div className="flex justify-center mb-2"><CheckCircle2 size={24} className="text-emerald-500" /></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Correct</p>
                <h3 className="text-4xl font-black text-emerald-600">{result.correct_answers}</h3>
             </div>

             <div className="p-8 rounded-[2.5rem] bg-rose-500/5 border border-rose-500/10 text-center space-y-2">
                <div className="flex justify-center mb-2"><XCircle size={24} className="text-rose-500" /></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Incorrect</p>
                <h3 className="text-4xl font-black text-rose-600">{result.total_questions - result.correct_answers}</h3>
             </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="space-y-6">
             <div className="flex items-center gap-2 px-2">
                <div className="h-4 w-4 rounded-full bg-primary" />
                <h3 className="text-lg font-black tracking-tight">Performance Summary</h3>
             </div>
             
             <div className="p-8 rounded-[2.5rem] border-2 border-dashed bg-muted/10 space-y-6">
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-bold italic">Attempt ID: #{result.attempt_id}</span>
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0 rounded-full px-4 font-black">COMPLETED</Badge>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between group">
                        <span className="text-muted-foreground font-medium">Total Questions Attempted</span>
                        <span className="text-xl font-black group-hover:scale-110 transition-transform">{result.total_questions}</span>
                    </div>
                    <div className="h-px bg-muted" />
                    <div className="flex items-center justify-between group">
                        <span className="text-muted-foreground font-medium">Final Score Achieved</span>
                        <span className="text-xl font-black group-hover:scale-110 transition-transform">{result.score} pts</span>
                    </div>
                </div>
             </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
             <Button 
                size="lg" 
                onClick={() => navigate(`/practice/test/${testId}`)}
                className="flex-1 rounded-2xl h-14 text-lg font-black shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 gap-2"
             >
                <RotateCcw size={20} /> Retake Test
             </Button>
             
             <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/practice')}
                className="flex-1 rounded-2xl h-14 text-lg font-black border-muted-foreground/10 hover:bg-muted gap-2"
             >
                <Home size={20} /> Practice Hub
             </Button>

             <Button 
                size="lg" 
                variant="ghost"
                onClick={() => navigate('/')}
                className="flex-1 rounded-2xl h-14 text-lg font-black gap-2"
             >
                Dashboard <ArrowRight size={20} />
             </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PracticeResultPage;
