// NARI Labs Dia Text-to-Speech Service
// High-quality neural TTS using the Dia model

export interface DiaTTSOptions {
  maxTokens?: number;
  cfgScale?: number;
  temperature?: number;
  topP?: number;
  cfgFilterTopK?: number;
  useVoiceCloning?: boolean;
  audioPrompt?: string; // Path to audio prompt for voice cloning
}

class NariDiaTTSService {
  private isInitialized: boolean = false;
  private isGenerating: boolean = false;
  private audioQueue: Array<{ text: string; options?: DiaTTSOptions; onEnd?: () => void }> = [];
  private isProcessingQueue: boolean = false;
  private currentAudio: HTMLAudioElement | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    if (typeof window === 'undefined') return;
    
    console.log('Initializing NARI Labs Dia TTS Service...');
    this.isInitialized = true;
    console.log('NARI Labs Dia TTS Service initialized');
  }

  /**
   * Convert text to speech using NARI Labs Dia model
   */
  public async speak(text: string, options: DiaTTSOptions = {}, onEnd?: () => void): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Add to queue if currently generating
    if (this.isGenerating) {
      this.audioQueue.push({ text, options, onEnd });
      return true;
    }

    return this.speakImmediate(text, options, onEnd);
  }

  /**
   * Priority speech - stops current generation and speaks immediately
   */
  public async speakPriority(text: string, options: DiaTTSOptions = {}, onEnd?: () => void): Promise<boolean> {
    // Stop current generation and clear queue
    this.stop();
    this.audioQueue = [];
    
    return this.speakImmediate(text, options, onEnd);
  }

  private async speakImmediate(text: string, options: DiaTTSOptions = {}, onEnd?: () => void): Promise<boolean> {
    this.isGenerating = true;

    try {
      console.log(`Generating speech with NARI Labs Dia: "${text.substring(0, 50)}..."`);

      // Format text for Dia model (add speaker tags if not present)
      const formattedText = this.formatTextForDia(text);

      // Prepare generation parameters
      const generationParams = {
        text: formattedText,
        max_tokens: options.maxTokens || 3072,
        cfg_scale: options.cfgScale || 3.0,
        temperature: options.temperature || 1.8,
        top_p: options.topP || 0.90,
        cfg_filter_top_k: options.cfgFilterTopK || 45,
        use_torch_compile: false,
        verbose: false,
        audio_prompt: options.audioPrompt || null
      };

      // Call the Dia TTS API
      const response = await fetch('/api/tts/dia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(generationParams)
      });

      if (!response.ok) {
        throw new Error(`TTS API error: ${response.status} ${response.statusText}`);
      }

      // Get the audio blob
      const audioBlob = await response.blob();
      
      if (audioBlob.size === 0) {
        throw new Error('Generated audio is empty');
      }

      // Create audio URL and play
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      this.currentAudio = audio;

      return new Promise((resolve) => {
        audio.onloadeddata = () => {
          console.log('Dia TTS audio loaded, starting playback');
        };

        audio.onplay = () => {
          console.log('Dia TTS audio playback started');
        };

        audio.onended = () => {
          console.log('Dia TTS audio playback finished');
          this.isGenerating = false;
          this.currentAudio = null;
          URL.revokeObjectURL(audioUrl); // Clean up
          
          if (onEnd) onEnd();
          this.processQueue();
          resolve(true);
        };

        audio.onerror = (error) => {
          console.error('Dia TTS audio playback error:', error);
          this.isGenerating = false;
          this.currentAudio = null;
          URL.revokeObjectURL(audioUrl); // Clean up
          
          if (onEnd) onEnd();
          resolve(false);
        };

        // Start playback
        audio.play().catch(error => {
          console.error('Failed to play Dia TTS audio:', error);
          this.isGenerating = false;
          this.currentAudio = null;
          URL.revokeObjectURL(audioUrl);
          
          if (onEnd) onEnd();
          resolve(false);
        });
      });

    } catch (error) {
      console.error('Error in Dia TTS generation:', error);
      this.isGenerating = false;
      if (onEnd) onEnd();
      return false;
    }
  }

  /**
   * Format text for Dia model - add speaker tags if not present
   */
  private formatTextForDia(text: string): string {
    // Check if text already has speaker tags
    if (text.includes('[S1]') || text.includes('[S2]')) {
      return text;
    }

    // Add speaker tag for single speaker
    return `[S1] ${text}`;
  }

  private async processQueue() {
    if (this.isProcessingQueue || this.audioQueue.length === 0 || this.isGenerating) {
      return;
    }

    this.isProcessingQueue = true;
    const next = this.audioQueue.shift();
    
    if (next) {
      setTimeout(async () => {
        this.isProcessingQueue = false;
        await this.speakImmediate(next.text, next.options, next.onEnd);
      }, 500); // Small delay between queue items
    } else {
      this.isProcessingQueue = false;
    }
  }

  public stop() {
    // Stop current audio playback
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }

    this.isGenerating = false;
  }

  public isCurrentlySpeaking(): boolean {
    return this.isGenerating;
  }

  public clearQueue() {
    this.audioQueue = [];
  }

  public getQueueLength(): number {
    return this.audioQueue.length;
  }

  /**
   * Test the TTS service with a sample phrase
   */
  public async test(): Promise<boolean> {
    return this.speak("Hello, this is a test of the NARI Labs Dia text to speech system.");
  }
}

// Export singleton instance
export const nariDiaTTS = typeof window !== 'undefined' ? new NariDiaTTSService() : null;
export default NariDiaTTSService;
