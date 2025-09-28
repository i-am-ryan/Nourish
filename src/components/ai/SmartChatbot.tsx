// src/components/ai/SmartChatbot.tsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  X, 
  Bot, 
  User,
  Sparkles,
  ArrowRight,
  Loader2,
  MapPin,
  Package,
  Info,
  Lightbulb,
  Maximize2,
  Minimize2,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { aiService, ChatMessage, ChatResponse } from '@/lib/aiService';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface SmartChatbotProps {
  isOpen: boolean;
  onToggle: () => void;
}

const SmartChatbot: React.FC<SmartChatbotProps> = ({ isOpen, onToggle }) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hi there! I'm here to help you with everything related to NourishSA.

I can assist you with:

• **Finding volunteer opportunities** - Discover tasks in your area
• **Locating food hubs** - Find nearby distribution centers  
• **Food donations** - Learn how to donate surplus food
• **Safety guidance** - Get food handling and safety tips
• **Platform navigation** - Help you find what you need

What can I help you with today?`,
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [showTyping, setShowTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, showTyping]);

  // Typing effect for AI responses
  const typeMessage = async (message: string, messageId: string) => {
    setShowTyping(true);
    setTypingText('');
    
    const words = message.split(' ');
    
    for (let i = 0; i < words.length; i++) {
      const currentText = words.slice(0, i + 1).join(' ');
      setTypingText(currentText);
      
      // Update the actual message in real-time
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: currentText }
          : msg
      ));
      
      // Variable speed - faster for short words, slower for longer ones
      const delay = words[i].length > 6 ? 150 : 80;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    setShowTyping(false);
    
    // Final update with complete message
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, content: message }
        : msg
    ));
  };

  const getUserContext = () => {
    return {
      location: profile?.city || 'Johannesburg',
      role: profile?.volunteer_role as 'pickup' | 'delivery' | undefined,
      isVerified: profile?.verification_status === 'verified'
    };
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: currentMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const response = await aiService.getChatResponse(
        [...messages, userMessage],
        getUserContext()
      );

      const assistantMessageId = (Date.now() + 1).toString();
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: '', // Start empty for typing effect
        timestamp: new Date()
      };

      // Add empty message first
      setMessages(prev => [...prev, assistantMessage]);

      // Handle actions if any
      if (response.actions && response.actions.length > 0) {
        (assistantMessage as any).actions = response.actions;
      }

      // Handle suggestions
      if (response.suggestions && response.suggestions.length > 0) {
        (assistantMessage as any).suggestions = response.suggestions;
      }

      // Start typing effect
      await typeMessage(response.message, assistantMessageId);

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessageId = (Date.now() + 1).toString();
      const errorMessage: ChatMessage = {
        id: errorMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      await typeMessage(
        "I'm having a bit of trouble right now, but I'm still here to help! You can explore the platform using the menu above, or try asking me something else.",
        errorMessageId
      );
      
      toast({
        title: 'Connection Issue',
        description: 'Having trouble connecting to the AI assistant. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setCurrentMessage(suggestion);
  };

  const handleActionClick = (action: any) => {
    if (action.type === 'navigate') {
      navigate(action.target);
      if (!isFullscreen) onToggle(); // Only close if not in fullscreen
      toast({
        title: 'Navigating',
        description: `Taking you to ${action.label}`,
      });
    }
  };

  const handleNewConversation = () => {
    setMessages([{
      id: '1',
      role: 'assistant',
      content: `Hi there! I'm here to help you with everything related to NourishSA.

I can assist you with:

• **Finding volunteer opportunities** - Discover tasks in your area
• **Locating food hubs** - Find nearby distribution centers  
• **Food donations** - Learn how to donate surplus food
• **Safety guidance** - Get food handling and safety tips
• **Platform navigation** - Help you find what you need

What can I help you with today?`,
      timestamp: new Date()
    }]);
  };

  const quickActions = [
    {
      label: 'Find volunteer tasks',
      message: 'Show me available volunteer tasks in my area',
      icon: Package,
      color: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
    },
    {
      label: 'Nearby food hubs',
      message: 'Where are the nearest food hubs to me?',
      icon: MapPin,
      color: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
    },
    {
      label: 'Food safety tips',
      message: 'What are the basic food safety guidelines I should know?',
      icon: Info,
      color: 'bg-orange-100 text-orange-700 hover:bg-orange-200'
    },
    {
      label: 'Getting started',
      message: 'I\'m new here, how do I get started as a volunteer?',
      icon: Lightbulb,
      color: 'bg-purple-100 text-purple-700 hover:bg-purple-200'
    }
  ];

  // Format message content with better styling
  const formatMessageContent = (content: string) => {
    // Split by lines and process each
    const lines = content.split('\n');
    return lines.map((line, index) => {
      // Handle bullet points
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return (
          <div key={index} className="flex items-start space-x-2 my-1">
            <span className="text-emerald-500 font-bold mt-1">•</span>
            <span className="flex-1">{line.replace(/^[•-]\s*/, '').replace(/\*\*(.*?)\*\*/g, '$1')}</span>
          </div>
        );
      }
      
      // Handle numbered lists
      if (/^\d+\./.test(line.trim())) {
        return (
          <div key={index} className="flex items-start space-x-2 my-1">
            <span className="text-blue-500 font-semibold">{line.match(/^\d+/)?.[0]}.</span>
            <span className="flex-1">{line.replace(/^\d+\.\s*/, '').replace(/\*\*(.*?)\*\*/g, '$1')}</span>
          </div>
        );
      }
      
      // Handle bold text
      if (line.includes('**')) {
        const parts = line.split(/(\*\*.*?\*\*)/);
        return (
          <p key={index} className="my-2">
            {parts.map((part, partIndex) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <span key={partIndex} className="font-semibold text-gray-900 dark:text-white">
                    {part.slice(2, -2)}
                  </span>
                );
              }
              return part;
            })}
          </p>
        );
      }
      
      // Regular paragraphs
      if (line.trim()) {
        return <p key={index} className="my-2 leading-relaxed">{line}</p>;
      }
      
      return <br key={index} />;
    });
  };

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onToggle}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full shadow-xl flex items-center justify-center z-50 hover:shadow-2xl transition-all duration-300"
      >
        <MessageCircle className="w-6 h-6" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
      </motion.button>
    );
  }

  const chatContainerClass = isFullscreen 
    ? "fixed inset-0 bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl z-50 flex flex-col"
    : "fixed bottom-6 right-6 w-96 h-[32rem] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 dark:border-gray-700/50 z-50 flex flex-col overflow-hidden";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={chatContainerClass}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-lg">NourishSA Assistant</h3>
            <div className="flex items-center space-x-1 text-white/80 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>Online & Ready to Help</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNewConversation}
            className="text-white hover:bg-white/20 p-2"
            title="New Conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="text-white hover:bg-white/20 p-2"
            title={isFullscreen ? "Minimize" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="text-white hover:bg-white/20 p-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className={`flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-50/50 to-white/80 dark:from-gray-800/50 dark:to-gray-900/80 ${isFullscreen ? 'max-w-4xl mx-auto w-full' : ''}`}>
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                }`}>
                  {message.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                
                <div className="space-y-3 flex-1">
                  <Card className={`p-4 ${
                    message.role === 'user' 
                      ? 'bg-emerald-500 text-white border-emerald-600' 
                      : 'bg-white/90 dark:bg-gray-800/90 border-gray-200/50 dark:border-gray-700/50'
                  }`}>
                    <div className={`text-sm leading-relaxed ${message.role === 'user' ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                      {message.role === 'assistant' 
                        ? formatMessageContent(message.content)
                        : <p className="whitespace-pre-wrap">{message.content}</p>
                      }
                    </div>
                  </Card>

                  {/* Action Buttons */}
                  {(message as any).actions && (
                    <div className="space-y-2">
                      {(message as any).actions.map((action: any, idx: number) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          onClick={() => handleActionClick(action)}
                          className="text-sm hover:bg-emerald-50 hover:border-emerald-300"
                        >
                          <ArrowRight className="w-4 h-4 mr-2" />
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* Suggestions */}
                  {(message as any).suggestions && (
                    <div className="flex flex-wrap gap-2">
                      {(message as any).suggestions.map((suggestion: string, idx: number) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="cursor-pointer hover:bg-emerald-100 text-sm py-1 px-3"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex items-start space-x-3 max-w-[85%]">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <Card className="p-4 bg-white/90 dark:bg-gray-800/90">
                <div className="flex items-center space-x-3">
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">I'm thinking about your question...</span>
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Quick Actions (show only if no conversation yet) */}
        {messages.length === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center font-medium">Quick actions to get started:</p>
            <div className={`grid gap-3 ${isFullscreen ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2'}`}>
              {quickActions.map((action, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick(action.message)}
                  className={`text-sm h-auto p-3 flex flex-col items-center space-y-2 ${action.color} border-none transition-all duration-200 hover:scale-105`}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-center leading-tight">{action.label}</span>
                </Button>
              ))}
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={`p-6 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 ${isFullscreen ? 'max-w-4xl mx-auto w-full' : ''}`}>
        <div className="flex space-x-3">
          <Input
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder="Ask me anything about volunteering, food safety, or using NourishSA..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isLoading}
            className="flex-1 bg-gray-50/80 dark:bg-gray-800/80 border-gray-200/50 dark:border-gray-700/50 text-base py-3"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!currentMessage.trim() || isLoading}
            size="lg"
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 px-6"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 text-center">
          Powered by AI • {user ? `Hi ${profile?.full_name || user.email?.split('@')[0]}!` : 'Sign in for personalized help'}
        </p>
      </div>
    </motion.div>
  );
};

export default SmartChatbot;