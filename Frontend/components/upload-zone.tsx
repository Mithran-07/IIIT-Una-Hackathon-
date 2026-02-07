'use client'

import React from "react"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import type { Language } from '@/lib/translations'
import { translations } from '@/lib/translations'

interface UploadZoneProps {
  onFileUpload: (file: File) => void
  language: Language
}

type UploadState = 'idle' | 'uploading' | 'analyzing' | 'complete'

export default function UploadZone({ onFileUpload, language }: UploadZoneProps) {
  const [state, setState] = useState<UploadState>('idle')
  const [fileName, setFileName] = useState('')
  const [progress, setProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const t = translations[language]

  const simulateUpload = (name: string) => {
    setFileName(name)
    setState('uploading')
    setProgress(0)

    const uploadInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(uploadInterval)
          setState('analyzing')
          return 100
        }
        return prev + Math.random() * 30
      })
    }, 300)
  }

  const handleFileSelect = (file: File) => {
    simulateUpload(file.name)

    // Simulate analysis
    setTimeout(() => {
      setState('complete')
    }, 2000)

    // Complete and move forward
    setTimeout(() => {
      onFileUpload(file)
      setState('idle')
      setProgress(0)
    }, 3000)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="w-full max-w-3xl mx-auto"
    >
      <AnimatePresence mode="wait">
        {state === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer ${isDragging
                  ? 'border-accent bg-accent/5 scale-105'
                  : 'border-border bg-card hover:bg-card/50 hover:border-accent/50'
                }`}
              whileHover={{ scale: isDragging ? 1.05 : 1.02 }}
            >
              {/* Animated background elements */}
              <motion.div
                animate={{
                  scale: isDragging ? 1.1 : 1,
                  opacity: isDragging ? 0.2 : 0.05,
                }}
                className="absolute inset-0 bg-gradient-to-br from-accent to-secondary rounded-2xl"
              />

              {/* Content */}
              <div className="relative z-10">
                <motion.div
                  animate={{ y: isDragging ? -5 : 0 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                  className="mb-6 flex justify-center"
                >
                  <motion.div
                    animate={{
                      scale: isDragging ? 1.2 : 1,
                    }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Upload
                      size={48}
                      className={`transition-colors ${isDragging ? 'text-accent' : 'text-muted-foreground'
                        }`}
                    />
                  </motion.div>
                </motion.div>

                <h3 className="text-2xl font-bold text-foreground mb-3">
                  {t.dragDrop}
                </h3>

                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  {t.orClick}
                </p>

                <label className="inline-block">
                  <input
                    type="file"
                    accept=".pdf,.xlsx,.xls,.csv"
                    onChange={(e) => {
                      if (e.target.files) {
                        handleFileSelect(e.target.files[0])
                      }
                    }}
                    className="hidden"
                  />
                  <Button
                    asChild
                    className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8"
                  >
                    <span className="cursor-pointer">{t.chooseFile}</span>
                  </Button>
                </label>
              </div>
            </motion.div>
          </motion.div>
        )}

        {state === 'uploading' && (
          <motion.div
            key="uploading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="bg-card rounded-2xl p-8 border border-border"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              className="mb-6 flex justify-center"
            >
              <Loader2
                size={40}
                className="text-accent animate-spin"
              />
            </motion.div>

            <h3 className="text-xl font-bold text-foreground text-center mb-2">
              {t.extractingMetadata}
            </h3>
            <p className="text-muted-foreground text-center mb-6">{fileName}</p>

            <Progress value={progress} className="h-2 mb-4" />

            <p className="text-center text-sm text-muted-foreground">
              {Math.round(progress)}% {t.complete}
            </p>
          </motion.div>
        )}

        {state === 'analyzing' && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="bg-card rounded-2xl p-8 border border-border"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'linear',
              }}
              className="mb-6 flex justify-center"
            >
              <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full" />
            </motion.div>

            <h3 className="text-xl font-bold text-foreground text-center mb-2">
              {t.analyzing7Factors}
            </h3>

            <div className="space-y-3 mb-6">
              {[
                'Liquidity Analysis',
                'Solvency Assessment',
                'Compliance Check',
              ].map((factor, i) => (
                <motion.div
                  key={factor}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.2 }}
                  className="flex items-center gap-3"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                  >
                    <Loader2
                      size={16}
                      className="text-accent animate-spin"
                    />
                  </motion.div>
                  <span className="text-muted-foreground">{factor}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {state === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="bg-card rounded-2xl p-8 border border-border text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="mb-6 flex justify-center"
            >
              <CheckCircle size={48} className="text-accent" />
            </motion.div>

            <h3 className="text-xl font-bold text-foreground mb-2">
              {t.analysisComplete}
            </h3>
            <p className="text-muted-foreground mb-6">
              {t.preparingReport}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
