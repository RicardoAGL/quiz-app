import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QuizProvider } from './context/QuizContext';
import ErrorBoundary from './components/ErrorBoundary';
import HamburgerMenu from './components/HamburgerMenu';
import SplashScreen from './screens/SplashScreen';
import TopicSelectionScreen from './screens/TopicSelectionScreen';
import ModuleGridScreen from './screens/ModuleGridScreen';
import HomeScreen from './screens/HomeScreen';
import QuizScreen from './screens/QuizScreen';
import ReviewScreen from './screens/ReviewScreen';
import StatisticsScreen from './screens/StatisticsScreen';
import SequentialModeScreen from './screens/SequentialModeScreen';
import ScoreDashboardScreen from './screens/ScoreDashboardScreen';
import * as storage from './services/storage';
import './App.css';

/**
 * Root redirect: first-time visitors go to splash, returning visitors to topic selection.
 */
function RootRedirect() {
  const hasSeenSplash = storage.getHasSeenSplash();
  return <Navigate to={hasSeenSplash ? '/topics' : '/splash'} replace />;
}

function App() {
  return (
    <ErrorBoundary>
      <QuizProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <HamburgerMenu />
          <Routes>
            {/* Entry point redirect */}
            <Route path="/" element={<RootRedirect />} />

            {/* Splash */}
            <Route path="/splash" element={<SplashScreen />} />

            {/* Topic & Module navigation */}
            <Route path="/topics" element={<TopicSelectionScreen />} />
            <Route path="/topics/:topicId" element={<ModuleGridScreen />} />
            <Route path="/topics/:topicId/dashboard" element={<ScoreDashboardScreen />} />

            {/* Module-scoped screens */}
            <Route path="/home" element={<HomeScreen />} />
            <Route path="/quiz" element={<QuizScreen />} />
            <Route path="/sequential-mode" element={<SequentialModeScreen />} />
            <Route path="/review/:mode/:blockName" element={<ReviewScreen />} />
            <Route path="/review/:mode" element={<ReviewScreen />} />
            <Route path="/review" element={<ReviewScreen />} />
            <Route path="/statistics" element={<StatisticsScreen />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </QuizProvider>
    </ErrorBoundary>
  );
}

export default App;
