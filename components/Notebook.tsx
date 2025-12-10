import React, { useState } from 'react';
import { WordEntry } from '../types';
import { BookOpen, Sparkles, X, ChevronRight } from 'lucide-react';
import { generateStoryFromWords } from '../services/geminiService';
import ReactMarkdown from 'react-markdown'; // Actually, I don't have react-markdown installed in this environment. I'll use simple rendering.

interface NotebookProps {
  savedWords: WordEntry[];
  onRemoveWord: (id: string) => void;
}

const Notebook: React.FC<NotebookProps> = ({ savedWords, onRemoveWord }) => {
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [story, setStory] = useState<string | null>(null);
  const [showStoryModal, setShowStoryModal] = useState(false);

  const handleGenerateStory = async () => {
    if (savedWords.length === 0) return;
    setIsGeneratingStory(true);
    setShowStoryModal(true);
    setStory(null);
    
    // Pick up to 8 random words if there are many, to keep story concise
    const wordsToUse = savedWords
        .map(w => w.word)
        .sort(() => 0.5 - Math.random())
        .slice(0, 8);

    try {
      const generatedStory = await generateStoryFromWords(wordsToUse);
      setStory(generatedStory);
    } catch (e) {
      setStory("Sorry, I couldn't write a story right now.");
    } finally {
      setIsGeneratingStory(false);
    }
  };

  // Simple Markdown bold parser for the story
  const renderStory = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <span key={i} className="font-bold text-primary-700 bg-primary-100 px-1 rounded">{part.slice(2, -2)}</span>;
      }
      return part;
    });
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="p-6 bg-white shadow-sm z-10 sticky top-0 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Notebook</h1>
          <p className="text-sm text-gray-500">{savedWords.length} words collected</p>
        </div>
        <button 
          onClick={handleGenerateStory}
          disabled={savedWords.length < 2}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            savedWords.length < 2 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-md hover:shadow-lg'
          }`}
        >
          <Sparkles size={16} />
          <span>Story Magic</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-3">
        {savedWords.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <BookOpen size={48} className="mb-4 opacity-30" />
            <p>Your notebook is empty.</p>
            <p className="text-xs">Start searching to add words!</p>
          </div>
        ) : (
          savedWords.map((word) => (
            <div key={word.id} className="group bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center space-x-4 transition-all hover:shadow-md">
              <div className="h-12 w-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                {word.imageUrl ? (
                  <img src={word.imageUrl} alt={word.word} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-300 font-bold">{word.word[0]}</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 truncate">{word.word}</h3>
                <p className="text-xs text-gray-500 truncate">{word.definition}</p>
              </div>
              <button 
                onClick={() => onRemoveWord(word.id)}
                className="text-gray-300 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={18} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Story Modal */}
      {showStoryModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-slide-up sm:animate-fade-in flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-primary-50">
              <h2 className="font-bold text-primary-800 flex items-center gap-2">
                <Sparkles size={18} className="text-accent-500" />
                Generated Story
              </h2>
              <button onClick={() => setShowStoryModal(false)} className="p-2 bg-white rounded-full hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {isGeneratingStory ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <p className="text-center text-sm text-gray-400 mt-8">Weaving your words together...</p>
                </div>
              ) : (
                <p className="text-lg leading-loose text-gray-700 font-medium">
                  {story ? renderStory(story) : "Something went wrong."}
                </p>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-50 bg-gray-50 text-center">
              <button onClick={() => setShowStoryModal(false)} className="text-primary-600 font-bold text-sm">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notebook;
