import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { LearnPage } from './pages/LearnPage';
import { PathDetailPage } from './pages/PathDetailPage';
import { LessonPage } from './pages/LessonPage';
import { QuizPage } from './pages/QuizPage';
import { ReviewPage } from './pages/ReviewPage';
import { ExamModePage } from './pages/ExamModePage';
import { TeachBackPage } from './pages/TeachBackPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { ProgressPage } from './pages/ProgressPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { StorageService } from './services/storage/localStorageService';

// Scroll to top helper
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export const App: React.FC = () => {
  const initialSettings = StorageService.getSettings();
  const [theme, setTheme] = useState<'dark' | 'light'>(initialSettings.theme || 'dark');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    const curr = StorageService.getSettings();
    StorageService.saveSettings({ ...curr, theme: nextTheme });
  };

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="app-container">
        {/* Desktop & Tablet Sidebar */}
        <Sidebar
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div className="main-content">
          <Header
            onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
            theme={theme}
            onToggleTheme={handleToggleTheme}
          />

          <main className="page-wrapper">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/learn" element={<LearnPage />} />
              <Route path="/path/:id" element={<PathDetailPage />} />
              <Route path="/lesson/:id" element={<LessonPage />} />
              <Route path="/quiz/:id" element={<QuizPage />} />
              <Route path="/review" element={<ReviewPage />} />
              <Route path="/exam-mode" element={<ExamModePage />} />
              <Route path="/teach-back" element={<TeachBackPage />} />
              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route
                path="/settings"
                element={<SettingsPage theme={theme} onToggleTheme={handleToggleTheme} />}
              />
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Bottom Navigation on Smartphones */}
          <MobileNav />
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
