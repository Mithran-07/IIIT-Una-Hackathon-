'use client'

import React from "react"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Globe } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Language } from '@/lib/translations'
import { translations } from '@/lib/translations'
import NetworkAnimation from './network-animation'

interface AuthPageProps {
  onAuthenticate: () => void
  language: Language
  onLanguageChange: (language: Language) => void
}

export default function AuthPage({ onAuthenticate, language, onLanguageChange }: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const t = translations[language]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (isSignUp) {
        // Use email as username for simplicity
        await import('@/lib/api').then(m => m.api.register(email, email, password))
      } else {
        await import('@/lib/api').then(m => m.api.login(email, password))
      }
      onAuthenticate()
    } catch (error: any) {
      alert((isSignUp ? "Sign Up Failed: " : "Login Failed: ") + error.message)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Side - Navy Blue with Network Animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary to-secondary relative overflow-hidden items-center justify-center"
      >
        <NetworkAnimation />
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="relative z-10 text-center px-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-primary-foreground mb-6">
            {t.appName}
          </h1>
          <p className="text-xl text-primary-foreground/90 mb-4">
            {t.aiPoweredFinancial}
          </p>
          <p className="text-lg text-primary-foreground/80">
            Analyze financial data with advanced AI algorithms
          </p>
        </motion.div>
      </motion.div>

      {/* Right Side - Form */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full lg:w-1/2 bg-background flex items-center justify-center p-6"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          {/* Language Selector */}
          <motion.div variants={itemVariants} className="mb-10 flex items-center justify-between lg:hidden">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                {t.appName}
              </h1>
              <p className="text-muted-foreground">
                {t.financialCompliance}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-muted-foreground hover:text-foreground"
                >
                  <Globe size={18} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem onClick={() => onLanguageChange('en')}>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onLanguageChange('hi')}>
                  हिंदी
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onLanguageChange('ta')}>
                  தமிழ்
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-3xl font-bold text-foreground mb-2"
          >
            {isSignUp ? t.createAccount : t.signIn}
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-muted-foreground mb-8"
          >
            {isSignUp
              ? t.joinThousands
              : t.welcomeBack}
          </motion.p>

          <motion.form
            variants={itemVariants}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                {t.emailAddress}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-input border-border focus:ring-accent"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                {t.password}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-input border-border focus:ring-accent"
              />
            </div>

            {isSignUp && (
              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="confirm" className="text-foreground">
                  {t.confirmPassword}
                </Label>
                <Input
                  id="confirm"
                  type="password"
                  placeholder="••••••••"
                  className="bg-input border-border focus:ring-accent"
                />
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold h-11 rounded-lg transition-all duration-200 hover:shadow-lg"
              >
                {isSignUp ? t.createAccount : t.signIn}
              </Button>
            </motion.div>
          </motion.form>

          <motion.div
            variants={itemVariants}
            className="mt-8 flex items-center justify-between text-center text-sm text-muted-foreground"
          >
            <div>
              {isSignUp ? t.alreadyHaveAccount : t.dontHaveAccount}{' '}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-accent hover:text-accent/80 font-semibold transition-colors"
              >
                {isSignUp ? t.signIn : t.createAccount}
              </button>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-muted-foreground hover:text-foreground"
                >
                  <Globe size={18} />
                  <span className="hidden sm:inline text-xs">{language === 'en' ? 'EN' : language === 'hi' ? 'HI' : 'TA'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem onClick={() => onLanguageChange('en')}>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onLanguageChange('hi')}>
                  हिंदी
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onLanguageChange('ta')}>
                  தமிழ்
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
