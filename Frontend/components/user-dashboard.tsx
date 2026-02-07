'use client'

import { motion } from 'framer-motion'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Download, ArrowLeft } from 'lucide-react'
import type { Language } from '@/lib/translations'
import { translations } from '@/lib/translations'
import TopNavBar from './top-nav-bar'

interface Report {
  id: string
  fileName: string
  score: number
  date: string
  status: 'completed' | 'processing'
}

interface UserDashboardProps {
  reports: Report[]
  language: Language
  onLanguageChange: (language: Language) => void
  onDownload: (reportId: string) => void
  onViewReport: (reportId: string) => void
  onBackHome: () => void
  isLoggedIn: boolean
  onLoginClick: () => void
  onProfileClick?: () => void
  onDashboardClick?: () => void
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

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600'
  if (score >= 50) return 'text-yellow-600'
  return 'text-red-600'
}

const getScoreBgColor = (score: number) => {
  if (score >= 80) return 'bg-green-500/10'
  if (score >= 50) return 'bg-yellow-500/10'
  return 'bg-red-500/10'
}

export default function UserDashboard({
  reports,
  language,
  onLanguageChange,
  onDownload,
  onViewReport,
  onBackHome,
  isLoggedIn,
  onLoginClick,
  onProfileClick,
  onDashboardClick,
}: UserDashboardProps) {
  const t = translations[language]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background"
    >
      <div className="container mx-auto px-4 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-foreground">
                Audit History
              </h1>
              <p className="text-muted-foreground">
                View and download your past audit reports
              </p>
            </div>
            <Button
              onClick={onBackHome}
              variant="outline"
              className="gap-2 bg-transparent"
            >
              <ArrowLeft size={18} />
              Back to Home
            </Button>
          </motion.div>

          {/* Reports Table */}
          <motion.div variants={itemVariants} className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50 border-b border-border">
                  <TableRow>
                    <TableHead className="text-foreground font-semibold">
                      S.No
                    </TableHead>
                    <TableHead className="text-foreground font-semibold">
                      Report Name
                    </TableHead>
                    <TableHead className="text-foreground font-semibold">
                      Issued Date
                    </TableHead>
                    <TableHead className="text-foreground font-semibold">
                      Score
                    </TableHead>
                    <TableHead className="text-foreground font-semibold text-right">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.length > 0 ? (
                    reports.map((report, index) => (
                      <motion.tr
                        key={report.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * index }}
                        className="border-b border-border hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="text-muted-foreground">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          {String(report.fileName)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {report.date}
                        </TableCell>
                        <TableCell>
                          <div
                            className={`inline-flex items-center justify-center w-12 h-12 rounded-full font-bold text-sm ${getScoreBgColor(
                              report.score
                            )} ${getScoreColor(report.score)}`}
                          >
                            {report.score}%
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onViewReport(report.id)}
                              className="hover:bg-accent/10 hover:text-accent"
                            >
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onDownload(report.id)}
                              className="hover:bg-accent/10 hover:text-accent"
                            >
                              <Download size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <p className="text-muted-foreground">
                          No reports yet. Upload a file to get started.
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}
