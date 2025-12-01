import React, { useState } from 'react';
import { AVAILABLE_MODELS } from '../constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeys: string[];
  setApiKeys: (keys: string[]) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiKeys,
  setApiKeys,
  selectedModel,
  setSelectedModel,
}) => {
  const [newKey, setNewKey] = useState('');

  if (!isOpen) return null;

  const handleAddKey = () => {
    if (newKey.trim()) {
      setApiKeys([...apiKeys, newKey.trim()]);
      setNewKey('');
    }
  };

  const handleRemoveKey = (index: number) => {
    const newKeys = apiKeys.filter((_, i) => i !== index);
    setApiKeys(newKeys);
  };

  // Mask key for display
  const maskKey = (key: string) => {
    if (key.length <= 8) return '****';
    return `...${key.slice(-4)}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 flex justify-between items-center text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <i className="fa-solid fa-cog"></i> Settings
          </h2>
          <button onClick={onClose} className="text-gray-300 hover:text-white transition">
            <i className="fa-solid fa-times text-lg"></i>
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* API Keys Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Gemini API Keys</label>
            <p className="text-xs text-gray-500 mb-3">
              Add multiple keys to rotate and avoid rate limits. Keys are stored locally in your browser.
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline ml-1">
                Get API Key
              </a>
            </p>
            
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="Enter AI Studio API Key"
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              />
              <button
                onClick={handleAddKey}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
              >
                Add
              </button>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
              {apiKeys.length === 0 ? (
                <div className="p-4 text-center text-gray-400 text-sm">
                  No API keys added. Please add at least one key to generate stories.
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {apiKeys.map((key, index) => (
                    <li key={index} className="flex justify-between items-center p-3">
                      <span className="font-mono text-sm text-gray-600">Key {index + 1}: {maskKey(key)}</span>
                      <button
                        onClick={() => handleRemoveKey(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Model Selection Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">AI Model</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            >
              {AVAILABLE_MODELS.map((model) => (
                <option key={model.value} value={model.value}>
                  {model.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-2">
              Select the model used for text generation. Note: Historical stories may automatically upgrade to 'Pro' models for better reasoning.
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 text-right">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition font-medium shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
