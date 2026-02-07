'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface ScoreGaugeProps {
  score: number
}

export default function ScoreGauge({ score }: ScoreGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = 300
    canvas.width = size
    canvas.height = size

    const centerX = size / 2
    const centerY = size / 2
    const radius = 100

    // Clear canvas
    ctx.clearRect(0, 0, size, size)

    // Draw background circle
    ctx.fillStyle = '#f5f5dc'
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.fill()

    // Draw gauge background (gray)
    ctx.strokeStyle = '#d4d4d8'
    ctx.lineWidth = 20
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius - 10, 0, Math.PI, true)
    ctx.stroke()

    // Draw gauge fill (colored based on score)
    const gaugePercentage = Math.min(score / 100, 1)
    const gaugeEnd = Math.PI * gaugePercentage

    let color = '#22c55e' // Green
    if (score < 80) color = '#eab308' // Amber
    if (score < 50) color = '#ef4444' // Red

    ctx.strokeStyle = color
    ctx.lineWidth = 20
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius - 10, 0, gaugeEnd, true)
    ctx.stroke()

    // Draw score text
    ctx.fillStyle = '#0a192f'
    ctx.font = 'bold 48px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(score), centerX, centerY - 20)

    // Draw percentage sign
    ctx.font = '24px sans-serif'
    ctx.fillText('%', centerX + 40, centerY - 30)

    // Draw label
    ctx.fillStyle = '#6b7280'
    ctx.font = '14px sans-serif'
    ctx.fillText('Data Quality Score', centerX, centerY + 50)

    // Draw status text
    let status = 'Safe'
    if (score < 80) status = 'Average'
    if (score < 50) status = 'Danger'

    ctx.fillStyle = color
    ctx.font = 'bold 16px sans-serif'
    ctx.fillText(status, centerX, centerY + 80)
  }, [score])

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 15,
        duration: 0.8,
      }}
      className="flex justify-center"
    >
      <div className="relative">
        {/* Glow effect */}
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
          }}
          className="absolute inset-0 rounded-full blur-2xl"
          style={{
            background:
              score >= 80
                ? '#22c55e'
                : score >= 50
                  ? '#eab308'
                  : '#ef4444',
            opacity: 0.2,
          }}
        />

        <canvas
          ref={canvasRef}
          className="relative z-10"
          aria-label={`Score: ${score}%`}
        />
      </div>
    </motion.div>
  )
}
