import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  History, 
  ChevronRight, 
  Search, 
  Calendar, 
  Trophy, 
  Target,
  ArrowLeft,
  LayoutGrid
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import Loading from '../../components/common/Loading';
import Error from '../../components/common/Error';
import { Input } from '../../components/ui/input';

import { fetchPracticeHistory } from '../../features/practice/api/practice.api';

const PracticeHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState("");

  const { data, isLoading, isError } = useQuery({ 
    queryKey: ['practice-history'], 
    queryFn: fetchPracticeHistory 
  });
  
  const historyData = data?.isSuccess ? data.data || [] : [];

  const filteredHistory = historyData.filter((item: any) => 
    (item.testName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.categoryName || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <Loading />;
  if (isError) return <Error title="Error" message="Failed to load history" />;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 animate-in fade-in duration-700">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/practice')} className="rounded-full h-10 w-10">
            <ArrowLeft size={24} />
          </Button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Practice History</h1>
            <p className="text-slate-500 text-sm font-medium">Review your previous attempts and track progress.</p>
          </div>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="Search tests..." 
            className="pl-10 rounded-xl border-slate-200 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-3xl bg-white p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <History size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Attempts</p>
            <p className="text-xl font-black text-slate-900">{historyData.length}</p>
          </div>
        </Card>

        <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-3xl bg-white p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Trophy size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Average Score</p>
            <p className="text-xl font-black text-slate-900">
              {historyData.length > 0 
                ? Math.round(historyData.reduce((acc, curr) => acc + curr.percentage, 0) / historyData.length) 
                : 0}%
            </p>
          </div>
        </Card>

        <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-3xl bg-white p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Target size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Best Performance</p>
            <p className="text-xl font-black text-slate-900">
              {historyData.length > 0 ? Math.max(...historyData.map(i => i.percentage)) : 0}%
            </p>
          </div>
        </Card>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {filteredHistory.length > 0 ? (
          filteredHistory.map((attempt) => (
            <Card 
              key={attempt.attemptId} 
              className="border-0 shadow-lg shadow-slate-200/40 rounded-[2rem] overflow-hidden bg-white hover:shadow-xl transition-all duration-300 group"
            >
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row md:items-center">
                  {/* Left: Info */}
                  <div className="flex-1 p-6 md:p-8 flex items-center gap-6">
                    <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <LayoutGrid size={24} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] font-bold border-slate-200 text-slate-500 rounded-full">{attempt.categoryName}</Badge>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                          <Calendar size={12} /> {new Date(attempt.attemptDate).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-slate-800">{attempt.testName}</h3>
                    </div>
                  </div>

                  {/* Middle: Score */}
                  <div className="px-6 md:px-12 py-4 md:py-0 border-t md:border-t-0 md:border-l border-slate-50 flex items-center justify-between md:justify-center gap-8 bg-slate-50/30 md:bg-transparent">
                    <div className="text-center">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Correct</p>
                      <p className="text-lg font-black text-emerald-600">{attempt.correctAnswers} / {attempt.totalQuestions}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Percentage</p>
                      <div className="flex items-center gap-2">
                        <span className={`text-xl font-black ${attempt.percentage >= 40 ? 'text-indigo-600' : 'text-rose-500'}`}>{attempt.percentage}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Action */}
                  <div className="p-4 md:p-8 bg-slate-50/50 md:bg-transparent flex items-center justify-center border-t md:border-t-0 md:border-l border-slate-50">
                    <Button 
                      onClick={() => navigate(`/practice/review/${attempt.attemptId}`)}
                      className="rounded-xl h-11 px-6 bg-white border border-slate-200 text-slate-600 hover:bg-slate-900 hover:text-white font-bold transition-all flex items-center gap-2"
                    >
                      Review <ChevronRight size={18} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
             <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mx-auto mb-4">
                <History size={40} />
             </div>
             <h3 className="text-xl font-bold text-slate-800">No attempts found</h3>
             <p className="text-slate-500 mt-2">You haven't taken any practice tests yet.</p>
             <Button onClick={() => navigate('/practice')} className="mt-6 rounded-xl font-bold">Start Practicing</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticeHistoryPage;
