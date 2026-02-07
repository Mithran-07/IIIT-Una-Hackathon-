'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Zap, Shield, Eye } from 'lucide-react'
import { Card } from '@/components/ui/card'
import type { Language } from '@/lib/translations'
import { translations } from '@/lib/translations'
import UploadZone from './upload-zone'
import TopNavBar from './top-nav-bar'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

interface PublicHomeProps {
  language: Language
  onLanguageChange: (language: Language) => void
  isLoggedIn: boolean
  onLoginClick: () => void
  onFileUpload: (file: File) => void
  onLogoClick?: () => void
  onProfileClick?: () => void
  onDashboardClick?: () => void
}

export default function PublicHome({
  language,
  onLanguageChange,
  isLoggedIn,
  onLoginClick,
  onFileUpload,
  onLogoClick,
  onProfileClick,
  onDashboardClick,
}: PublicHomeProps) {
  const t = translations[language]

  const features = [
    {
      icon: Eye,
      title: 'Privacy First',
      description: 'Zero-knowledge proofs ensure your data remains confidential',
    },
    {
      icon: Zap,
      title: 'Metadata Analysis',
      description: 'Non-intrusive scanning that respects your data privacy',
    },
    {
      icon: Shield,
      title: 'Bank-Grade Security',
      description: 'AES-256 encryption with ISO 27001 compliance standards',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background"
    >
      {/* Top Navigation - REMOVED (Handled in page.tsx) */}


      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          {/* Hero Text */}
          <motion.div variants={itemVariants} className="text-center max-w-3xl mx-auto space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground">
              {t.appName}
            </h1>
            <p className="text-2xl text-accent font-semibold">
              AI-Powered Financial Compliance
            </p>
            <p className="text-lg text-muted-foreground">
              Analyze financial documents with advanced NLP and Machine Learning algorithms
            </p>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            variants={itemVariants}
            className="grid md:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="bg-card border border-border p-6 h-full">
                    <div className="flex flex-col items-start gap-4">
                      <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                        <Icon size={24} className="text-accent" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>

          {/* About Section */}
          <motion.div
            variants={itemVariants}
            className="bg-card border border-border rounded-lg p-8 md:p-12"
          >
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Why AuditX?
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              AuditX utilizes advanced NLP and Machine Learning algorithms to audit financial datasets against 7 distinct data quality dimensions: Completeness, Validity, Accuracy, Consistency, Timeliness, Integrity, and Security. Our architecture ensures distinct separation between sensitive transactional data and metadata analysis, providing you with comprehensive insights while maintaining the highest standards of data privacy and security.
            </p>
          </motion.div>

          {/* Upload Section */}
          <motion.div variants={itemVariants}>
            <UploadZone onFileUpload={onFileUpload} language={language} />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}
