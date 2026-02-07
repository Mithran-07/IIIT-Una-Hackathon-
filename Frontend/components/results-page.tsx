'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Download, ArrowLeft, CheckCircle } from 'lucide-react'
import type { Language } from '@/lib/translations'
import { translations } from '@/lib/translations'
import ScoreGauge from './score-gauge'

interface Factor {
  name: string
  score: number
}

interface ResultsPageProps {
  data: {
    fileName: string
    score: number
    date: string
    factors: Factor[]
    aiExplanation?: string
    provenanceHash?: string
  }
  onBackHome: () => void
  language: Language
  isGuest: boolean
}

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
    transition: { duration: 0.6 },
  },
}

const getFactorColor = (score: number) => {
  if (score >= 80) return 'bg-green-500'
  if (score >= 50) return 'bg-yellow-500'
  return 'bg-red-500'
}

const getFactorLabel = (score: number, language: Language) => {
  const t = translations[language]
  if (score >= 80) return t.healthy
  if (score >= 50) return t.caution
  return t.risk
}

export default function ResultsPage({
  data,
  onBackHome,
  language,
  isGuest,
}: ResultsPageProps) {
  const t = translations[language]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background py-12"
    >
      <div className="container mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          {/* Security Badge */}
          <motion.div variants={itemVariants} className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent rounded-full">
              <CheckCircle size={18} className="text-accent" />
              <span className="text-sm font-semibold text-accent">
                100% Secured Data Environment
              </span>
            </div>
          </motion.div>

          {/* Back Button */}
          <motion.button
            variants={itemVariants}
            onClick={onBackHome}
            className="flex items-center gap-2 text-accent hover:text-accent/80 font-medium transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Home
          </motion.button>

          {/* Main Content Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Score Gauge */}
            <motion.div variants={itemVariants} className="md:col-span-1">
              <Card className="bg-card border border-border p-8 h-full flex items-center justify-center">
                <ScoreGauge score={data.score} />
              </Card>
            </motion.div>

            {/* Factors Grid */}
            <motion.div variants={itemVariants} className="md:col-span-2 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  {t.coreDataQualityFactors}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.factors.map((factor, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="bg-card rounded-lg p-4 border border-border hover:border-accent/50 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-foreground text-sm">
                          {factor.name}
                        </h3>
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full text-white ${getFactorColor(
                            factor.score
                          )}`}
                        >
                          {getFactorLabel(factor.score, language)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">
                          Score
                        </span>
                        <span className="text-lg font-bold text-accent">
                          {factor.score}%
                        </span>
                      </div>
                      <Progress value={factor.score} className="h-2" />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* File Info */}
              <motion.div
                variants={itemVariants}
                className="bg-card rounded-lg p-6 border border-border space-y-4"
              >
                <h3 className="font-semibold text-foreground">Analysis Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">File Name:</span>
                    <span className="font-medium text-foreground">
                      {String(data.fileName)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium text-foreground">
                      {data.date}
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* AI Analysis Summary */}
          {data.aiExplanation && (
            <motion.div variants={itemVariants} className="bg-card border border-border rounded-lg p-6 space-y-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                ⚡ AI Audit Summary
              </h2>
              <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                {data.aiExplanation}
              </div>
            </motion.div>
          )}

          {/* Provenance Hash */}
          {data.provenanceHash && (
            <motion.div variants={itemVariants} className="flex justify-center">
              <div className="text-xs text-muted-foreground font-mono bg-muted/50 px-4 py-2 rounded border border-border">
                Cryptographic Hash: {data.provenanceHash}
              </div>
            </motion.div>
          )}

          {/* Download Certificate Button */}
          <motion.div variants={itemVariants} className="flex justify-center">
            <Button
              onClick={async () => {
                try {
                  const api = await import('@/lib/api').then(m => m.api);
                  // Now data has the id mapped in api.ts
                  await api.downloadReport((data as any).id);
                } catch (e: any) {
                  alert("Download failed: " + e.message);
                }
              }}
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 text-lg"
            >
              <Download size={24} />
              Download Audit Certificate
            </Button>
          </motion.div>

          {/* Guest Notice */}
          {isGuest && (
            <motion.div
              variants={itemVariants}
              className="bg-secondary/10 border border-secondary rounded-lg p-4 text-center"
            >
              <p className="text-sm text-muted-foreground">
                Guest Analysis - Results are not saved. Sign up to save your audit history.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
