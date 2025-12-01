import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { GeneratedStoryResult } from '../types';
import { generatePodcastAudio, generateVideoPrompts } from '../services/geminiService';
import { decodeBase64, decodeAudioData, audioBufferToWav } from '../services/audioUtils';

interface StoryResultProps {
  result: GeneratedStoryResult;
  onReset: () => void;
  apiKey: string;
  modelId: string;
}

const StoryResult: React.FC<StoryResultProps> = ({ result, onReset, apiKey, modelId }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [generatedAudioBuffer, setGeneratedAudioBuffer] = useState<AudioBuffer | null>(null);
  
  const [videoPrompts, setVideoPrompts] = useState<string | null>(null);
  const [isVideoPromptsLoading, setIsVideoPromptsLoading] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup audio on unmount
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const handleExportWord = () => {
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
      "xmlns:w='urn:schemas-microsoft-com:office:word' " +
      "xmlns='http://www.w3.org/TR/REC-html40'> " +
      "<head><meta charset='utf-8'><title>Export HTML to Word Document with JavaScript</title></head><body>";
    
    const footer = "</body></html>";
    const sourceHTML = header + `<h1>${result.title}</h1>` + 
      result.content.replace(/\n/g, '<br/>') + footer;
    
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `${result.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const handlePlayPodcast = async () => {
    if (!apiKey) {
      alert("Please add an API Key in settings to generate audio.");
      return;
    }

    if (isPlaying) {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current = null;
      }
      setIsPlaying(false);
      return;
    }

    // Initialize Audio Context if needed
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
            sampleRate: 24000 
        });
    }
    const ctx = audioContextRef.current;

    // Use cached buffer if available
    let audioBuffer = generatedAudioBuffer;

    if (!audioBuffer) {
      setIsAudioLoading(true);
      try {
        const base64Audio = await generatePodcastAudio(
          `${result.title}\n\n${result.content}`, 
          result.podcastDurationMinutes || 3,
          apiKey
        );
        const byteArray = decodeBase64(base64Audio);
        audioBuffer = await decodeAudioData(byteArray, ctx, 24000, 1);
        setGeneratedAudioBuffer(audioBuffer);
      } catch (error) {
        alert("Failed to generate audio. Please check your API Key and try again.");
        console.error(error);
        setIsAudioLoading(false);
        return;
      } finally {
        setIsAudioLoading(false);
      }
    }

    // Play
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer!;
    source.connect(ctx.destination);
    source.onended = () => setIsPlaying(false);
    source.start();
    
    sourceNodeRef.current = source;
    setIsPlaying(true);
  };

  const handleDownloadAudio = () => {
    if (!generatedAudioBuffer) return;
    
    const wavBlob = audioBufferToWav(generatedAudioBuffer);
    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_podcast.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleGeneratePrompts = async () => {
    if (!apiKey) {
      alert("Please add an API Key in settings to generate prompts.");
      return;
    }

    setIsVideoPromptsLoading(true);
    try {
      const prompts = await generateVideoPrompts(result.content, apiKey, modelId);
      setVideoPrompts(prompts);
    } catch (error) {
      console.error(error);
      alert("Failed to generate video prompts. Please check your API Key.");
    } finally {
      setIsVideoPromptsLoading(false);
    }
  };

  const handleDownloadPrompts = () => {
    if (!videoPrompts) return;
    const blob = new Blob([videoPrompts], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_prompts.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fade-in space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 no-print">
        <button
          onClick={onReset}
          className="text-gray-600 hover:text-indigo-600 font-medium flex items-center gap-2 transition"
        >
          <i className="fa-solid fa-arrow-left"></i> New Story
        </button>

        <div className="flex flex-wrap gap-2">
          {generatedAudioBuffer && (
             <button
             onClick={handleDownloadAudio}
             className="px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-semibold hover:bg-green-100 flex items-center gap-2 transition"
             title="Download Podcast Audio (.wav)"
           >
             <i className="fa-solid fa-download"></i> Audio
           </button>
          )}

           <button
            onClick={handlePlayPodcast}
            disabled={isAudioLoading}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition ${
              isPlaying 
                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
            }`}
          >
            {isAudioLoading ? (
               <><i className="fa-solid fa-circle-notch fa-spin"></i> Generating...</>
            ) : isPlaying ? (
               <><i className="fa-solid fa-stop"></i> Stop</>
            ) : (
               <><i className="fa-solid fa-headphones"></i> Listen (Podcast)</>
            )}
          </button>
          
          <button
            onClick={handleExportWord}
            className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-100 flex items-center gap-2 transition"
          >
            <i className="fa-solid fa-file-word"></i> .DOC
          </button>
          
          <button
            onClick={handlePrintPDF}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 flex items-center gap-2 transition"
          >
            <i className="fa-solid fa-print"></i> PDF
          </button>
        </div>
      </div>

      <div id="story-content-print" className="bg-white p-8 md:p-12 rounded-xl shadow-lg border border-gray-100 min-h-[60vh]">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 font-serif border-b pb-4 text-center">
          {result.title}
        </h1>
        
        <div className="prose prose-lg prose-indigo max-w-none story-font text-gray-800 leading-relaxed text-justify">
          <ReactMarkdown>{result.content}</ReactMarkdown>
        </div>

        {/* Sources Section for History Genre */}
        {result.groundingSources && result.groundingSources.length > 0 && (
          <div className="mt-12 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
              <i className="fa-solid fa-check-double mr-2"></i>
              Verified Sources & References
            </h3>
            <ul className="space-y-2">
              {result.groundingSources.map((source, index) => (
                <li key={index} className="text-sm">
                   <a 
                     href={source.uri} 
                     target="_blank" 
                     rel="noreferrer"
                     className="flex items-center gap-2 text-indigo-600 hover:underline bg-indigo-50 p-2 rounded-md transition"
                   >
                     <i className="fa-solid fa-external-link-alt text-xs"></i>
                     {source.title || source.uri}
                   </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-gray-100 text-center text-gray-400 text-sm italic no-print">
          Generated by StoryGen AI with Gemini
        </div>
      </div>

      {/* Video Prompts Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 rounded-xl shadow-lg text-white no-print">
         <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                <i className="fa-solid fa-video"></i> AI Video Prompts
              </h3>
              <p className="text-gray-400 text-sm mt-1">Generate prompts for AI Video creators (Runway, Pika, Sora, etc.)</p>
            </div>
            <div className="flex gap-2">
               {!videoPrompts ? (
                  <button 
                    onClick={handleGeneratePrompts}
                    disabled={isVideoPromptsLoading}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {isVideoPromptsLoading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                    Generate Prompts
                  </button>
               ) : (
                 <div className="flex gap-2">
                    <button 
                      onClick={handleGeneratePrompts}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-sm transition"
                    >
                      <i className="fa-solid fa-rotate-right"></i> Regenerate
                    </button>
                    <button 
                      onClick={handleDownloadPrompts}
                      className="px-4 py-2 bg-white text-gray-900 hover:bg-gray-100 rounded-lg text-sm font-bold transition flex items-center gap-2"
                    >
                      <i className="fa-solid fa-file-arrow-down"></i> Download .txt
                    </button>
                 </div>
               )}
            </div>
         </div>

         {videoPrompts && (
           <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 max-h-64 overflow-y-auto font-mono text-sm text-green-400">
              <pre className="whitespace-pre-wrap">{videoPrompts}</pre>
           </div>
         )}
      </div>
    </div>
  );
};

export default StoryResult;
