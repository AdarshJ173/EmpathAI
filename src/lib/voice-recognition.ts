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
  private notificationShown: boolean = false;
  private currentTranscript: string = "";
  private pauseTimer: number | null = null;
  private pauseThreshold: number = 2000; // 2 seconds
  private onTranscriptUpdate: ((transcript: string) => void) | null = null;
  private onAutoSubmit: ((finalTranscript: string) => void) | null = null;
  private isTranscribing: boolean = false;

  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    // Check for browser support and initialize appropriate implementation
    if (typeof window !== 'undefined') {
      // Try native implementations first
      const win = window as any; // Temporarily cast window to any to access webkitSpeechRecognition

      if ('SpeechRecognition' in win) {
        this.recognition = new win.SpeechRecognition();
      } else if ('webkitSpeechRecognition' in win) {
        this.recognition = new win.webkitSpeechRecognition();
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

    // Show notification only once per session and only for first-time users
    if (!this.notificationShown && !document.getElementById('speech-fallback-notification')) {
      this.notificationShown = true;
      
      const notification = document.createElement('div');
      notification.id = 'speech-fallback-notification';
      notification.style.position = 'fixed';
      notification.style.bottom = '20px';
      notification.style.right = '20px';
      notification.style.padding = '12px 16px';
      notification.style.borderRadius = '8px';
      notification.style.backgroundColor = 'rgba(59, 130, 246, 0.9)';
      notification.style.color = 'white';
      notification.style.fontSize = '13px';
      notification.style.fontWeight = '500';
      notification.style.zIndex = '1000';
      notification.style.transition = 'all 0.3s ease-in-out';
      notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
      notification.style.cursor = 'pointer';
      notification.style.maxWidth = '280px';
      notification.innerText = 'Speech mode enabled - type your message when ready';
      
      // Add close button
      const closeBtn = document.createElement('span');
      closeBtn.innerHTML = '&times;';
      closeBtn.style.marginLeft = '8px';
      closeBtn.style.fontSize = '16px';
      closeBtn.style.fontWeight = 'bold';
      closeBtn.style.cursor = 'pointer';
      closeBtn.style.opacity = '0.8';
      notification.appendChild(closeBtn);
      
      document.body.appendChild(notification);
      
      // Auto-dismiss after 3 seconds or on click
      const dismissNotification = () => {
        if (notification.parentNode) {
          notification.style.opacity = '0';
          notification.style.transform = 'translateY(10px)';
          setTimeout(() => {
            if (notification.parentNode) {
              notification.parentNode.removeChild(notification);
            }
          }, 300);
        }
      };
      
      notification.addEventListener('click', dismissNotification);
      closeBtn.addEventListener('click', dismissNotification);
      
      setTimeout(dismissNotification, 3000);
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
   * Start listening with real-time transcription and auto-submission
   * @param onTranscriptUpdate Function to call with live transcript updates
   * @param onAutoSubmit Function to call when natural pause is detected
   * @param pauseThreshold Milliseconds to wait before auto-submitting (default: 2000)
   */
  public startRealTimeListening(
    onTranscriptUpdate: (transcript: string) => void,
    onAutoSubmit: (finalTranscript: string) => void,
    pauseThreshold: number = 2000
  ): boolean {
    this.onTranscriptUpdate = onTranscriptUpdate;
    this.onAutoSubmit = onAutoSubmit;
    this.pauseThreshold = pauseThreshold;
    this.currentTranscript = "";
    this.isTranscribing = true;

    if (!this.recognition) {
      console.warn('Speech recognition is not available');
      return false;
    }

    if (this.isListening) {
      return true; // Already listening
    }

    if (this.fallbackMode) {
      // In fallback mode, start listening but require manual input
      this.isListening = true;
      this.startAudioLevelMonitoring();
      return true;
    }

    // Setup recognition for real-time transcription
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    
    // Clear any previous event listeners
    this.recognition.onresult = null;
    this.recognition.onend = null;
    this.recognition.onerror = null;
    
    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
          this.currentTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Update the live transcript display
      const fullTranscript = this.currentTranscript + interimTranscript;
      this.onTranscriptUpdate?.(fullTranscript);
      
      // If we have a final transcript, reset the pause timer
      if (finalTranscript.trim()) {
        this.resetPauseTimer();
      }
    };
    
    this.recognition.onend = () => {
      if (this.isListening && this.isTranscribing) {
        // Restart if we're supposed to be continuously listening
        try {
          this.recognition?.start();
        } catch (error) {
          console.warn('Error restarting recognition:', error);
          this.handleAutoSubmit();
        }
      } else {
        this.isListening = false;
        this.stopAudioLevelMonitoring();
      }
    };
    
    this.recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      
      switch (event.error) {
        case 'not-allowed':
        case 'service-not-allowed':
          console.warn('Switching to fallback mode due to permission issues');
          this.fallbackMode = true;
          this.startFallbackRecognition();
          break;
          
        case 'network':
        case 'audio-capture':
          console.warn('Audio error - switching to fallback mode');
          this.fallbackMode = true;
          this.startFallbackRecognition();
          break;
          
        case 'no-speech':
          // This is not really an error, just no speech detected
          console.log('No speech detected, continuing to listen');
          this.resetPauseTimer();
          break;
          
        case 'aborted':
          // Recognition was aborted (usually intentional)
          this.handleAutoSubmit();
          break;
          
        default:
          console.warn(`Unhandled speech recognition error: ${event.error}`);
          this.handleAutoSubmit();
          break;
      }
    };

    // Start recognition
    try {
      this.recognition.start();
      this.isListening = true;
      this.startAudioLevelMonitoring();
      this.resetPauseTimer();
      return true;
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      this.fallbackMode = true;
      this.startFallbackRecognition();
      return true;
    }
  }

  /**
   * Reset the pause timer for auto-submission
   */
  private resetPauseTimer() {
    if (this.pauseTimer) {
      clearTimeout(this.pauseTimer);
    }
    
    this.pauseTimer = window.setTimeout(() => {
      this.handleAutoSubmit();
    }, this.pauseThreshold);
  }

  /**
   * Handle auto-submission when pause is detected
   */
  private handleAutoSubmit() {
    if (this.currentTranscript.trim() && this.onAutoSubmit) {
      const finalText = this.currentTranscript.trim();
      this.currentTranscript = "";
      this.onAutoSubmit(finalText);
    }
    
    // Clear the pause timer
    if (this.pauseTimer) {
      clearTimeout(this.pauseTimer);
      this.pauseTimer = null;
    }
  }

  /**
   * Stop real-time listening and clear transcription
   */
  public stopRealTimeListening() {
    this.isTranscribing = false;
    this.handleAutoSubmit(); // Submit any pending transcript
    this.stopListening();
    
    // Clear callbacks
    this.onTranscriptUpdate = null;
    this.onAutoSubmit = null;
    
    // Clear timers
    if (this.pauseTimer) {
      clearTimeout(this.pauseTimer);
      this.pauseTimer = null;
    }
  }

  /**
   * Simulate voice input for fallback mode
   */
  public simulateRealTimeInput(text: string) {
    if (this.fallbackMode && this.isListening && this.onTranscriptUpdate) {
      this.currentTranscript = text;
      this.onTranscriptUpdate(text);
      
      // Auto-submit after a short delay in fallback mode
      if (this.pauseTimer) {
        clearTimeout(this.pauseTimer);
      }
      
      this.pauseTimer = window.setTimeout(() => {
        this.handleAutoSubmit();
      }, 500); // Shorter delay for manual input
    }
  }

  /**
   * Start listening for voice input (legacy method)
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
        console.warn('Speech recognition error:', event.error);
        
        // Handle different types of errors appropriately
        switch (event.error) {
          case 'not-allowed':
          case 'service-not-allowed':
            console.warn('Switching to fallback mode due to permission issues');
            this.fallbackMode = true;
            this.startFallbackRecognition();
            break;
            
          case 'network':
            console.warn('Network error in speech recognition - retrying or switching to fallback');
            // For network errors, try to switch to fallback mode gracefully
            this.fallbackMode = true;
            this.startFallbackRecognition();
            break;
            
          case 'audio-capture':
            console.warn('Audio capture error - switching to fallback mode');
            this.fallbackMode = true;
            this.startFallbackRecognition();
            break;
            
          case 'no-speech':
            // This is not really an error, just no speech detected
            console.log('No speech detected, continuing to listen');
            break;
            
          case 'aborted':
            // Recognition was aborted (usually intentional)
            this.isListening = false;
            this.stopAudioLevelMonitoring();
            break;
            
          default:
            // For other errors, log but continue in fallback mode
            console.warn(`Unhandled speech recognition error: ${event.error} - switching to fallback mode`);
            this.fallbackMode = true;
            this.startFallbackRecognition();
            break;
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

// Import and re-export the advanced TTS service
import { nariDiaTTS as advancedTTS } from './nari-dia-tts';

// Legacy VoiceSynthesis wrapper for backward compatibility
export class VoiceSynthesis {
  private synthesis: SpeechSynthesis | null = null;
  private isSpeaking: boolean = false;
  private fallbackMode: boolean = false;
  private audio: HTMLAudioElement | null = null;
  private preferredVoice: SpeechSynthesisVoice | null = null;
  private voicesLoaded: boolean = false;
  private voiceQueue: Array<{ text: string; onEnd?: () => void }> = [];
  private isProcessingQueue: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private useAdvancedTTS: boolean = false;
  private ttsProviders: Array<{ name: string; available: boolean; quality: number }> = [
    { name: 'responsiveVoice', available: false, quality: 8 },
    { name: 'speechSynthesis', available: false, quality: 6 },
    { name: 'naturalReaders', available: false, quality: 7 }
  ];

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.synthesis = window.speechSynthesis;
        this.initializeVoices();
        
        // Handle voice changes
        if (this.synthesis.onvoiceschanged !== undefined) {
          this.synthesis.onvoiceschanged = () => this.initializeVoices();
        }
      } else {
        console.warn('Speech synthesis not supported - using fallback');
        this.fallbackMode = true;
      }
    }
  }

  private initializeVoices() {
    if (!this.synthesis) return;
    
    const voices = this.synthesis.getVoices();
    if (voices.length > 0) {
      this.voicesLoaded = true;
      
      // Find the best voice for fast, natural speech
      // Priority: Google voices > Microsoft voices > Apple voices > Default
      const preferredVoices = [
        // Google voices (fastest and most natural)
        voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')),
        // Microsoft voices (good quality, fast)
        voices.find(v => v.name.includes('Microsoft') && v.lang.startsWith('en')),
        // Apple voices
        voices.find(v => v.name.includes('Samantha') || v.name.includes('Alex')),
        // Any English voice
        voices.find(v => v.lang.startsWith('en')),
        // Fallback to first available
        voices[0]
      ].filter(Boolean);
      
      this.preferredVoice = preferredVoices[0] || null;
      
      if (this.preferredVoice) {
        console.log('Selected voice for TTS:', this.preferredVoice.name);
      }
    }
  }

  /**
   * Speak a text message aloud with optimized speed and quality
   * @param text The text to speak
   * @param onEnd Callback function when speech ends
   * @param voice Voice to use (optional)
   * @param priority If true, interrupts current speech
   */
  public async speak(text: string, onEnd?: () => void, voice?: SpeechSynthesisVoice, priority: boolean = false): Promise<boolean> {
    // Use advanced TTS if available and enabled
    if (this.useAdvancedTTS && advancedTTS) {
      try {
        if (priority) {
          return await advancedTTS.speakPriority(text, {}, onEnd);
        } else {
          return await advancedTTS.speak(text, {}, onEnd);
        }
      } catch (error) {
        console.warn('Advanced TTS failed, falling back to native:', error);
        // Fall through to native implementation
      }
    }

    // Fallback to native speech synthesis
    if (this.fallbackMode) {
      return this.fallbackSpeak(text, onEnd);
    }

    if (!this.synthesis) {
      console.warn('Speech synthesis is not supported in this browser');
      return this.fallbackSpeak(text, onEnd);
    }

    // Add to queue if not priority and currently speaking
    if (!priority && this.isSpeaking) {
      this.voiceQueue.push({ text, onEnd });
      return true;
    }

    // Cancel any ongoing speech if priority or queue processing
    if (priority || !this.isSpeaking) {
      this.stop();
    }

    return this.speakImmediate(text, onEnd, voice);
  }

  /**
   * Speak text immediately with optimized settings for speed
   */
  private speakImmediate(text: string, onEnd?: () => void, voice?: SpeechSynthesisVoice): boolean {
    if (!this.synthesis) return false;

    const utterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance = utterance;
    
    // Use preferred voice or provided voice
    if (voice) {
      utterance.voice = voice;
    } else if (this.preferredVoice) {
      utterance.voice = this.preferredVoice;
    }
    
    // Optimize for speed while maintaining clarity
    utterance.rate = 1.1; // Slightly faster than normal
    utterance.pitch = 1.0;
    utterance.volume = 0.9;
    
    // Set event handlers
    utterance.onstart = () => {
      this.isSpeaking = true;
    };
    
    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (onEnd) onEnd();
      
      // Process queue if there are pending items
      this.processQueue();
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (onEnd) onEnd();
      
      // Process queue even on error
      this.processQueue();
    };
    
    // Start speaking immediately
    try {
      this.synthesis.speak(utterance);
      return true;
    } catch (error) {
      console.error('Error with speech synthesis:', error);
      return this.fallbackSpeak(text, onEnd);
    }
  }

  /**
   * Process the voice queue
   */
  private processQueue() {
    if (this.isProcessingQueue || this.voiceQueue.length === 0 || this.isSpeaking) {
      return;
    }

    this.isProcessingQueue = true;
    const nextItem = this.voiceQueue.shift();
    
    if (nextItem) {
      setTimeout(() => {
        this.isProcessingQueue = false;
        this.speakImmediate(nextItem.text, nextItem.onEnd);
      }, 100); // Small delay between queue items
    } else {
      this.isProcessingQueue = false;
    }
  }

  /**
   * Speak with priority (interrupts current speech)
   */
  public async speakPriority(text: string, onEnd?: () => void): Promise<boolean> {
    return await this.speak(text, onEnd, undefined, true);
  }

  /**
   * Clear the voice queue
   */
  public clearQueue() {
    this.voiceQueue = [];
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
   * Stop any current speech and clear queue
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
    
    // Clear current utterance
    this.currentUtterance = null;
    
    // Clear the queue
    this.clearQueue();
    
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
   * Get the preferred voice being used
   */
  public getPreferredVoice(): SpeechSynthesisVoice | null {
    return this.preferredVoice;
  }

  /**
   * Set a specific voice as preferred
   */
  public setPreferredVoice(voice: SpeechSynthesisVoice) {
    this.preferredVoice = voice;
  }

  /**
   * Check if currently speaking
   */
  public isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }

  /**
   * Check if voices are loaded and ready
   */
  public areVoicesReady(): boolean {
    return this.voicesLoaded;
  }

  /**
   * Get queue length
   */
  public getQueueLength(): number {
    return this.voiceQueue.length;
  }

  /**
   * Check if speech synthesis is supported in this browser
   */
  public isSupported(): boolean {
    // Always return true since we have fallback mode
    return true;
  }

  /**
   * Test the current voice setup
   */
  public async testVoice(): Promise<boolean> {
    if (this.preferredVoice) {
      return await this.speak('Voice test successful', undefined, undefined, true);
    }
    return false;
  }
}

export const voiceSynthesis = typeof window !== 'undefined' ? new VoiceSynthesis() : null;

// Export advanced TTS for direct use
export { nariDiaTTS as advancedTTS } from './nari-dia-tts';
