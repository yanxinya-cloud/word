import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import WordSearch from './components/WordSearch';
import Notebook from './components/Notebook';
import Flashcards from './components/Flashcards';
import { AppTab, WordEntry } from './types';

function App() {
  const [currentTab, setCurrentTab] = useState<AppTab>(AppTab.SEARCH);
  
  // Persistent State Mock (using localStorage in a real app, just memory here effectively due to scope, but lets add basic LS)
  const [savedWords, setSavedWords] = useState<WordEntry[]>(() => {
    const saved = localStorage.getItem('lingoVivid_words');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('lingoVivid_words', JSON.stringify(savedWords));
  }, [savedWords]);

  const savedWordIds = new Set(savedWords.map(w => w.word));

  const handleSaveWord = (word: WordEntry) => {
    if (!savedWordIds.has(word.word)) {
      setSavedWords(prev => [word, ...prev]);
    }
  };

  const handleRemoveWord = (id: string) => {
    setSavedWords(prev => prev.filter(w => w.id !== id));
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-50 overflow-hidden font-sans text-slate-900">
      <main className="flex-1 w-full max-w-md mx-auto bg-white shadow-2xl relative overflow-hidden">
        {currentTab === AppTab.SEARCH && (
          <WordSearch onSaveWord={handleSaveWord} savedWordIds={savedWordIds} />
        )}
        {currentTab === AppTab.NOTEBOOK && (
          <Notebook savedWords={savedWords} onRemoveWord={handleRemoveWord} />
        )}
        {currentTab === AppTab.FLASHCARDS && (
          <Flashcards words={savedWords} />
        )}
      </main>
      
      <Navigation currentTab={currentTab} onTabChange={setCurrentTab} />
    </div>
  );
}

export default App;
