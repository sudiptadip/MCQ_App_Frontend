import { storage } from "../../utils/storage";
import type { User } from "../../features/auth/types";
import { ROLES, STORAGE_KEYS } from "../../constants";
import {
   Trophy,
   Target,
   History,
   ChevronRight,
   GraduationCap,
   Clock,
   CheckCircle2,
   LayoutDashboard,
   Activity
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { Users, BookOpen, ClipboardCheck, TrendingUp, UserPlus, FileEdit, Settings } from "lucide-react";

const HomePage = () => {
   const navigate = useNavigate();
   const user = storage.get<User>(STORAGE_KEYS.USER) || ({} as User);
   const isStudent = user.role === ROLES.STUDENT;

   if (isStudent) {
      return (
         <div className="space-y-10 animate-in fade-in duration-700">
            {/* Welcome Section */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-8 md:p-12 text-white shadow-2xl shadow-indigo-200">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                  <GraduationCap size={160} />
               </div>
               <div className="relative z-10 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[10px] font-bold uppercase tracking-widest">
                     <Trophy size={14} className="text-yellow-300" /> Student Dashboard
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                     Welcome back, <span className="text-indigo-200">{user.name?.split(' ')[0] || "Scholar"}</span>!
                  </h1>
                  <p className="text-indigo-100/80 text-lg max-w-xl font-medium">
                     Ready to level up your skills? Pick up where you left off or start a new practice session today.
                  </p>
                  <div className="pt-4">
                     <Button
                        onClick={() => navigate('/practice')}
                        className="rounded-2xl h-14 px-8 bg-white text-indigo-600 hover:bg-indigo-50 font-black text-lg shadow-xl shadow-indigo-900/20 transition-all hover:scale-105 active:scale-95"
                     >
                        Start Practice <ChevronRight className="ml-2" />
                     </Button>
                  </div>
               </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               <div className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 transition-all hover:shadow-2xl hover:-translate-y-1">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
                     <History size={24} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Attempts</p>
                  <p className="text-3xl font-black text-slate-900">0</p>
               </div>

               <div className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 transition-all hover:shadow-2xl hover:-translate-y-1">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
                     <CheckCircle2 size={24} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Success Rate</p>
                  <p className="text-3xl font-black text-slate-900">0%</p>
               </div>

               <div className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 transition-all hover:shadow-2xl hover:-translate-y-1">
                  <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 mb-4 group-hover:scale-110 transition-transform">
                     <Clock size={24} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Practice Time</p>
                  <p className="text-3xl font-black text-slate-900">0h</p>
               </div>

               <div className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 transition-all hover:shadow-2xl hover:-translate-y-1">
                  <div className="h-12 w-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
                     <Target size={24} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Accuracy</p>
                  <p className="text-3xl font-black text-slate-900">0%</p>
               </div>
            </div>

            {/* Quick Links / Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               <div className="lg:col-span-8 space-y-6">
                  <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                     <Activity className="text-indigo-600" /> Recent Performance
                  </h3>
                  <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-12 text-center">
                     <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mx-auto mb-6">
                        <History size={40} />
                     </div>
                     <h4 className="text-lg font-bold text-slate-800">No recent activity</h4>
                     <p className="text-slate-500 mt-2">Your latest practice results will appear here once you complete a test.</p>
                     <Button variant="outline" className="mt-6 rounded-xl font-bold" onClick={() => navigate('/practice')}>Start Your First Test</Button>
                  </div>
               </div>

               <div className="lg:col-span-4 space-y-6">
                  <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                     <LayoutDashboard className="text-indigo-600" size={20} /> Quick Actions
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                     <button
                        onClick={() => navigate('/practice/history')}
                        className="flex items-center gap-4 p-5 rounded-3xl bg-white border border-slate-100 shadow-lg shadow-slate-200/30 hover:shadow-xl transition-all hover:-translate-x-1 text-left group"
                     >
                        <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                           <History size={20} />
                        </div>
                        <div>
                           <p className="font-bold text-slate-800">View History</p>
                           <p className="text-xs text-slate-500">Track your progress over time</p>
                        </div>
                     </button>

                     <button
                        onClick={() => navigate('/practice')}
                        className="flex items-center gap-4 p-5 rounded-3xl bg-white border border-slate-100 shadow-lg shadow-slate-200/30 hover:shadow-xl transition-all hover:-translate-x-1 text-left group"
                     >
                        <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                           <GraduationCap size={20} />
                        </div>
                        <div>
                           <p className="font-bold text-slate-800">Browse Subjects</p>
                           <p className="text-xs text-slate-500">Explore practice modules</p>
                        </div>
                     </button>
                  </div>
               </div>
            </div>
         </div>
      );
   }

   // Admin / Franchise Dashboard (Dummy View)
   return (
      <div className="space-y-8 animate-in fade-in duration-700">
         {/* Admin Header */}
         <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 md:p-12 text-white shadow-2xl shadow-slate-900/20">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <TrendingUp size={160} />
            </div>
            <div className="relative z-10 space-y-4">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-bold uppercase tracking-widest text-slate-300">
                  <LayoutDashboard size={14} className="text-emerald-400" /> Admin Workspace
               </div>
               <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
                  Welcome back, <span className="text-emerald-400">{user.name?.split(' ')[0] || "Admin"}</span>
               </h1>
               <p className="text-slate-300 text-lg max-w-xl font-medium">
                  Here is an overview of {user.franchiseName || "your organization"}'s performance and recent activities.
               </p>
            </div>
         </div>

         {/* Stats Overview */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 transition-all hover:shadow-2xl hover:-translate-y-1">
               <div className="flex justify-between items-start mb-4">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                     <Users size={24} />
                  </div>
                  <span className="flex items-center text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
                     +12% <TrendingUp size={12} className="ml-1" />
                  </span>
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Students</p>
               <p className="text-3xl font-black text-slate-900">1,284</p>
            </div>

            <div className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 transition-all hover:shadow-2xl hover:-translate-y-1">
               <div className="flex justify-between items-start mb-4">
                  <div className="h-12 w-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                     <BookOpen size={24} />
                  </div>
                  <span className="flex items-center text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
                     +5% <TrendingUp size={12} className="ml-1" />
                  </span>
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Questions</p>
               <p className="text-3xl font-black text-slate-900">8,592</p>
            </div>

            <div className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 transition-all hover:shadow-2xl hover:-translate-y-1">
               <div className="flex justify-between items-start mb-4">
                  <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                     <ClipboardCheck size={24} />
                  </div>
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Active Tests</p>
               <p className="text-3xl font-black text-slate-900">45</p>
            </div>

            <div className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 transition-all hover:shadow-2xl hover:-translate-y-1">
               <div className="flex justify-between items-start mb-4">
                  <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
                     <Activity size={24} />
                  </div>
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Avg Completion</p>
               <p className="text-3xl font-black text-slate-900">78%</p>
            </div>
         </div>

         {/* Admin Quick Actions & Recent Activity */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
               <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                  <Activity className="text-indigo-600" size={20} /> System Activity
               </h3>
               <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-6">
                  <div className="space-y-6">
                     {[
                        { icon: <UserPlus className="text-blue-500" size={18} />, bg: 'bg-blue-50', title: 'New Student Registered', desc: 'Sarah Jenkins joined standard tier', time: '10 mins ago' },
                        { icon: <FileEdit className="text-purple-500" size={18} />, bg: 'bg-purple-50', title: 'Test Updated', desc: 'Mock Test 2024 was modified by you', time: '2 hours ago' },
                        { icon: <CheckCircle2 className="text-emerald-500" size={18} />, bg: 'bg-emerald-50', title: 'Bulk Upload Complete', desc: 'Added 50 new questions to Physics', time: 'Yesterday' },
                     ].map((item, i) => (
                        <div key={i} className="flex items-start gap-4">
                           <div className={`h-10 w-10 rounded-full ${item.bg} flex items-center justify-center shrink-0`}>
                              {item.icon}
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-900">{item.title}</p>
                              <p className="text-sm text-slate-500 truncate">{item.desc}</p>
                           </div>
                           <div className="text-xs font-medium text-slate-400 whitespace-nowrap">
                              {item.time}
                           </div>
                        </div>
                     ))}
                  </div>
                  <Button variant="ghost" className="w-full mt-6 text-indigo-600 font-bold bg-indigo-50/50 hover:bg-indigo-50">View All Activity</Button>
               </div>
            </div>

            <div className="space-y-6">
               <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                  <LayoutDashboard className="text-indigo-600" size={20} /> Management
               </h3>
               <div className="grid grid-cols-1 gap-4">
                  <button onClick={() => navigate('/question-ans/upload')} className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-lg shadow-slate-200/30 hover:shadow-xl transition-all hover:-translate-x-1 text-left group">
                     <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <FileEdit size={20} />
                     </div>
                     <div>
                        <p className="font-bold text-slate-800">Upload Questions</p>
                        <p className="text-xs text-slate-500">Bulk import via Excel</p>
                     </div>
                  </button>

                  <button onClick={() => navigate('/student')} className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-lg shadow-slate-200/30 hover:shadow-xl transition-all hover:-translate-x-1 text-left group">
                     <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <Users size={20} />
                     </div>
                     <div>
                        <p className="font-bold text-slate-800">Manage Students</p>
                        <p className="text-xs text-slate-500">View and edit users</p>
                     </div>
                  </button>

                  <button onClick={() => navigate('/settings')} className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-lg shadow-slate-200/30 hover:shadow-xl transition-all hover:-translate-x-1 text-left group">
                     <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-slate-600 group-hover:text-white transition-colors">
                        <Settings size={20} />
                     </div>
                     <div>
                        <p className="font-bold text-slate-800">System Settings</p>
                        <p className="text-xs text-slate-500">Configure application</p>
                     </div>
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
};

export default HomePage;
