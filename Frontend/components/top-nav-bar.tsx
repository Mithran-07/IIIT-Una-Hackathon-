'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Globe, User, Settings, LogOut } from 'lucide-react'
import type { Language } from '@/lib/translations'
import { translations } from '@/lib/translations'

interface TopNavBarProps {
  isLoggedIn: boolean
  onLoginClick: () => void
  onLogoClick: () => void
  language: Language
  onLanguageChange: (language: Language) => void
  onProfileClick?: () => void
  onDashboardClick?: () => void
  onAboutClick?: () => void
  userName?: string
}

export default function TopNavBar({
  isLoggedIn,
  onLoginClick,
  onLogoClick,
  language,
  onLanguageChange,
  onProfileClick,
  onDashboardClick,
  onAboutClick,
  userName = 'User',
}: TopNavBarProps) {
  const t = translations[language]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 bg-background border-b border-border backdrop-blur-sm"
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo - Clickable to go home */}
        <motion.button
          onClick={onLogoClick}
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-accent to-secondary rounded-lg flex items-center justify-center">
            <span className="text-accent-foreground font-bold text-lg">AX</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">AuditX</h1>
            <p className="text-xs text-muted-foreground">Audit Intelligence</p>
          </div>
        </motion.button>

        {/* Center: Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          <button
            onClick={onLogoClick}
            className="text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            Home
          </button>
          <button
            onClick={onAboutClick}
            className="text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            About
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <Globe size={18} />
                <span className="hidden sm:inline text-sm">
                  {language === 'en' ? 'EN' : language === 'hi' ? 'HI' : 'TA'}
                </span>
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

          {/* Auth Section */}
          {!isLoggedIn ? (
            <Button
              onClick={onLoginClick}
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-6"
            >
              {t.signIn}
            </Button>
          ) : (
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
                <DropdownMenuItem className="gap-2" onClick={onDashboardClick}>
                  <span>📊</span>
                  <span>Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 text-destructive">
                  <LogOut size={16} />
                  <span>{t.signOut}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </motion.nav>
  )
}
