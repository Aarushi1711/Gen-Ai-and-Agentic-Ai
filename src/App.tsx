import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

// Public pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import SignupPage from './pages/public/SignupPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';

// App pages
import DashboardPage from './pages/app/DashboardPage';
import ProfilePage from './pages/app/ProfilePage';
import UploadPage from './pages/app/UploadPage';
import ChatPage from './pages/app/ChatPage';
import HealthPage from './pages/app/HealthPage';
import RoadmapPage from './pages/app/RoadmapPage';
import ArchitecturePage from './pages/app/ArchitecturePage';
import AnalyticsPage from './pages/app/AnalyticsPage';
import ReportPage from './pages/app/ReportPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Authenticated */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/health" element={<HealthPage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/architecture" element={<ArchitecturePage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/report" element={<ReportPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
