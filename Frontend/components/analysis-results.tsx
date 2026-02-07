'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Download, ArrowLeft } from 'lucide-react'
import type { Language } from '@/lib/translations'
import { translations } from '@/lib/translations'
import ScoreGauge from './score-gauge'

interface Factor {
  name: string
  score: number
}

interface AnalysisResultsProps {
  data: {
    fileName: string
    score: number
    date: string
    factors: Factor[]
  }
  onNewAnalysis: () => void
  language: Language
}

const getFactorColor = (score: number) => {
  if (score >= 80) return 'bg-green-500'
  if (score >= 50) return 'bg-amber-500'
  return 'bg-red-500'
}

const getFactorLabel = (score: number, language: Language) => {
  const t = translations[language]
  if (score >= 80) return t.healthy
  if (score >= 50) return t.caution
  return t.risk
}

export default function AnalysisResults({
  data,
  onNewAnalysis,
  language,
}: AnalysisResultsProps) {
  const t = translations[language]
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Back Button */}
      <motion.button
        variants={itemVariants}
        onClick={onNewAnalysis}
        className="flex items-center gap-2 text-accent hover:text-accent/80 font-medium transition-colors"
      >
        <ArrowLeft size={18} />
        {t.newAnalysis}
      </motion.button>

      {/* Header */}
      <motion.div variants={itemVariants} className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">{t.analysisResults}</h1>
        <p className="text-muted-foreground">
          {t.file}: <span className="font-semibold">{data.fileName}</span> • {t.date}:{' '}
          <span className="font-semibold">{data.date}</span>
        </p>
      </motion.div>

      {/* Score Section */}
      <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-8">
        {/* Gauge */}
        <div className="flex items-center justify-center">
          <ScoreGauge score={data.score} />
        </div>

        {/* Score Details */}
        <div className="flex flex-col justify-center space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {t.dataQualityScore}
            </h2>
            <p className="text-muted-foreground mb-4">
              Overall assessment of your financial data integrity and compliance
              status
            </p>

            <div className="space-y-4">
              <div className="bg-card rounded-lg p-4 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-foreground font-medium">
                    {t.overallHealth}
                  </span>
                  <span className="text-2xl font-bold text-accent">
                    {data.score}%
                  </span>
                </div>
                <Progress
                  value={data.score}
                  className="h-2"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Download size={20} />
                {t.downloadComprehensivePDF}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Factors Grid */}
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold text-foreground mb-6">
          {t.coreDataQualityFactors}
        </h2>

        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {data.factors.map((factor, index) => (
            <motion.div
              key={factor.name}
              variants={itemVariants}
              whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
            >
              <Card className="bg-card border border-border hover:border-accent/50 p-6 transition-all duration-300 backdrop-blur-sm bg-white/50">
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">
                    {factor.name}
                  </h3>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-foreground">
                        {factor.score}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full text-white ${getFactorColor(
                          factor.score
                        )}`}
                      >
                        {getFactorLabel(factor.score, language)}
                      </span>
                    </div>

                    <Progress
                      value={factor.score}
                      className="h-1.5"
                    />
                  </div>

                  {/* Status Indicator */}
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                    className={`w-2 h-2 rounded-full ${
                      factor.score >= 80
                        ? 'bg-green-500'
                        : factor.score >= 50
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                    }`}
                  />
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Additional Insights */}
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold text-foreground mb-6">{t.keyInsights}</h2>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              title: t.complianceStatus,
              description: t.allRegulatoryMet,
              icon: '✓',
            },
            {
              title: t.riskLevel,
              description: t.moderateRequiresAttention,
              icon: '⚠',
            },
            {
              title: t.actionItems,
              description: t.recommendationsForImprovement,
              icon: '→',
            },
          ].map((insight) => (
            <Card
              key={insight.title}
              className="bg-card border border-border p-4"
            >
              <div className="text-2xl mb-2">{insight.icon}</div>
              <h3 className="font-semibold text-foreground mb-1">
                {insight.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {insight.description}
              </p>
            </Card>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
