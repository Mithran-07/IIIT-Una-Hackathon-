'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Globe, User, LogOut, Home, History } from 'lucide-react'
import type { Language } from '@/lib/translations'
import { translations } from '@/lib/translations'

interface DashboardNavProps {
  currentView: string
  onNavigate: (view: 'home' | 'results' | 'profile') => void
  language: Language
  onLanguageChange: (language: Language) => void
  onProfileClick: () => void
}

export default function DashboardNav({
  currentView,
  onNavigate,
  language,
  onLanguageChange,
  onProfileClick,
}: DashboardNavProps) {
  const t = translations[language]
  const navItems = [
    { id: 'home', label: t.dashboard, icon: Home },
  ]

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-accent to-secondary rounded-lg flex items-center justify-center">
              <span className="text-accent-foreground font-bold text-lg">AX</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{t.appName}</h1>
              <p className="text-xs text-muted-foreground">{t.auditIntelligence}</p>
            </div>
          </motion.div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <motion.button
                  key={item.id}
                  onClick={() =>
                    onNavigate(item.id as 'home' | 'results' | 'history')
                  }
                  className={`flex items-center gap-2 font-medium transition-all duration-200 ${
                    currentView === item.id
                      ? 'text-accent'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  whileHover={{ x: 2 }}
                >
                  <Icon size={18} />
                  {item.label}
                  {currentView === item.id && (
                    <motion.div
                      layoutId="navUnderline"
                      className="absolute bottom-0 h-1 bg-accent rounded-full"
                    />
                  )}
                </motion.button>
              )
            })}
          </div>

          {/* Right Side - Language & User Menu */}
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-muted-foreground hover:text-foreground"
                >
                  <Globe size={18} />
                  <span className="hidden sm:inline text-sm">{language === 'en' ? 'English' : language === 'hi' ? 'हिंदी' : 'தமிழ்'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
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

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full w-10 h-10 p-0"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-accent to-secondary rounded-full flex items-center justify-center">
                    <User size={16} className="text-accent-foreground" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="gap-2" onClick={onProfileClick}>
                  <User size={16} />
                  <span>My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <User size={16} />
                  <span>{t.profileSettings}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 text-destructive">
                  <LogOut size={16} />
                  <span>{t.signOut}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex justify-between mt-4 pt-4 border-t border-border">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() =>
                  onNavigate(item.id as 'home' | 'results' | 'profile')
                }
                className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-all ${
                  currentView === item.id
                    ? 'bg-accent/10 text-accent'
                    : 'text-muted-foreground'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </motion.nav>
  )
}
