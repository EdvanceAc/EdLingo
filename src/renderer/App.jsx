import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import LoadingScreen from './components/ui/LoadingScreen';

// Pages
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import EnhancedChat from './pages/EnhancedChat';
import LiveConversation from './pages/LiveConversation';
import Pronunciation from './pages/Pronunciation';
import Vocabulary from './pages/Vocabulary';
import Grammar from './pages/Grammar';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';

// Providers
import { ThemeProvider } from './providers/ThemeProvider';
import { AudioProvider } from './providers/AudioProvider';
import { ProgressProvider } from './providers/ProgressProvider';
import { AIProvider } from './providers/AIProvider';

// Layout component that conditionally renders sidebar and header
function AppLayout({ children }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (isAdminRoute) {
    // Admin layout without sidebar and header
    return (
      <div className="h-screen bg-background text-foreground overflow-hidden">
        {children}
      </div>
    );
  }

  // Student layout with sidebar and header
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          width: sidebarCollapsed ? '80px' : '280px'
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="flex-shrink-0 border-r border-border"
      >
        <Sidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate app initialization
    const initializeApp = async () => {
      try {
        // Load user preferences
        const theme = await window.electronAPI?.getTheme?.() || 'light';
        document.documentElement.classList.toggle('dark', theme === 'dark');
        
        // Load user progress
        await window.electronAPI?.loadProgress?.();
        
        // Initialize audio services
        // Add any other initialization logic here
        
        setTimeout(() => setIsLoading(false), 1500); // Minimum loading time for smooth UX
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider>
      <AudioProvider>
        <ProgressProvider>
          <AIProvider>
          <Router>
            <AppLayout>
              <AnimatePresence mode="wait">
                <Routes>
                  {/* Admin Dashboard - Separate route with no sidebar/header */}
                  <Route 
                    path="/admin" 
                    element={
                      <motion.div
                        key="admin-dashboard"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <AdminDashboard />
                      </motion.div>
                    } 
                  />
                      <Route 
                        path="/" 
                        element={
                          <motion.div
                            key="dashboard"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Dashboard />
                          </motion.div>
                        } 
                      />
                      <Route 
                        path="/chat" 
                        element={
                          <motion.div
                            key="chat"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Chat />
                          </motion.div>
                        } 
                      />
                      <Route 
                        path="/enhanced-chat" 
                        element={
                          <motion.div
                            key="enhanced-chat"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                          >
                            <EnhancedChat />
                          </motion.div>
                        } 
                      />
                      <Route 
                        path="/live-conversation" 
                        element={
                          <motion.div
                            key="live-conversation"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                          >
                            <LiveConversation />
                          </motion.div>
                        } 
                      />
                      <Route 
                        path="/pronunciation" 
                        element={
                          <motion.div
                            key="pronunciation"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Pronunciation />
                          </motion.div>
                        } 
                      />
                      <Route 
                        path="/vocabulary" 
                        element={
                          <motion.div
                            key="vocabulary"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Vocabulary />
                          </motion.div>
                        } 
                      />
                      <Route 
                        path="/grammar" 
                        element={
                          <motion.div
                            key="grammar"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Grammar />
                          </motion.div>
                        } 
                      />
                      <Route 
                        path="/settings" 
                        element={
                          <motion.div
                            key="settings"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Settings />
                          </motion.div>
                        } 
                      />
                </Routes>
              </AnimatePresence>
            </AppLayout>
          </Router>
          </AIProvider>
        </ProgressProvider>
      </AudioProvider>
    </ThemeProvider>
  );
}

export default App;