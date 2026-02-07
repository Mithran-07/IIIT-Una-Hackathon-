'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, Brain, Zap, Lock, TrendingUp, Users, ArrowLeft } from 'lucide-react'
import type { Language } from '@/lib/translations'

interface AboutPageProps {
    onBackHome: () => void
    language: Language
}

export default function AboutPage({ onBackHome, language }: AboutPageProps) {
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

    const features = [
        {
            icon: Brain,
            title: 'AI-Powered Analysis',
            description: 'Leverage cutting-edge AI models (Grok & Gemini) to detect anomalies, fraud patterns, and compliance violations in your financial data.',
        },
        {
            icon: Shield,
            title: 'Compliance Assurance',
            description: 'Automated checks against regulatory frameworks including Basel III, PCI-DSS, and data quality standards (DQS).',
        },
        {
            icon: Zap,
            title: 'Real-time Processing',
            description: 'Upload CSV files and get instant audit results with detailed breakdowns, risk scores, and actionable recommendations.',
        },
        {
            icon: Lock,
            title: 'Blockchain Provenance',
            description: 'Every audit is cryptographically hashed and recorded on the blockchain for immutable proof of integrity.',
        },
        {
            icon: TrendingUp,
            title: '7 Quality Metrics',
            description: 'Track Completeness, Validity, Accuracy, Consistency, Timeliness, Integrity, and Security across your data.',
        },
        {
            icon: Users,
            title: 'Intelligent Chatbot',
            description: 'Ask questions about your audit results and get expert insights from our AI-powered audit assistant.',
        },
    ]

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="min-h-screen bg-background"
        >
            {/* Back Button */}
            <motion.div variants={itemVariants} className="container mx-auto px-4 pt-8">
                <button
                    onClick={onBackHome}
                    className="flex items-center gap-2 text-accent hover:text-accent/80 font-medium transition-colors"
                >
                    <ArrowLeft size={18} />
                    Back to Home
                </button>
            </motion.div>

            <div className="container mx-auto px-4 py-12 space-y-16">
                {/* Header Section */}
                <motion.div variants={itemVariants} className="text-center space-y-4">
                    <div className="inline-flex items-center gap-4 mb-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-accent to-secondary rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-accent-foreground font-bold text-3xl">AX</span>
                        </div>
                        <div className="text-left">
                            <h1 className="text-5xl font-bold text-foreground">AuditX</h1>
                            <p className="text-xl text-muted-foreground">Audit Intelligence</p>
                        </div>
                    </div>

                    <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                        AuditX is an AI-powered financial audit platform that combines advanced machine learning,
                        statistical analysis, and blockchain technology to ensure the integrity and compliance of your financial data.
                    </p>
                </motion.div>

                {/* Mission Statement */}
                <motion.div variants={itemVariants}>
                    <Card className="bg-gradient-to-br from-accent/10 to-secondary/10 border border-border p-8">
                        <h2 className="text-3xl font-bold text-foreground mb-4">Our Mission</h2>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            To revolutionize financial auditing by making it faster, more accurate, and accessible to organizations
                            of all sizes. We believe every business deserves enterprise-grade audit tools powered by the latest AI
                            technology, without the complexity and cost of traditional audit solutions.
                        </p>
                    </Card>
                </motion.div>

                {/* Key Features Grid */}
                <motion.div variants={itemVariants} className="space-y-6">
                    <h2 className="text-3xl font-bold text-foreground text-center">What Makes AuditX Different</h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                variants={itemVariants}
                                whileHover={{ scale: 1.02 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Card className="h-full bg-card border border-border p-6 hover:border-accent/50 transition-colors">
                                    <div className="flex flex-col items-start gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-accent to-secondary rounded-lg flex items-center justify-center">
                                            <feature.icon className="text-accent-foreground" size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
                                            <p className="text-muted-foreground">{feature.description}</p>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* How It Works */}
                <motion.div variants={itemVariants} className="space-y-6">
                    <h2 className="text-3xl font-bold text-foreground text-center">How It Works</h2>

                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            { step: '01', title: 'Upload Data', desc: 'Upload your CSV financial data file' },
                            { step: '02', title: 'AI Analysis', desc: 'Our AI performs comprehensive checks using Benford\'s Law, DQS rules, and more' },
                            { step: '03', title: 'Get Results', desc: 'Receive detailed audit report with scores, violations, and AI-generated insights' },
                            { step: '04', title: 'Take Action', desc: 'Download PDF reports, ask chatbot questions, and fix compliance issues' },
                        ].map((item) => (
                            <Card key={item.step} className="bg-card border border-border p-6 text-center">
                                <div className="text-4xl font-bold text-accent mb-2">{item.step}</div>
                                <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                            </Card>
                        ))}
                    </div>
                </motion.div>

                {/* Technology Stack */}
                <motion.div variants={itemVariants}>
                    <Card className="bg-card border border-border p-8">
                        <h2 className="text-3xl font-bold text-foreground mb-6 text-center">Powered By</h2>
                        <div className="grid md:grid-cols-3 gap-6 text-center">
                            <div>
                                <h3 className="text-xl font-bold text-accent mb-2">AI Models</h3>
                                <p className="text-muted-foreground">Grok API, Google Gemini</p>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-accent mb-2">Analysis</h3>
                                <p className="text-muted-foreground">Benford's Law, Statistical Rules, Pattern Recognition</p>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-accent mb-2">Security</h3>
                                <p className="text-muted-foreground">SHA-256 Hashing, Blockchain Anchoring</p>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* CTA */}
                <motion.div variants={itemVariants} className="text-center">
                    <Button
                        onClick={onBackHome}
                        size="lg"
                        className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-6 text-lg"
                    >
                        Start Your First Audit
                    </Button>
                </motion.div>
            </div>
        </motion.div>
    )
}
