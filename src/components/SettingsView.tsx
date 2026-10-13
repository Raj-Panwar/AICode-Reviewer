import React, { useState } from 'react';
import { apiClient } from '../services/api';
import { Shield, User, Lock, CheckCircle2 } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const user = apiClient.getUser() || { name: 'Alex Morgan', email: 'alex@enterprise.io', role: 'Senior Enterprise Engineer', organization: 'Cloud Core' };
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Enterprise Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage corporate workspace credentials, Google Workspace integration, and AI review thresholds.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-slate-900">User Profile & Organization</h3>

        {saved && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Settings updated successfully.
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Full Name</label>
              <input type="text" defaultValue={user.name} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Work Email</label>
              <input type="email" defaultValue={user.email} disabled className="w-full bg-slate-100 border border-slate-300 rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 cursor-not-allowed" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Engineering Role</label>
              <input type="text" defaultValue={user.role} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Organization</label>
              <input type="text" defaultValue={user.organization} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none" />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm rounded-xl shadow-md transition">
              Save Changes
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Google Workspace Authentication</h3>
        <p className="text-sm text-slate-600">Connected with corporate Google SSO for secure workspace access.</p>
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-sm font-bold text-teal-900">Google SSO Active & Verified</span>
          </div>
          <span className="text-xs font-semibold text-teal-700 bg-teal-100 px-3 py-1 rounded-full">Enterprise Tier</span>
        </div>
      </div>
    </div>
  );
};
