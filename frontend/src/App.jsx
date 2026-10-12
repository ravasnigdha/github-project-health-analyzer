import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import RepositoryReport from './pages/RepositoryReport';
import History from './pages/History';
import Compare from './pages/Compare';
import Settings from './pages/Settings';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);

  return (
    <div className="app-container">
      {/* Responsive Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          currentRepo={currentAnalysis?.metadata?.full_name}
        />

        <main style={{ flex: 1 }}>
          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  currentAnalysis={currentAnalysis}
                  setCurrentAnalysis={setCurrentAnalysis}
                />
              }
            />
            <Route
              path="/report"
              element={
                <RepositoryReport
                  currentAnalysis={currentAnalysis}
                  setCurrentAnalysis={setCurrentAnalysis}
                />
              }
            />
            <Route
              path="/history"
              element={
                <History
                  setCurrentAnalysis={setCurrentAnalysis}
                />
              }
            />
            <Route
              path="/compare"
              element={<Compare />}
            />
            <Route
              path="/settings"
              element={<Settings />}
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}
