import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook for voice recording using Web Speech API
 * @returns {Object} Voice recorder state and methods
 */
export const useVoiceRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isSupported, setIsSupported] = useState(true);
    const [error, setError] = useState(null);

    const recognitionRef = useRef(null);

    useEffect(() => {
        // Check if browser supports Web Speech API
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.error('❌ Speech Recognition API not available');
            setIsSupported(false);
            setError('Speech recognition not supported in this browser. Please use Chrome or Edge.');
            return;
        }

        console.log('✅ Speech Recognition API available');

        // Initialize speech recognition
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'hi-IN'; // Hindi India - also recognizes Hinglish

        console.log('🎙️ Speech Recognition initialized with lang:', recognition.lang);

        recognition.onresult = (event) => {
            const speechResult = event.results[0][0].transcript;
            console.log('✅ Speech recognized:', speechResult);
            setTranscript(speechResult);
        };

        recognition.onerror = (event) => {
            console.error('❌ Speech recognition error:', event.error, event);
            setError(`Recording error: ${event.error}`);
            setIsRecording(false);
        };

        recognition.onend = () => {
            console.log('⏹️ Speech recognition ended');
            setIsRecording(false);
        };

        recognition.onstart = () => {
            console.log('▶️ Speech recognition started');
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const startRecording = useCallback(async () => {
        if (!isSupported) {
            setError('Speech recognition not supported');
            return;
        }

        setError(null);
        setTranscript('');

        try {
            // Check microphone permission first
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                try {
                    await navigator.mediaDevices.getUserMedia({ audio: true });
                } catch (permErr) {
                    setError('Microphone permission denied. Please allow microphone access.');
                    console.error('Mic permission error:', permErr);
                    return;
                }
            }

            recognitionRef.current?.start();
            setIsRecording(true);
        } catch (err) {
            console.error('Failed to start recording:', err);
            setError(`Failed to start: ${err.message || 'Please allow microphone and try again'}`);
        }
    }, [isSupported]);

    const stopRecording = useCallback(() => {
        try {
            recognitionRef.current?.stop();
            setIsRecording(false);
        } catch (err) {
            console.error('Failed to stop recording:', err);
        }
    }, []);

    const reset = useCallback(() => {
        setTranscript('');
        setError(null);
    }, []);

    return {
        isRecording,
        transcript,
        isSupported,
        error,
        startRecording,
        stopRecording,
        reset
    };
};
