'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Shield, Zap, Scale } from 'lucide-react'
import type { Language } from '@/lib/translations'
import { translations } from '@/lib/translations'

interface AboutAuditXProps {
  language: Language
}

export default function AboutAuditX({ language }: AboutAuditXProps) {
  const t = translations[language]

  const features = [
    {
      icon: Zap,
      title: 'Instant Speed',
      description: '100x faster than manual auditing',
      color: 'from-yellow-500/20 to-orange-500/20',
      iconColor: 'text-yellow-600',
    },
    {
      icon: Scale,
      title: 'Zero Bias',
      description: 'AI-driven objectivity in analysis',
      color: 'from-blue-500/20 to-cyan-500/20',
      iconColor: 'text-blue-600',
    },
    {
      icon: Shield,
      title: 'Bank-Grade Security',
      description: 'ISO 27001 compliant standards',
      color: 'from-green-500/20 to-emerald-500/20',
      iconColor: 'text-green-600',
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
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

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className="py-16 space-y-12"
    >
      {/* Section Header */}
      <motion.div variants={itemVariants} className="text-center space-y-4">
        <h2 className="text-4xl md:text-5xl font-bold text-foreground">
          Why {t.appName}?
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          AI-First Financial Compliance Engine
        </p>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="grid md:grid-cols-3 gap-6"
      >
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <Card className={`bg-gradient-to-br ${feature.color} border border-border p-8 h-full flex flex-col items-center text-center space-y-4`}>
                <div className={`p-4 rounded-lg bg-card border border-border`}>
                  <Icon size={32} className={feature.iconColor} />
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>
    </motion.section>
  )
}
