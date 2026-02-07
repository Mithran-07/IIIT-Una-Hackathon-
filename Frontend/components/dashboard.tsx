'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Language } from '@/lib/translations'
import { translations } from '@/lib/translations'
import DashboardNav from './dashboard-nav'
import UploadZone from './upload-zone'
import AnalysisResults from './analysis-results'
import ProfileView from './profile-view'
import AboutAuditX from './about-auditx'
import ChatBot from './chatbot'

type DashboardView = 'home' | 'results' | 'profile'

interface DashboardProps {
  language: Language
  onLanguageChange: (language: Language) => void
}

interface AnalysisData {
  id: string
  fileName: string
  score: number
  date: string
  factors: {
    name: string
    score: number
  }[]
}

export default function Dashboard({ language, onLanguageChange }: DashboardProps) {
  const [currentView, setCurrentView] = useState<DashboardView>('home')
  const t = translations[language]
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [history, setHistory] = useState<AnalysisData[]>([
    {
      id: '1',
      fileName: 'Q4_Financial_Report_2024.pdf',
      score: 82,
      date: '2024-01-15',
      factors: [
        { name: 'Completeness', score: 85 },
        { name: 'Validity', score: 78 },
        { name: 'Accuracy', score: 82 },
        { name: 'Consistency', score: 80 },
        { name: 'Timeliness', score: 88 },
        { name: 'Integrity', score: 79 },
        { name: 'Security', score: 81 },
      ],
    },
  ])

  const handleFileUpload = (fileName: string) => {
    const newAnalysis: AnalysisData = {
      id: String(Date.now()),
      fileName,
      score: Math.floor(Math.random() * 50 + 50), // Random score between 50-100
      date: new Date().toISOString().split('T')[0],
      factors: [
        { name: 'Completeness', score: Math.floor(Math.random() * 40 + 60) },
        { name: 'Validity', score: Math.floor(Math.random() * 40 + 60) },
        { name: 'Accuracy', score: Math.floor(Math.random() * 40 + 60) },
        { name: 'Consistency', score: Math.floor(Math.random() * 40 + 60) },
        { name: 'Timeliness', score: Math.floor(Math.random() * 40 + 60) },
        { name: 'Integrity', score: Math.floor(Math.random() * 40 + 60) },
        { name: 'Security', score: Math.floor(Math.random() * 40 + 60) },
      ],
    }

    setAnalysisData(newAnalysis)
    setHistory([newAnalysis, ...history])
    setCurrentView('results')
  }

  const handleHistorySelect = (analysis: AnalysisData) => {
    setAnalysisData(analysis)
    setCurrentView('results')
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <DashboardNav
        currentView={currentView}
        onNavigate={setCurrentView}
        language={language}
        onLanguageChange={onLanguageChange}
        onProfileClick={() => setCurrentView('profile')}
      />

      <main className="flex-1 overflow-auto">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentView === 'home' && (
            <div className="container mx-auto px-4 py-12">
              {/* Hero Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
              >
                <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
                  {t.appName}
                </h1>
                <p className="text-xl text-muted-foreground mb-2">
                  {t.aiPoweredFinancial}
                </p>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  {t.uploadDocuments}
                </p>
              </motion.div>

              {/* About AuditX Section */}
              <AboutAuditX language={language} />

              {/* Upload Zone */}
              <div className="mt-16">
                <UploadZone onFileUpload={handleFileUpload} language={language} />
              </div>
            </div>
          )}

          {currentView === 'results' && analysisData && (
            <div className="container mx-auto px-4 py-12">
              <AnalysisResults
                data={analysisData}
                onNewAnalysis={() => setCurrentView('home')}
                language={language}
              />
            </div>
          )}

          {currentView === 'profile' && (
            <div className="container mx-auto px-4 py-12">
              <ProfileView
                history={history}
                language={language}
                onNavigateHome={() => setCurrentView('home')}
              />
            </div>
          )}
        </motion.div>
      </main>

      <ChatBot currentReport={analysisData?.id} language={language} />
    </div>
  )
}
