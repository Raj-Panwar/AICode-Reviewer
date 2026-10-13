import React, { useState } from 'react';
import { apiClient } from '../services/api';
import { DashboardView } from './DashboardView';
import { NewReviewView } from './NewReviewView';
import { ReviewDetailView } from './ReviewDetailView';
import { ReviewsListView } from './ReviewsListView';
import { RepositoriesView } from './RepositoriesView';
import { ComplexityView } from './ComplexityView';
import { SettingsView } from './SettingsView';
import {
  LayoutDashboard,
  PlusCircle,
  History,
  GitBranch,
  Cpu,
  Settings,
  LogOut,
  Search,
  Code2,
  Menu,
  X
} from 'lucide-react';

interface AppShellProps {
  user: any;
  onLogout: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({ user, onLogout }) => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedReviewId, setSelectedReviewId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);

  const navigateToReview = (id: string) => {
    setSelectedReviewId(id);
    setCurrentView('review-detail');
  };

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setCurrentView('reviews');
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new-review', label: 'New Review', icon: PlusCircle },
    { id: 'reviews', label: 'Review History', icon: History },
    { id: 'repositories', label: 'Repositories', icon: GitBranch },
    { id: 'complexity', label: 'Complexity Lab', icon: Cpu },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const initials = currentUser?.name
    ? currentUser.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 antialiased selection:bg-teal-600 selection:text-white">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 px-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold">
              <Code2 className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 text-sm tracking-tight">AI Code Reviewer</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  active
                    ? 'bg-slate-100 text-slate-900 font-bold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-teal-600' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User Card */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/50">
          <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-900 truncate">
                  {currentUser?.name || 'User'}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {currentUser?.email || ''}
                </div>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-60 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search Bar */}
            <form onSubmit={handleGlobalSearch} className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reviews or keywords..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white transition"
              />
            </form>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentView('new-review')}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-lg transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" /> New Review
            </button>
          </div>
        </header>

        {/* View Router */}
        <main className="flex-1 p-6 md:p-8 max-w-6xl w-full mx-auto">
          {currentView === 'dashboard' && (
            <DashboardView
              onNavigate={(view, id) => {
                if (id) navigateToReview(id);
                else setCurrentView(view);
              }}
            />
          )}
          {currentView === 'new-review' && (
            <NewReviewView onReviewComplete={(id) => navigateToReview(id)} />
          )}
          {currentView === 'review-detail' && (
            <ReviewDetailView
              reviewId={selectedReviewId}
              onBack={() => setCurrentView('dashboard')}
            />
          )}
          {currentView === 'reviews' && (
            <ReviewsListView
              initialSearch={searchQuery}
              onSelectReview={(id) => navigateToReview(id)}
            />
          )}
          {currentView === 'repositories' && (
            <RepositoriesView
              onStartReviewForRepo={(repoName) => setCurrentView('new-review')}
            />
          )}
          {currentView === 'complexity' && <ComplexityView />}
          {currentView === 'settings' && (
            <SettingsView
              onUserUpdated={(updated) => {
                setCurrentUser(updated);
                apiClient.setUser(updated);
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
};
