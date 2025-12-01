import React, { useState, useEffect, useRef } from 'react';
import StoryForm from './components/StoryForm';
import StoryResult from './components/StoryResult';
import SettingsModal from './components/SettingsModal';
import { StoryConfig, GeneratedStoryResult } from './types';
import { generateStory } from './services/geminiService';
import { AVAILABLE_MODELS } from './constants';

const App: React.FC = () => {
  const [result, setResult] = useState<GeneratedStoryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKeys, setApiKeys] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>(AVAILABLE_MODELS[0].value);
  
  // Key Rotation State
  const keyIndexRef = useRef(0);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedKeys = localStorage.getItem('sg_api_keys');
    const savedModel = localStorage.getItem('sg_model');
    
    if (savedKeys) {
      try {
        setApiKeys(JSON.parse(savedKeys));
      } catch (e) {
        console.error("Failed to parse saved keys");
      }
    }
    
    if (savedModel) {
      setSelectedModel(savedModel);
    }
  }, []);

  // Save settings when changed
  useEffect(() => {
    localStorage.setItem('sg_api_keys', JSON.stringify(apiKeys));
  }, [apiKeys]);

  useEffect(() => {
    localStorage.setItem('sg_model', selectedModel);
  }, [selectedModel]);

  // Round-robin key selection
  const getNextApiKey = (): string | null => {
    if (apiKeys.length === 0) return null;
    const key = apiKeys[keyIndexRef.current % apiKeys.length];
    keyIndexRef.current += 1; // Move to next key for next time
    return key;
  };

  // Get current key without rotating (for subsequent calls in same session)
  const getCurrentKey = (): string | null => {
    if (apiKeys.length === 0) return null;
    // Return the previous key (the one used for the story) or the first one
    const index = (keyIndexRef.current === 0 ? 0 : keyIndexRef.current - 1) % apiKeys.length;
    return apiKeys[index];
  };

  const handleStorySubmit = async (config: StoryConfig) => {
    const apiKey = getNextApiKey();
    
    if (!apiKey) {
      setError("Please add at least one Gemini API Key in Settings.");
      setIsSettingsOpen(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const generatedResult = await generateStory(config, apiKey, selectedModel);
      setResult(generatedResult);
    } catch (err: any) {
      console.error(err);
      setError("An error occurred. If this persists, try adding more API keys to rotate usage.");
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
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKeys={apiKeys}
        setApiKeys={setApiKeys}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
      />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40 no-print">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 text-white w-10 h-10 rounded-lg flex items-center justify-center shadow-lg">
               <i className="fa-solid fa-book-open"></i>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-700">
              StoryGen AI
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <button 
               onClick={() => setIsSettingsOpen(true)}
               className="text-gray-600 hover:text-indigo-600 transition flex items-center gap-2 font-medium"
             >
               <i className="fa-solid fa-gear"></i>
               <span className="hidden sm:inline">Settings</span>
             </button>
          </div>
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
              Create unique stories in seconds. Add your Gemini API Key in settings to get started. 
              We support rotating keys to help you generate more content without hitting limits.
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
            <StoryResult 
              result={result} 
              onReset={handleReset} 
              apiKey={getCurrentKey() || ''}
              modelId={selectedModel}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
