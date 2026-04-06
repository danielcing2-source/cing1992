import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isTyping?: boolean;
  disabled?: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  isTyping,
  disabled 
}) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled && !isTyping) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-3xl border border-brand-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-brand-100 bg-brand-50/50 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white shadow-sm">
          <Sparkles size={16} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-brand-900">Design Consultant</h3>
          <p className="text-[10px] text-brand-500 uppercase tracking-widest font-medium">AI Powered Assistant</p>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar bg-brand-50/20"
      >
        <AnimatePresence initial={false}>
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-10 px-6"
            >
              <div className="w-12 h-12 rounded-2xl bg-brand-100 flex items-center justify-center text-brand-600 mx-auto mb-4">
                <Sparkles size={24} />
              </div>
              <h4 className="text-brand-900 font-medium mb-2">How can I help you today?</h4>
              <p className="text-sm text-brand-500 max-w-[240px] mx-auto">
                Ask me to refine your design, suggest furniture, or find similar items.
              </p>
            </motion.div>
          )}

          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex gap-3 max-w-[85%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm",
                msg.role === 'user' ? "bg-brand-100 text-brand-600" : "bg-brand-600 text-white"
              )}>
                {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
              </div>
              <div className={cn(
                "px-4 py-3 rounded-2xl text-sm shadow-sm",
                msg.role === 'user' 
                  ? "bg-brand-600 text-white rounded-tr-none" 
                  : "bg-white text-brand-900 border border-brand-100 rounded-tl-none"
              )}>
                <div className="markdown-body">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 mr-auto"
            >
              <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white shadow-sm">
                <Sparkles size={16} />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-white border border-brand-100 rounded-tl-none shadow-sm">
                <div className="flex gap-1">
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }} 
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-1.5 h-1.5 bg-brand-400 rounded-full" 
                  />
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }} 
                    transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                    className="w-1.5 h-1.5 bg-brand-400 rounded-full" 
                  />
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }} 
                    transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                    className="w-1.5 h-1.5 bg-brand-400 rounded-full" 
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <form 
        onSubmit={handleSubmit}
        className="p-4 bg-white border-t border-brand-100 flex gap-2 items-center"
      >
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask for refinements or advice..."
          disabled={disabled || isTyping}
          className="flex-1 bg-brand-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 transition-all outline-none placeholder:text-brand-400"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={!input.trim() || disabled || isTyping}
          className="w-11 h-11 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isTyping ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
        </motion.button>
      </form>
    </div>
  );
};
