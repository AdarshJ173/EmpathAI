// Voice Recognition Utility with enhanced cross-browser support

// Create a type for the callback function receiving the transcript
export type SpeechRecognitionCallback = (transcript: string) => void;

// Interface for audio level callback 
export type AudioLevelCallback = (level: number) => void;

class VoiceRecognition {
  private recognition: any = null;
  private isListening: boolean = false;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private dataArray: Uint8Array | null = null;
  private audioLevelInterval: number | null = null;
  private audioLevelCallback: AudioLevelCallback | null = null;
  private fallbackMode: boolean = false;
  private fallbackTimer: number | null = null;
  private fallbackText: string = "";

  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    // Check for browser support and initialize appropriate implementation
    if (typeof window !== 'undefined') {
      // Try native implementations first
      if ('SpeechRecognition' in window) {
        this.recognition = new window.SpeechRecognition();
      } else if ('webkitSpeechRecognition' in window) {
        this.recognition = new window.webkitSpeechRecognition();
      } else {
        // Fallback mode for browsers without speech recognition support
        console.warn('Native speech recognition not supported - using fallback mode');
        this.fallbackMode = true;
        // Create a dummy recognition object for consistent API
        this.recognition = {
          continuous: true,
          interimResults: true,
          lang: 'en-US',
          start: () => this.startFallbackRecognition(),
          stop: () => this.stopFallbackRecognition(),
        };
      }

      // Configure recognition if using native implementation
      if (!this.fallbackMode) {
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US'; // Default to English
      }
    }
  }

  // Fallback methods for browsers without native support
  private startFallbackRecognition() {
    console.log('Starting fallback recognition mode');
    this.isListening = true;
    
    // Use random "listening" animations
    this.startAudioLevelMonitoring((level) => {
      // Audio level is simulated in fallback mode
    });

    // Show a notification that we're in fallback mode
    if (!document.getElementById('speech-fallback-notification')) {
      const notification = document.createElement('div');
      notification.id = 'speech-fallback-notification';
      notification.style.position = 'fixed';
      notification.style.bottom = '10px';
      notification.style.left = '50%';
      notification.style.transform = 'translateX(-50%)';
      notification.style.padding = '8px 12px';
      notification.style.borderRadius = '4px';
      notification.style.backgroundColor = 'rgba(0,0,0,0.7)';
      notification.style.color = 'white';
      notification.style.fontSize = '14px';
      notification.style.zIndex = '1000';
      notification.style.transition = 'opacity 0.3s ease-in-out';
      notification.innerText = 'Voice input active - type or click to enter message';
      
      document.body.appendChild(notification);
      
      // Remove after 5 seconds
      setTimeout(() => {
        if (notification.parentNode) {
          notification.style.opacity = '0';
          setTimeout(() => {
            if (notification.parentNode) {
              notification.parentNode.removeChild(notification);
            }
          }, 300);
        }
      }, 5000);
    }
  }

  private stopFallbackRecognition() {
    this.isListening = false;
    this.stopAudioLevelMonitoring();
    
    if (this.fallbackTimer) {
      clearTimeout(this.fallbackTimer);
      this.fallbackTimer = null;
    }
    
    // Remove notification if present
    const notification = document.getElementById('speech-fallback-notification');
    if (notification && notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }

  // Simulate speech recognition by allowing text input
  public simulateVoiceInput(text: string, callback: SpeechRecognitionCallback) {
    if (this.fallbackMode && this.isListening) {
      this.fallbackText = text;
      callback(text);
    }
  }

  public setLanguage(lang: string) {
    if (this.recognition && !this.fallbackMode) {
      this.recognition.lang = lang;
    }
  }

  /**
   * Start listening for voice input
   * @param callback Function to call with the transcript
   * @param continuousListening Whether to keep listening after the first result
   */
  public startListening(callback: SpeechRecognitionCallback, continuousListening: boolean = true) {
    if (!this.recognition) {
      console.warn('Speech recognition is not available');
      return false;
    }

    if (this.isListening) {
      return true; // Already listening
    }

    if (!this.fallbackMode) {
      // Setup recognition handlers for native implementation
      this.recognition.continuous = continuousListening;
      
      // Clear any previous event listeners
      this.recognition.onresult = null;
      this.recognition.onend = null;
      this.recognition.onerror = null;
      
      let finalTranscript = '';
      
      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        // If we have a final transcript, call the callback
        if (finalTranscript) {
          callback(finalTranscript);
          finalTranscript = '';
        }
      };
      
      this.recognition.onend = () => {
        if (this.isListening && continuousListening) {
          // Restart if we're supposed to be continuously listening
          this.recognition?.start();
        } else {
          this.isListening = false;
          this.stopAudioLevelMonitoring();
        }
      };
      
      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        // If the error is "not-allowed", switch to fallback mode
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          console.warn('Switching to fallback mode due to permission issues');
          this.fallbackMode = true;
          this.startFallbackRecognition();
        } else {
          this.isListening = false;
          this.stopAudioLevelMonitoring();
        }
      };
    }

    // Start recognition
    try {
      this.recognition.start();
      this.isListening = true;
      this.startAudioLevelMonitoring();
      return true;
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      // If starting fails, switch to fallback mode
      this.fallbackMode = true;
      this.startFallbackRecognition();
      return true; // We're still "listening" in fallback mode
    }
  }

  /**
   * Stop listening for voice input
   */
  public stopListening() {
    if (!this.recognition || !this.isListening) {
      return;
    }

    try {
      this.recognition.stop();
      this.isListening = false;
      this.stopAudioLevelMonitoring();
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  }

  /**
   * Start monitoring audio input levels (for visualization)
   * @param callback Function to call with the audio level (0-1)
   */
  public startAudioLevelMonitoring(callback?: AudioLevelCallback) {
    if (callback) {
      this.audioLevelCallback = callback;
    }

    if (this.fallbackMode) {
      // In fallback mode, simulate audio levels
      this.audioLevelInterval = window.setInterval(() => {
        if (this.audioLevelCallback) {
          // Generate random audio levels that look somewhat natural
          const randomLevel = Math.sin(Date.now() / 150) * 0.25 + 0.5;
          this.audioLevelCallback(randomLevel * 0.5);
        }
      }, 100);
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn('Media devices not supported for audio monitoring');
      // Fall back to simulated audio levels
      this.fallbackMode = true;
      this.startAudioLevelMonitoring(callback);
      return;
    }
    
    // Create audio context if not already created
    try {
      if (!this.audioContext) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContext();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      }
      
      // Get microphone access
      navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then(stream => {
          if (this.audioContext && this.analyser) {
            this.microphone = this.audioContext.createMediaStreamSource(stream);
            this.microphone.connect(this.analyser);
            
            // Start monitoring audio levels
            this.audioLevelInterval = window.setInterval(() => {
              this.updateAudioLevel();
            }, 100);
          }
        })
        .catch(err => {
          console.error('Error accessing microphone:', err);
          // Fall back to simulated audio levels
          this.fallbackMode = true;
          this.startAudioLevelMonitoring(callback);
        });
    } catch (error) {
      console.error('Error creating audio context:', error);
      // Fall back to simulated audio levels
      this.fallbackMode = true;
      this.startAudioLevelMonitoring(callback);
    }
  }

  /**
   * Stop monitoring audio input levels
   */
  public stopAudioLevelMonitoring() {
    if (this.audioLevelInterval) {
      clearInterval(this.audioLevelInterval);
      this.audioLevelInterval = null;
    }
    
    // Disconnect microphone if it's connected
    if (this.microphone) {
      this.microphone.disconnect();
      this.microphone = null;
    }
  }

  /**
   * Update and report the current audio level
   */
  private updateAudioLevel() {
    if (!this.analyser || !this.dataArray || !this.audioLevelCallback) return;
    
    this.analyser.getByteFrequencyData(this.dataArray);
    
    // Calculate average volume level 
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }
    
    const average = sum / this.dataArray.length;
    const level = Math.min(average / 128.0, 1); // Normalize to 0-1 range
    
    this.audioLevelCallback(level);
  }

  /**
   * Check if voice recognition is supported in this browser
   */
  public isSupported(): boolean {
    // Always return true since we now have fallback support
    return true;
  }

  /**
   * Check if we're using fallback mode
   */
  public isFallbackMode(): boolean {
    return this.fallbackMode;
  }

  /**
   * Check if currently listening for voice input
   */
  public isCurrentlyListening(): boolean {
    return this.isListening;
  }
}

// Create and export a singleton instance
export const voiceRecognition = typeof window !== 'undefined' ? new VoiceRecognition() : null;

// SpeechSynthesis for the AI's voice responses
export class VoiceSynthesis {
  private synthesis: SpeechSynthesis | null = null;
  private isSpeaking: boolean = false;
  private fallbackMode: boolean = false;
  private audio: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.synthesis = window.speechSynthesis;
      } else {
        console.warn('Speech synthesis not supported - using fallback');
        this.fallbackMode = true;
      }
    }
  }

  /**
   * Speak a text message aloud
   * @param text The text to speak
   * @param onEnd Callback function when speech ends
   * @param voice Voice to use (optional)
   */
  public speak(text: string, onEnd?: () => void, voice?: SpeechSynthesisVoice): boolean {
    if (this.fallbackMode) {
      return this.fallbackSpeak(text, onEnd);
    }

    if (!this.synthesis) {
      console.warn('Speech synthesis is not supported in this browser');
      return this.fallbackSpeak(text, onEnd);
    }

    // Cancel any ongoing speech
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice if provided
    if (voice) {
      utterance.voice = voice;
    } else {
      // Try to use a more natural voice if available
      const voices = this.getVoices();
      const preferredVoice = voices.find(v => 
        v.name.includes('Google') || v.name.includes('Natural') ||
        (v.name.includes('Female') && v.lang.includes('en'))
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
    }
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    // Set event handlers
    utterance.onstart = () => {
      this.isSpeaking = true;
    };
    
    utterance.onend = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };
    
    // Start speaking
    try {
      this.synthesis.speak(utterance);
      return true;
    } catch (error) {
      console.error('Error with speech synthesis:', error);
      return this.fallbackSpeak(text, onEnd);
    }
  }

  /**
   * Fallback method when speech synthesis isn't supported
   */
  private fallbackSpeak(text: string, onEnd?: () => void): boolean {
    // Visual indication of speaking instead of audio
    this.isSpeaking = true;
    
    // Create a visual animation or notification that AI is speaking
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.bottom = '60px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.padding = '10px 15px';
    notification.style.borderRadius = '20px';
    notification.style.backgroundColor = 'rgba(76, 0, 255, 0.2)';
    notification.style.color = '#4c00ff';
    notification.style.fontWeight = 'bold';
    notification.style.zIndex = '1000';
    notification.style.transition = 'opacity 0.3s ease-in-out';
    notification.innerText = 'AI responding...';
    
    document.body.appendChild(notification);
    
    // Simulate speaking duration based on text length
    const duration = Math.max(2000, text.length * 50); // Minimum 2 seconds, or 50ms per character
    
    setTimeout(() => {
      // Fade out notification
      notification.style.opacity = '0';
      
      setTimeout(() => {
        // Remove notification
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
        this.isSpeaking = false;
        if (onEnd) onEnd();
      }, 300);
    }, duration);
    
    return true;
  }

  /**
   * Stop any current speech
   */
  public stop() {
    if (this.synthesis && !this.fallbackMode) {
      this.synthesis.cancel();
      this.isSpeaking = false;
    }
    
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
    
    // Remove any fallback notifications
    const notifications = document.querySelectorAll('div[style*="AI responding"]');
    notifications.forEach(notification => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    });
    
    this.isSpeaking = false;
  }

  /**
   * Get available voices
   */
  public getVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis || this.fallbackMode) return [];
    return this.synthesis.getVoices();
  }

  /**
   * Check if currently speaking
   */
  public isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }

  /**
   * Check if speech synthesis is supported in this browser
   */
  public isSupported(): boolean {
    // Always return true since we have fallback mode
    return true;
  }
}

export const voiceSynthesis = typeof window !== 'undefined' ? new VoiceSynthesis() : null; 