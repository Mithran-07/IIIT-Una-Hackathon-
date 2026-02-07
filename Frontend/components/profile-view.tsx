'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Mail, Calendar, ArrowLeft } from 'lucide-react'
import type { Language } from '@/lib/translations'
import { translations } from '@/lib/translations'

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

interface UserProfile {
  name: string
  email: string
  plan: string
  joined: string
}

interface ProfileViewProps {
  userProfile?: UserProfile
  history: AnalysisData[]
  language: Language
  onNavigateHome: () => void
  onBackToDashboard?: () => void
}

export default function ProfileView({
  userProfile,
  history,
  language,
  onNavigateHome,
  onBackToDashboard,
}: ProfileViewProps) {
  const t = translations[language]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 50) return 'text-amber-500'
    return 'text-red-500'
  }

  const getStatusBg = (score: number) => {
    if (score >= 80) return 'bg-green-500/10 text-green-700'
    if (score >= 50) return 'bg-amber-500/10 text-amber-700'
    return 'bg-red-500/10 text-red-700'
  }

  const getStatusLabel = (score: number) => {
    if (score >= 80) return 'Passed'
    if (score >= 50) return 'Caution'
    return 'Failed'
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Back Button */}
      <motion.div variants={itemVariants} className="flex gap-4">
        <button
          onClick={onBackToDashboard || onNavigateHome}
          className="flex items-center gap-2 text-accent hover:text-accent/80 font-medium transition-colors"
        >
          <ArrowLeft size={18} />
          {onBackToDashboard ? 'Back to Dashboard' : 'Back to Home'}
        </button>
      </motion.div>

      {/* Header */}
      <motion.div variants={itemVariants} className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground">
          View and manage your account information
        </p>
      </motion.div>

      {/* User Card */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-accent/10 to-secondary/10 border border-border p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-secondary rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-accent-foreground">
                    {userProfile?.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('') || 'US'}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {userProfile?.name || 'User'}
                  </h2>
                  <p className="text-muted-foreground">
                    {userProfile?.plan || 'Member'}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-border">
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-muted-foreground" />
                  <span className="text-foreground">
                    {userProfile?.email || 'user@example.com'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-muted-foreground" />
                  <span className="text-foreground">
                    Member since {userProfile?.joined || 'January 2024'}
                  </span>
                </div>
              </div>
            </div>

            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-6">
              Edit Profile
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}
