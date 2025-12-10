export interface WordEntry {
  id: string;
  word: string;
  phonetic?: string;
  partOfSpeech?: string;
  definition: string;
  example: string;
  translation?: string; // Target language translation if needed
  imageUrl?: string;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export enum AppTab {
  SEARCH = 'search',
  NOTEBOOK = 'notebook',
  FLASHCARDS = 'flashcards',
}

export interface StoryState {
  isLoading: boolean;
  content: string | null;
  error: string | null;
}
