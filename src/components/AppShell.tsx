import React, { useState } from 'react';
import { apiClient } from '../services/api';
import { DashboardView } from './DashboardView';
import { NewReviewView } from './NewReviewView';
import { ReviewDetailView } from './ReviewDetailView';
import { ReviewsListView } from './ReviewsListView';
import { RepositoriesView } from './RepositoriesView';
import { ComplexityView } from './ComplexityView';
import { SettingsView } from './SettingsView';
import { LayoutDashboard, PlusCircle, History, GitBranch, Cpu, Settings, LogOut, Search, Shield } from 'lucide-react';

interface AppShellProps {
  user: any;
  onLogout: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({ user, onLogout }) => {
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, new-review, review-detail, reviews, repositories, complexity, settings
  const [selectedReviewId, setSelectedReviewId] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigateToReview = (id: string) => {
    setSelectedReviewId(id);
    setCurrentView('review-detail');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new-review', label: 'New Review', icon: PlusCircle },
    { id: 'reviews', label: 'Review History', icon: History },
    { id: 'repositories', label: 'Repositories', icon: GitBranch },
    { id: 'complexity', label: 'Complexity Lab', icon: Cpu },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const initials = user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'EU';

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans text-slate-900 selection:bg-teal-500 selection:text-white">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shadow-teal-500/20">
            ⚡
          </div>
          <div>
            <div className="font-extrabold text-white text-base tracking-tight">AI Code Reviewer</div>
            <div className="text-[10px] uppercase tracking-wider text-teal-400 font-bold">Enterprise Console</div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setCurrentView(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition ${
                  active ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20 font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-slate-800/60">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-white text-xs truncate">{user?.name || 'Enterprise User'}</div>
                <div className="text-[11px] text-slate-400 truncate">{user?.role || user?.email || 'Engineer'}</div>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-2 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-20 bg-white border-b border-slate-200 px-6 md:px-10 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              ☰
            </button>
            <div className="relative max-w-md w-full hidden sm:block">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search reviews, repos, or vulnerabilities..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-teal-500 font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-full text-xs font-semibold">
              <Shield className="w-3.5 h-3.5" /> Workspace Verified
            </span>
          </div>
        </header>

        {/* View Router */}
        <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto">
          {currentView === 'dashboard' && <DashboardView onNavigate={(view, id) => { if (id) navigateToReview(id); else setCurrentView(view); }} />}
          {currentView === 'new-review' && <NewReviewView onReviewComplete={(id) => navigateToReview(id)} />}
          {currentView === 'review-detail' && <ReviewDetailView reviewId={selectedReviewId} onBack={() => setCurrentView('dashboard')} />}
          {currentView === 'reviews' && <ReviewsListView onSelectReview={(id) => navigateToReview(id)} />}
          {currentView === 'repositories' && <RepositoriesView onStartReviewForRepo={(repoName) => setCurrentView('new-review')} />}
          {currentView === 'complexity' && <ComplexityView />}
          {currentView === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  );
};
