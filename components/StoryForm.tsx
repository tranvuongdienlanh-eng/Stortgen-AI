import React, { useState } from 'react';
import { StoryConfig, Genre, Perspective } from '../types';
import { GENRES, PERSPECTIVES, LANGUAGES } from '../constants';

interface StoryFormProps {
  onSubmit: (config: StoryConfig) => void;
  isLoading: boolean;
}

const StoryForm: React.FC<StoryFormProps> = ({ onSubmit, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const [languages, setLanguages] = useState<string[]>(['Vietnamese']);
  const [genre, setGenre] = useState<Genre>(Genre.ROMANCE);
  const [perspective, setPerspective] = useState<Perspective>(Perspective.FIRST_PERSON);
  
  // Default numbers
  const [characterCount, setCharacterCount] = useState<number>(2000);
  const [podcastDurationMinutes, setPodcastDurationMinutes] = useState<number>(3);

  const handleLanguageChange = (langValue: string) => {
    setLanguages((prev) => {
      if (prev.includes(langValue)) {
        // Prevent removing the last language
        if (prev.length === 1) return prev;
        return prev.filter((l) => l !== langValue);
      } else {
        return [...prev, langValue];
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ 
      prompt, 
      languages, 
      genre, 
      perspective, 
      characterCount,
      podcastDurationMinutes
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 md:p-8 space-y-6">
      
      {/* Prompt Input */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Cốt truyện chính (Main Plot)
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter the main ideas, characters, or setting of your story..."
          className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition h-32 resize-none bg-gray-50"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Genre Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Thể loại (Genre)</label>
          <div className="grid grid-cols-2 gap-2">
            {GENRES.map((g) => (
              <button
                key={g.value}
                type="button"
                onClick={() => setGenre(g.value)}
                className={`p-2 text-xs sm:text-sm rounded-lg border flex items-center justify-center gap-2 transition-all ${
                  genre === g.value
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <i className={`fa-solid ${g.icon}`}></i>
                <span className="truncate">{g.label.split('(')[0].trim()}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Perspective & Length Options */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Ngôi kể (Perspective)</label>
            <select
              value={perspective}
              onChange={(e) => setPerspective(e.target.value as Perspective)}
              className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-gray-50"
            >
              {PERSPECTIVES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          {/* Numeric Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Số lượng kí tự (Chars)</label>
              <input
                type="number"
                min="500"
                max="20000"
                step="100"
                value={characterCount}
                onChange={(e) => setCharacterCount(Number(e.target.value))}
                className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Podcast (Phút)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={podcastDurationMinutes}
                onChange={(e) => setPodcastDurationMinutes(Number(e.target.value))}
                className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-gray-50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Languages */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Ngôn ngữ (Languages)</label>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.value}
              type="button"
              onClick={() => handleLanguageChange(lang.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                languages.includes(lang.value)
                  ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-200'
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transform transition hover:scale-[1.01] ${
          isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <i className="fa-solid fa-circle-notch fa-spin"></i> Writing your story...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <i className="fa-solid fa-pen-fancy"></i> Start Writing
          </span>
        )}
      </button>
    </form>
  );
};

export default StoryForm;