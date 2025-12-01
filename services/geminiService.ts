import { GoogleGenAI, Modality } from "@google/genai";
import { StoryConfig, Genre, GeneratedStoryResult, GroundingSource } from "../types";

const createAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateStory = async (config: StoryConfig): Promise<GeneratedStoryResult> => {
  const ai = createAI();
  
  // Choose model based on complexity. History requires search grounding and high accuracy.
  const isHistory = config.genre === Genre.HISTORY;
  const modelName = isHistory ? 'gemini-3-pro-preview' : 'gemini-2.5-flash';

  const languageStr = config.languages.join(', ');
  
  let systemInstruction = `You are an expert story writer. 
  Write a story based on the user's prompt.
  - Genre: ${config.genre}
  - Perspective: ${config.perspective}
  - Target Length: Approximately ${config.characterCount} characters.
  - Languages: Write primarily in ${languageStr}. If multiple languages are selected, create a bilingual or mixed-language story if appropriate for the context, or provide versions.
  
  Output Format:
  The output should be a story with a Title and the Body content.
  Do not include markdown code blocks (like \`\`\`) wrapping the whole response.
  Just give the Title formatted as a Markdown Header 1 (# Title), followed by the story.
  `;

  if (isHistory) {
    systemInstruction += `
    CRITICAL FOR HISTORY GENRE:
    - You MUST use the Google Search tool to verify historical facts, dates, and figures.
    - Synthesize information from reputable sources.
    - Aim for high historical accuracy while maintaining engaging storytelling.
    `;
  }

  const tools = isHistory ? [{ googleSearch: {} }] : undefined;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: config.prompt,
      config: {
        systemInstruction: systemInstruction,
        tools: tools,
        thinkingConfig: isHistory ? { thinkingBudget: 2048 } : undefined, // Add some thinking for history
      },
    });

    const text = response.text || "No content generated.";
    
    // Parse grounding chunks if available
    const groundingSources: GroundingSource[] = [];
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      response.candidates[0].groundingMetadata.groundingChunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          groundingSources.push({
            title: chunk.web.title,
            uri: chunk.web.uri,
          });
        }
      });
    }

    // Simple extraction of Title (assuming # Title format)
    const lines = text.split('\n');
    let title = "Untitled Story";
    let content = text;

    if (lines[0].startsWith('# ')) {
      title = lines[0].replace('# ', '').trim();
      content = lines.slice(1).join('\n').trim();
    } else if (lines[0].startsWith('## ')) {
        title = lines[0].replace('## ', '').trim();
        content = lines.slice(1).join('\n').trim();
    }

    return { 
      title, 
      content, 
      groundingSources,
      podcastDurationMinutes: config.podcastDurationMinutes 
    };

  } catch (error) {
    console.error("Story Generation Error:", error);
    throw error;
  }
};

/**
 * Generates a dual-speaker podcast audio.
 * First, it rewrites the story into a script format.
 * Then, it sends the script to the TTS model.
 */
export const generatePodcastAudio = async (storyText: string, durationMinutes: number): Promise<string> => {
  const ai = createAI();
  
  // Estimate word count: avg speaking rate ~140 words/min
  const targetWordCount = Math.max(100, durationMinutes * 140);

  // Step 1: Rewrite as script for 2 speakers
  const scriptPrompt = `
  Convert the following story into a Podcast Script for two hosts: a Male host (named Tú) and a Female host (named Quyên).
  
  TARGET DURATION: ${durationMinutes} minutes (approx. ${targetWordCount} words).
  - If the story is short but the target duration is long, expand on the themes, add banter between hosts, and discuss the implications of the story deeply.
  - If the story is long but the target duration is short, summarize the key points and keep the conversation fast-paced.
  
  CRITICAL LANGUAGE INSTRUCTION:
  The script MUST be written in the SAME LANGUAGE as the story content. 
  If the story is in Vietnamese, the dialogue must be in Vietnamese. 
  If the story is in English, the dialogue must be in English.
  
  Format exactly like this for every line:
  Tú: [Text in story language]
  Quyên: [Text in story language]
  
  Story:
  ${storyText.substring(0, 15000)} 
  `; 

  const scriptResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: scriptPrompt,
  });

  const script = scriptResponse.text || storyText;

  // Step 2: Generate Audio using the script
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text: script }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          multiSpeakerVoiceConfig: {
            speakerVoiceConfigs: [
              {
                speaker: 'Tú',
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } }
              },
              {
                speaker: 'Quyên',
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
              }
            ]
          }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data returned");
    
    return base64Audio;
  } catch (error) {
    console.error("Audio Generation Error:", error);
    throw error;
  }
};

/**
 * Generates video prompts based on the story.
 */
export const generateVideoPrompts = async (storyText: string): Promise<string> => {
  const ai = createAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `
      Analyze the following story and create a list of detailed, cinematic image generation prompts that could be used to create a video slideshow or storyboard for this story.
      
      Requirements:
      1. Create a chronological list of 5-10 distinct prompts representing key scenes.
      2. Each prompt MUST be on a single line.
      3. DO NOT include numbering (1., 2.) or bullets (-). Just the raw prompt text on each line.
      4. The prompts should be descriptive (lighting, style, camera angle, mood) suitable for an AI video/image generator.
      5. The prompts should be in English (usually better for image gen models) unless the story specifically requires local context better described in the native language, but English is preferred for compatibility with most image generators.
      
      Story:
      ${storyText.substring(0, 10000)}
    `
  });
  return response.text || "";
};