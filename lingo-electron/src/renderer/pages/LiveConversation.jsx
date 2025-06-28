import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Square,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Zap,
  Waves
} from 'lucide-react';
import { useProgress } from '../providers/ProgressProvider';

const LiveConversation = () => {
  // Session state
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected, connecting, connected, error

  // Audio state
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  // Conversation state
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isAIResponding, setIsAIResponding] = useState(false);

  // Settings
  const [voiceSettings, setVoiceSettings] = useState({
    language: 'en-US',
    voice: 'Alloy',
    speed: 1.0,
    pitch: 1.0
  });

  // Refs
  const messagesEndRef = useRef(null);
  const audioContextRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioStreamRef = useRef(null);

  const { awardXP } = useProgress();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Set up live session event listeners
  useEffect(() => {
    const handleLiveMessage = (data) => {
      console.log('Live message received:', data);
      
      if (data.type === 'text') {
        if (data.isComplete) {
          // Complete message received
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.isStreaming) {
              lastMessage.content = data.content;
              lastMessage.isStreaming = false;
              lastMessage.timestamp = new Date().toLocaleTimeString();
            } else {
              newMessages.push({
                id: Date.now(),
                type: 'ai',
                content: data.content,
                timestamp: new Date().toLocaleTimeString(),
                isStreaming: false
              });
            }
            return newMessages;
          });
          setIsAIResponding(false);
          setCurrentMessage('');
          
          // Award XP for successful interaction
          awardXP(10, 'Live conversation turn');
        } else {
          // Streaming message chunk
          setCurrentMessage(data.content);
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.isStreaming) {
              lastMessage.content = data.content;
            } else {
              newMessages.push({
                id: Date.now(),
                type: 'ai',
                content: data.content,
                timestamp: new Date().toLocaleTimeString(),
                isStreaming: true
              });
            }
            return newMessages;
          });
        }
      } else if (data.type === 'audio') {
        // Handle audio response
        if (isSpeakerEnabled && data.audioData) {
          playAudioResponse(data.audioData);
        }
      }
    };

    const handleLiveError = (error) => {
      console.error('Live session error:', error);
      setConnectionStatus('error');
      setIsSessionActive(false);
      setIsConnecting(false);
    };

    const handleLiveClose = () => {
      console.log('Live session closed');
      setConnectionStatus('disconnected');
      setIsSessionActive(false);
      setIsConnecting(false);
      setSessionId(null);
    };

    // Set up event listeners
    if (window.electronAPI?.onLiveMessage) {
      window.electronAPI.onLiveMessage(handleLiveMessage);
    }
    if (window.electronAPI?.onLiveError) {
      window.electronAPI.onLiveError(handleLiveError);
    }
    if (window.electronAPI?.onLiveClose) {
      window.electronAPI.onLiveClose(handleLiveClose);
    }

    return () => {
      // Cleanup event listeners
      if (window.electronAPI?.removeAllListeners) {
        window.electronAPI.removeAllListeners('live-session:message');
        window.electronAPI.removeAllListeners('live-session:error');
        window.electronAPI.removeAllListeners('live-session:closed');
      }
    };
  }, [isSpeakerEnabled, awardXP]);

  // Start live session
  const startLiveSession = async () => {
    try {
      setIsConnecting(true);
      setConnectionStatus('connecting');
      
      const response = await window.electronAPI.startLiveSession({
        responseModalities: ['text', 'audio'],
        voiceSettings: voiceSettings,
        systemInstruction: 'You are a helpful language learning assistant. Engage in natural conversation to help the user practice their language skills. Provide gentle corrections and encouragement.'
      });
      
      if (response.success) {
        setSessionId(response.sessionId);
        setIsSessionActive(true);
        setConnectionStatus('connected');
        setMessages([{
          id: Date.now(),
          type: 'system',
          content: 'Live conversation session started! Start speaking or type a message.',
          timestamp: new Date().toLocaleTimeString()
        }]);
      } else {
        throw new Error(response.error || 'Failed to start session');
      }
    } catch (error) {
      console.error('Failed to start live session:', error);
      setConnectionStatus('error');
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'error',
        content: `Failed to start live session: ${error.message}`,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsConnecting(false);
    }
  };

  // End live session
  const endLiveSession = async () => {
    try {
      if (sessionId) {
        await window.electronAPI.sendLiveMessage(sessionId, { type: 'end_session' });
      }
      
      // Stop recording if active
      if (isRecording) {
        stopRecording();
      }
      
      setIsSessionActive(false);
      setConnectionStatus('disconnected');
      setSessionId(null);
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'system',
        content: 'Live conversation session ended.',
        timestamp: new Date().toLocaleTimeString()
      }]);
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  // Start recording audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const audioChunks = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioBuffer = await audioBlob.arrayBuffer();
        
        // Send audio to live session
        if (sessionId && isSessionActive) {
          await window.electronAPI.sendLiveMessage(sessionId, {
            type: 'audio',
            audioData: Array.from(new Uint8Array(audioBuffer))
          });
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      // Set up audio level monitoring
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const updateAudioLevel = () => {
        if (isRecording) {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average / 255);
          requestAnimationFrame(updateAudioLevel);
        }
      };
      
      updateAudioLevel();
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  // Stop recording audio
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioLevel(0);
    }
    
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  // Play audio response
  const playAudioResponse = (base64AudioData) => {
    try {
      if (!base64AudioData || typeof base64AudioData !== 'string') {
        console.error('Invalid audio data for playback:', base64AudioData);
        return;
      }
      // Decode base64 string to Uint8Array
      const audioBytes = Uint8Array.from(atob(base64AudioData), c => c.charCodeAt(0));
      const audioBlob = new Blob([audioBytes], { type: 'audio/wav' }); // Assuming WAV, adjust if PCM or other
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.play().catch(e => console.error('Error playing audio:', e));
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };
    } catch (error) {
      console.error('Failed to play audio response:', error);
    }
  };

  // Send text message
  const sendTextMessage = async (text) => {
    if (!text.trim() || !sessionId || !isSessionActive) return;
    
    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString()
    }]);
    
    setIsAIResponding(true);
    
    try {
      await window.electronAPI.sendLiveMessage(sessionId, {
        type: 'text',
        content: text
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsAIResponding(false);
    }
  };

  // Clear conversation
  const clearConversation = () => {
    setMessages([]);
    setCurrentMessage('');
  };

  // Get status color
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-500';
      case 'connecting': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  // Get status text
  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'error': return 'Connection Error';
      default: return 'Disconnected';
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Radio className={`w-6 h-6 ${isSessionActive ? 'text-green-500 animate-pulse' : 'text-gray-400'}`} />
              <div>
                <h1 className="text-xl font-bold text-foreground">Live Conversation</h1>
                <p className={`text-sm ${getStatusColor()}`}>
                  {getStatusText()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Audio Controls */}
            <button
              onClick={() => setIsMicEnabled(!isMicEnabled)}
              className={`p-2 rounded-lg transition-colors ${
                isMicEnabled 
                  ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                  : 'bg-red-100 text-red-600 hover:bg-red-200'
              }`}
              title={isMicEnabled ? 'Disable microphone' : 'Enable microphone'}
            >
              {isMicEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>
            
            <button
              onClick={() => setIsSpeakerEnabled(!isSpeakerEnabled)}
              className={`p-2 rounded-lg transition-colors ${
                isSpeakerEnabled 
                  ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={isSpeakerEnabled ? 'Disable speaker' : 'Enable speaker'}
            >
              {isSpeakerEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            
            {/* Clear conversation */}
            <button
              onClick={clearConversation}
              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              title="Clear conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : message.type === 'system'
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : message.type === 'error'
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : 'bg-card border border-border'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.type === 'ai' && (
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Zap className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs opacity-70">{message.timestamp}</span>
                      {message.isStreaming && (
                        <div className="flex items-center space-x-1 text-xs opacity-70">
                          <Radio className="w-3 h-3 animate-pulse" />
                          <span>streaming</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* AI Responding Indicator */}
        {isAIResponding && !currentMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-card border border-border rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Zap className="w-3 h-3 text-white" />
                </div>
                <div className="flex items-center space-x-1">
                  <Waves className="w-4 h-4 animate-pulse" />
                  <span className="text-sm text-muted-foreground">AI is responding...</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Controls Area */}
      <div className="bg-card border-t border-border p-4">
        {!isSessionActive ? (
          /* Start Session Button */
          <div className="flex justify-center">
            <button
              onClick={startLiveSession}
              disabled={isConnecting}
              className="flex items-center space-x-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isConnecting ? (
                <>
                  <Radio className="w-5 h-5 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  <span>Start Live Conversation</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* Active Session Controls */
          <div className="space-y-4">
            {/* Voice Controls */}
            <div className="flex items-center justify-center space-x-4">
              {/* Push to Talk Button */}
              <div className="flex items-center space-x-2">
                <button
                  onMouseDown={isMicEnabled ? startRecording : undefined}
                  onMouseUp={stopRecording}
                  onMouseLeave={stopRecording}
                  disabled={!isMicEnabled}
                  className={`relative p-4 rounded-full transition-all duration-200 ${
                    isRecording
                      ? 'bg-red-500 text-white scale-110 shadow-lg'
                      : isMicEnabled
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  title={isMicEnabled ? 'Hold to speak' : 'Microphone disabled'}
                >
                  <Mic className="w-6 h-6" />
                  {isRecording && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-white"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                </button>
                
                {/* Audio Level Indicator */}
                {isRecording && (
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 h-4 rounded-full transition-all duration-100 ${
                          audioLevel > (i * 0.2) ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                        style={{
                          height: `${Math.max(4, audioLevel * 20)}px`
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {/* End Session Button */}
              <button
                onClick={endLiveSession}
                className="p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                title="End conversation"
              >
                <Square className="w-5 h-5" />
              </button>
            </div>
            
            {/* Text Input */}
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    sendTextMessage(e.target.value);
                    e.target.value = '';
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = e.target.parentElement.querySelector('input');
                  if (input.value.trim()) {
                    sendTextMessage(input.value);
                    input.value = '';
                  }
                }}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveConversation;