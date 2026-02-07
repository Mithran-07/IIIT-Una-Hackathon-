'use client'

import React from "react"

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageCircle, Send, X, Minimize2, Maximize2 } from 'lucide-react'
import type { Language } from '@/lib/translations'
import { translations } from '@/lib/translations'

interface Message {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: Date
}

interface ChatBotProps {
  currentReport?: string
  language: Language
}

export default function ChatBot({ currentReport, language }: ChatBotProps) {
  const t = translations[language]
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content:
        currentReport
          ? `Hello! I'm here to discuss Report #${currentReport}. What would you like to know about the analysis?`
          : `Hello! I'm your ${t.appName} Financial AI Expert. How can I help you today?`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponses = [
        'Based on your financial data, I recommend focusing on improving liquidity ratios in the next quarter.',
        'The compliance score shows you\'re meeting regulatory requirements. Well done!',
        'I noticed some opportunities to optimize your cash flow management.',
        'Your solvency metrics are strong. Keep maintaining these standards.',
        'Would you like me to generate a detailed report on any specific factor?',
      ]

      const randomResponse =
        aiResponses[Math.floor(Math.random() * aiResponses.length)]

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: randomResponse,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
    }, 1000)
  }

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{
            scale: isOpen ? 0 : [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: isOpen ? 0 : Number.POSITIVE_INFINITY,
          }}
          className="w-16 h-16 bg-gradient-to-br from-accent to-secondary rounded-full flex items-center justify-center shadow-2xl cursor-pointer text-accent-foreground"
        >
          <MessageCircle size={24} />
        </motion.div>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-32px)] h-[600px] flex flex-col"
          >
            <Card className="flex flex-col h-full bg-card border border-border shadow-2xl rounded-2xl overflow-hidden backdrop-blur-xl bg-white/95">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-r from-primary to-secondary text-primary-foreground p-4 flex items-center justify-between relative z-50"
              >
                <div>
                  <h3 className="font-bold text-lg">Financial AI Expert</h3>
                  {currentReport && (
                    <p className="text-xs opacity-80">
                      Discussing Report #{currentReport}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 z-50 relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="text-primary-foreground hover:bg-primary-foreground/10 h-8 w-8 p-0 cursor-pointer"
                  >
                    {isMinimized ? (
                      <Maximize2 size={16} />
                    ) : (
                      <Minimize2 size={16} />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="text-primary-foreground hover:bg-primary-foreground/10 h-8 w-8 p-0 cursor-pointer"
                  >
                    <X size={16} />
                  </Button>
                </div>
              </motion.div>

              {/* Messages Area */}
              {!isMinimized && (
                <>
                  <ScrollArea className="flex-1 p-4 space-y-4">
                    {messages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${message.role === 'user'
                            ? 'bg-accent text-accent-foreground rounded-br-none'
                            : 'bg-muted text-foreground rounded-bl-none'
                            }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <span className="text-xs opacity-60 mt-1 block">
                            {message.timestamp.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </motion.div>
                    ))}

                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-2 items-center"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-accent to-secondary rounded-full flex items-center justify-center">
                          <span className="text-accent-foreground text-xs font-bold">
                            AI
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              animate={{ y: [0, -4, 0] }}
                              transition={{
                                duration: 0.6,
                                repeat: Number.POSITIVE_INFINITY,
                                delay: i * 0.1,
                              }}
                              className="w-2 h-2 bg-muted-foreground rounded-full"
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}

                    <div ref={scrollRef} />
                  </ScrollArea>

                  {/* Input Area */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="border-t border-border p-4 bg-background/50"
                  >
                    <form
                      onSubmit={handleSendMessage}
                      className="flex gap-2"
                    >
                      <Input
                        placeholder="Ask me anything..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading}
                        className="bg-input border-border focus:ring-accent text-foreground placeholder:text-muted-foreground"
                      />
                      <Button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="bg-accent hover:bg-accent/90 text-accent-foreground px-3"
                      >
                        <Send size={18} />
                      </Button>
                    </form>
                  </motion.div>
                </>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
