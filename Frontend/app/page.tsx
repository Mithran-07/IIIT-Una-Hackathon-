'use client'

import { useState, useEffect } from 'react'
import type { Language } from '@/lib/translations'
import PublicHome from '@/components/public-home'
import AuthPage from '@/components/auth-page'
import ResultsPage from '@/components/results-page'
import UserDashboard from '@/components/user-dashboard'
import ProfileView from '@/components/profile-view'
import ChatBot from '@/components/chatbot'
import { Toaster } from '@/components/ui/toaster'
import TopNavBar from '@/components/top-nav-bar'
import AboutPage from '@/components/about-page'
import { api, type UserProfile } from '@/lib/api'

type AppView = 'home' | 'auth' | 'results' | 'dashboard' | 'profile' | 'about'

interface AnalysisData {
  id: string
  fileName: string
  score: number
  date: string
  factors: Array<{ name: string; score: number }>
}

export default function Home() {
  const [language, setLanguage] = useState<Language>('en')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentView, setCurrentView] = useState<AppView>('home')
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [isGuest, setIsGuest] = useState(true)

  // Data state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userHistory, setUserHistory] = useState<AnalysisData[]>([])

  // Load user data on login
  useEffect(() => {
    if (isLoggedIn) {
      api.getProfile().then(setUserProfile).catch(console.error)
      api.getHistory().then((data: any) => setUserHistory(data)).catch(console.error)
    }
  }, [isLoggedIn])

  const handleFileUpload = async (file: File) => {
    try {
      const newAnalysis = await api.uploadFile(file)

      setAnalysisData(newAnalysis)

      // Save to history if logged in
      if (isLoggedIn) {
        setUserHistory([newAnalysis, ...userHistory])
      }

      setCurrentView('results')
    } catch (error: any) {
      alert("Analysis Failed: " + error.message)
    }
  }

  const handleAuthenticate = () => {
    setIsLoggedIn(true)
    setIsGuest(false)
    setCurrentView('home')
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setIsGuest(true)
    setCurrentView('home')
  }

  const handleDownloadCertificate = async (reportId: string) => {
    try {
      const api = await import('@/lib/api').then(m => m.api);
      await api.downloadReport(reportId);
    } catch (e: any) {
      alert("Download failed: " + e.message);
    }
  }

  const handleViewReport = (reportId: string) => {
    const report = userHistory.find((r) => r.id === reportId)
    if (report) {
      setAnalysisData(report)
      setCurrentView('results')
    }
  }

  return (
    <>
      {/* Global TopNavBar - only for home, about, profile, and dashboard */}
      {(currentView === 'home' || currentView === 'profile' || currentView === 'about' || currentView === 'dashboard') && (
        <TopNavBar
          isLoggedIn={isLoggedIn}
          onLogoClick={() => setCurrentView('home')}
          onLoginClick={() => setCurrentView('auth')}
          onProfileClick={() => setCurrentView('profile')}
          onDashboardClick={() => setCurrentView('dashboard')}
          onAboutClick={() => setCurrentView('about')}
          language={language}
          onLanguageChange={setLanguage}
          userName={userProfile?.name || ''}
        />
      )}

      {/* Main View Rendering */}
      {currentView === 'about' && (
        <AboutPage
          onBackHome={() => setCurrentView('home')}
          language={language}
        />
      )}
      {currentView === 'home' && (
        <PublicHome
          language={language}
          onLanguageChange={setLanguage}
          isLoggedIn={isLoggedIn}
          onLoginClick={() => setCurrentView('auth')}
          onFileUpload={handleFileUpload}
          onLogoClick={() => setCurrentView('home')}
          onProfileClick={isLoggedIn ? () => setCurrentView('profile') : undefined}
          onDashboardClick={isLoggedIn ? () => setCurrentView('dashboard') : undefined}
        />
      )}

      {currentView === 'auth' && (
        <AuthPage
          onAuthenticate={handleAuthenticate}
          language={language}
          onLanguageChange={setLanguage}
        />
      )}

      {currentView === 'results' && analysisData && (
        <ResultsPage
          data={analysisData}
          onBackHome={() => setCurrentView('home')}
          language={language}
          isGuest={isGuest}
        />
      )}

      {currentView === 'about' && (
        <AboutPage
          onBackHome={() => setCurrentView('home')}
          language={language}
        />
      )}

      {currentView === 'dashboard' && isLoggedIn && (
        <UserDashboard
          reports={userHistory.map((r) => ({
            id: r.id,
            fileName: r.fileName,
            score: r.score,
            date: r.date,
            status: 'completed' as const,
          }))}
          language={language}
          onLanguageChange={setLanguage}
          onDownload={handleDownloadCertificate}
          onViewReport={handleViewReport}
          onBackHome={() => setCurrentView('home')}
          isLoggedIn={isLoggedIn}
          onLoginClick={() => setCurrentView('auth')}
          onProfileClick={() => setCurrentView('profile')}
          onDashboardClick={() => setCurrentView('dashboard')}
        />
      )}

      {currentView === 'profile' && isLoggedIn && userProfile && (
        <ProfileView
          userProfile={userProfile}
          history={userHistory}
          language={language}
          onNavigateHome={() => setCurrentView('home')}
          onBackToDashboard={() => setCurrentView('dashboard')}
        />
      )}

      {/* Floating Chatbot */}
      {currentView !== 'auth' && (
        <ChatBot
          currentReport={analysisData?.id}
          language={language}
        />
      )}

      <Toaster />
    </>
  )
}
