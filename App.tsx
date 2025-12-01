import React, { useState } from 'react';
import StoryForm from './components/StoryForm';
import StoryResult from './components/StoryResult';
import { StoryConfig, GeneratedStoryResult } from './types';
import { generateStory } from './services/geminiService';

const App: React.FC = () => {
  const [result, setResult] = useState<GeneratedStoryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStorySubmit = async (config: StoryConfig) => {
    setIsLoading(true);
    setError(null);
    try {
      const generatedResult = await generateStory(config);
      setResult(generatedResult);
    } catch (err: any) {
      console.error(err);
      setError("An error occurred while writing your story. Please check the API Key or try a different topic.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-purple-50 pb-12">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 no-print">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 text-white w-10 h-10 rounded-lg flex items-center justify-center shadow-lg">
               <i className="fa-solid fa-book-open"></i>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-700">
              StoryGen AI
            </h1>
          </div>
          <a href="https://ai.google.dev" target="_blank" rel="noreferrer" className="text-xs text-gray-500 hover:text-indigo-600 transition">
            Powered by Gemini
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Intro / Welcome */}
        {!result && !isLoading && (
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4">
              Unleash Your Imagination
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Create unique stories in seconds. From historical facts to ghostly tales, 
              StoryGen crafts personalized narratives just for you.
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3 text-red-700">
             <i className="fa-solid fa-circle-exclamation mt-1"></i>
             <p>{error}</p>
          </div>
        )}

        {/* Content Area */}
        <div className="transition-all duration-500">
          {!result ? (
            <StoryForm onSubmit={handleStorySubmit} isLoading={isLoading} />
          ) : (
            <StoryResult result={result} onReset={handleReset} />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
