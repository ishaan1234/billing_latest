"use client";

import { useState } from "react";
import { LoginForm } from "@/components/login-form";
import { BillingForm } from "@/components/billing-form";
import { BillHistory } from "@/components/bill-history";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";

export default function Home() {
  // Simple session state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'new' | 'history' | 'dashboard'>('new');

  if (!isLoggedIn) {
    return <LoginForm onLogin={() => setIsLoggedIn(true)} />;
  }

  // Dynamic import or separate components would be cleaner but direct import is fine for now
  // We need to import these at the top level

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-violet-100">
      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-stone-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <span className="text-xl font-bold bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
              Aastha Apparel Atelier
            </span>

            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('new')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeTab === 'new' ? 'bg-pink-100 text-pink-600 shadow-sm' : 'text-stone-500 hover:bg-stone-100'}`}
              >
                New Bill
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeTab === 'history' ? 'bg-violet-100 text-violet-600 shadow-sm' : 'text-stone-500 hover:bg-stone-100'}`}
              >
                History
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeTab === 'dashboard' ? 'bg-sky-100 text-sky-600 shadow-sm' : 'text-stone-500 hover:bg-stone-100'}`}
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content Area */}
      <div className="max-w-6xl mx-auto py-8 px-4">
        {activeTab === 'new' && <BillingForm />}
        {activeTab === 'history' && <BillHistory />}
        {activeTab === 'dashboard' && <AnalyticsDashboard />}
      </div>
    </main>
  );
}
