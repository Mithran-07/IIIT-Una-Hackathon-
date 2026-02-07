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
import { BarChart3, TrendingUp, FileText } from 'lucide-react'
import type { Language } from '@/lib/translations'
import { translations } from '@/lib/translations'

interface Analysis {
  id: string
  fileName: string
  score: number
  date: string
}

interface UserHistoryProps {
  history: Analysis[]
  onSelectAnalysis: (analysis: Analysis & { factors: any[] }) => void
  language: Language
}

export default function UserHistory({
  history,
  onSelectAnalysis,
  language,
}: UserHistoryProps) {
  const t = translations[language]
  const totalScans = history.length
  const averageScore =
    history.length > 0
      ? Math.round(history.reduce((sum, item) => sum + item.score, 0) / history.length)
      : 0

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

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500/10'
    if (score >= 50) return 'bg-amber-500/10'
    return 'bg-red-500/10'
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">
          {t.recentAnalyses}
        </h1>
        <p className="text-muted-foreground">
          View all your financial analyses and performance metrics
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid sm:grid-cols-3 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {[
          {
            icon: FileText,
            label: t.totalScans,
            value: totalScans,
            color: 'bg-blue-500/10 text-blue-600',
          },
          {
            icon: TrendingUp,
            label: t.averageScore,
            value: `${averageScore}%`,
            color: 'bg-green-500/10 text-green-600',
          },
          {
            icon: BarChart3,
            label: t.complianceRate,
            value: '94%',
            color: 'bg-purple-500/10 text-purple-600',
          },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <Card className="bg-card border border-border p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon size={24} />
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Recent Scans Table */}
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold text-foreground mb-4">
          {t.recentAnalyses}
        </h2>

        <Card className="bg-card border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50 border-b border-border">
                <TableRow>
                  <TableHead className="text-foreground font-semibold">
                    {t.date}
                  </TableHead>
                  <TableHead className="text-foreground font-semibold">
                    {t.file}
                  </TableHead>
                  <TableHead className="text-foreground font-semibold text-right">
                    Score
                  </TableHead>
                  <TableHead className="text-foreground font-semibold text-right">
                    {t.view}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.length > 0 ? (
                  history.map((item, index) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="text-muted-foreground py-4">
                        {item.date}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {item.fileName}
                      </TableCell>
                      <TableCell className="text-right">
                        <motion.span
                          className={`font-bold text-lg ${getScoreColor(item.score)}`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: 'spring',
                            stiffness: 200,
                            damping: 15,
                          }}
                        >
                          {item.score}%
                        </motion.span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            onSelectAnalysis({
                              ...item,
                              factors: [
                                { name: 'Liquidity', score: 85 },
                                { name: 'Solvency', score: 78 },
                                { name: 'Compliance', score: 82 },
                                { name: 'Risk Assessment', score: 80 },
                                { name: 'Cash Flow', score: 88 },
                                { name: 'Asset Quality', score: 79 },
                                { name: 'Profitability', score: 81 },
                              ],
                            })
                          }
                          className="hover:bg-accent hover:text-accent-foreground"
                        >
                          {t.view}
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {t.noAnalyses}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}
