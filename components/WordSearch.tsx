import React, { useState, useRef, useEffect } from 'react';
import { Search, Volume2, Sparkles, MessageCircle, Send, Plus, Check } from 'lucide-react';
import { WordEntry, ChatMessage } from '../types';
import { lookupWordDefinition, generateWordImage, createChatSession } from '../services/geminiService';
import { Chat } from "@google/genai";

interface WordSearchProps {
  onSaveWord: (word: WordEntry) => void;
  savedWordIds: Set<string>;
}

const WordSearch: React.FC<WordSearchProps> = ({ onSaveWord, savedWordIds }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<WordEntry | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'card' | 'chat'>('card');
  
  // Chat state
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setResult(null);
    setMessages([]);
    setActiveTab('card');

    try {
      // 1. Get Definition
      const def = await lookupWordDefinition(query);
      const newEntry: WordEntry = {
        id: crypto.randomUUID(),
        ...def,
        createdAt: Date.now(),
        imageUrl: undefined // Loaded separately
      };
      setResult(newEntry);
      
      // Initialize Chat
      const chat = createChatSession(def.word);
      setChatSession(chat);
      setMessages([{ id: 'init', role: 'model', text: `Hi! Ask me anything about "${def.word}".` }]);

      // 2. Get Image (Parallel-ish)
      setIsLoading(false); // Show text result immediately
      setIsImageLoading(true);
      const imgData = await generateWordImage(def.word, def.definition);
      if (imgData) {
        setResult(prev => prev ? { ...prev, imageUrl: imgData } : null);
      }
      setIsImageLoading(false);

    } catch (error) {
      console.error(error);
      setIsLoading(false);
      setIsImageLoading(false);
      // Handle error gracefully in UI
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !chatSession) return;

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', text: chatInput };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const response = await chatSession.sendMessage({ message: userMsg.text });
      const modelMsg: ChatMessage = { id: crypto.randomUUID(), role: 'model', text: response.text || "I didn't catch that." };
      setMessages(prev => [...prev, modelMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeTab]);

  const isSaved = result && savedWordIds.has(result.word); // Simple check by word string for demo

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto relative bg-gray-50">
      
      {/* Search Bar - Fixed Top */}
      <div className="bg-white p-4 shadow-sm z-10 sticky top-0">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a word..."
            className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all text-lg"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </form>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-64 text-primary-400 space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="animate-pulse">Consulting the library...</p>
          </div>
        )}

        {/* Results */}
        {!isLoading && result && (
          <div className="p-4 space-y-6 animate-fade-in">
            
            {/* Tabs */}
            <div className="flex space-x-2 bg-gray-200 p-1 rounded-xl mb-4">
              <button
                onClick={() => setActiveTab('card')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'card' ? 'bg-white shadow-sm text-primary-700' : 'text-gray-500'}`}
              >
                Word Card
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'chat' ? 'bg-white shadow-sm text-primary-700' : 'text-gray-500'}`}
              >
                AI Chat
              </button>
            </div>

            {/* View: CARD */}
            {activeTab === 'card' && (
              <div className="bg-white rounded-3xl shadow-lg border border-primary-50 overflow-hidden relative">
                
                {/* Image Section */}
                <div className="h-64 bg-gray-100 relative w-full flex items-center justify-center overflow-hidden">
                   {result.imageUrl ? (
                     <img src={result.imageUrl} alt={result.word} className="w-full h-full object-cover animate-fade-in" />
                   ) : (
                     isImageLoading ? (
                       <div className="flex flex-col items-center text-gray-400">
                         <Sparkles className="animate-spin mb-2" />
                         <span className="text-xs">Generating art...</span>
                       </div>
                     ) : (
                       <span className="text-gray-300 text-4xl font-bold opacity-20">{result.word[0].toUpperCase()}</span>
                     )
                   )}
                   
                   {/* Save Button Floating */}
                   <button 
                     onClick={() => !isSaved && onSaveWord(result)}
                     disabled={!!isSaved}
                     className={`absolute top-4 right-4 p-3 rounded-full shadow-md transition-all ${isSaved ? 'bg-green-500 text-white' : 'bg-white text-gray-700 hover:bg-primary-50'}`}
                   >
                     {isSaved ? <Check size={20} /> : <Plus size={20} />}
                   </button>
                </div>

                {/* Text Content */}
                <div className="p-6">
                  <div className="flex items-baseline justify-between mb-2">
                    <h2 className="text-3xl font-bold text-gray-800">{result.word}</h2>
                    <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">{result.phonetic}</span>
                  </div>
                  
                  <div className="text-primary-600 font-medium mb-4 italic">{result.partOfSpeech}</div>
                  
                  <div className="mb-6">
                    <h3 className="text-xs uppercase tracking-wide text-gray-400 font-bold mb-1">Definition</h3>
                    <p className="text-gray-700 leading-relaxed text-lg">{result.definition}</p>
                  </div>

                  <div className="bg-primary-50 p-4 rounded-xl border border-primary-100">
                    <h3 className="text-xs uppercase tracking-wide text-primary-400 font-bold mb-1">Example</h3>
                    <p className="text-primary-800 italic">"{result.example}"</p>
                  </div>
                </div>
              </div>
            )}

            {/* View: CHAT */}
            {activeTab === 'chat' && (
              <div className="flex flex-col h-[60vh] bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-primary-600 text-white rounded-br-none' : 'bg-white border border-gray-100 shadow-sm text-gray-700 rounded-bl-none'}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 p-3 rounded-2xl rounded-bl-none">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div className="p-3 bg-white border-t border-gray-100">
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <input 
                      className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-300"
                      placeholder="Ask for more examples..."
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                    />
                    <button type="submit" className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors" disabled={isChatLoading}>
                      <Send size={16} />
                    </button>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Empty State */}
        {!isLoading && !result && (
          <div className="flex flex-col items-center justify-center h-full pt-20 text-center px-8 opacity-50">
            <Search size={48} className="mb-4 text-gray-300" />
            <p className="text-gray-400">Search for a word to start your vibrant learning journey.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WordSearch;
