'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatPanelProps {
  isOpen: boolean
  onClose?: () => void
  // Context from calculator (for future AI integration)
  context?: {
    panelCount?: number
    brand?: string
    batteryKwh?: number
    electricityBill?: number
    coveragePercent?: number
  }
}

const QUICK_ACTIONS = [
  { label: 'Deye vs Huawei', question: 'Qual a diferença entre Deye e Huawei?' },
  { label: 'Tamanho ideal', question: 'Quantos painéis preciso para a minha casa?' },
  { label: 'Poupança real', question: 'Quanto posso poupar com energia solar?' },
  { label: 'Garantias', question: 'Quais são as garantias do equipamento?' },
]

export function ChatPanel({ isOpen, onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: 'Olá! Sou o Helius, o seu consultor virtual de energia solar. Como posso ajudá-lo hoje?',
        timestamp: new Date()
      }])
    }
  }, [messages.length])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = useCallback((messageText: string) => {
    if (!messageText.trim() || isLoading) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // TODO: Call AI API
    // For now, mock response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Obrigado pela sua pergunta! Esta funcionalidade está em desenvolvimento. Em breve poderei ajudá-lo com informações detalhadas sobre energia solar.',
        timestamp: new Date()
      }])
      setIsLoading(false)
    }, 1000)
  }, [isLoading])

  const handleSend = () => {
    sendMessage(input)
  }

  const handleQuickAction = (question: string) => {
    sendMessage(question)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!isOpen) return null

  const showQuickActions = messages.length <= 1

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-solar-orange to-yellow-500 p-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-2xl">☀️</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white">Helius AI</h3>
            <p className="text-xs text-white/80">Consultor de energia solar</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white transition-colors"
              aria-label="Fechar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      {showQuickActions && (
        <div className="px-3 py-3 border-b border-gray-100 flex-shrink-0">
          <p className="text-xs text-gray-500 mb-2">Perguntas frequentes:</p>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                onClick={() => handleQuickAction(action.question)}
                disabled={isLoading}
                className="px-3 py-2 text-xs font-medium text-solar-blue bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left disabled:opacity-50"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-3 py-2 ${
              msg.role === 'user'
                ? 'bg-solar-blue text-white rounded-br-md'
                : 'bg-gray-100 text-gray-800 rounded-bl-md'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-100 flex-shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escreva a sua pergunta..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-solar-orange disabled:bg-gray-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-solar-orange text-white rounded-full hover:bg-solar-orange-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            aria-label="Enviar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
