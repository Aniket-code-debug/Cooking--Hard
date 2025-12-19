import { useState, useEffect } from 'react';
import { Mic, MicOff, Loader } from 'lucide-react';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Floating Voice Mic Button Component
 * Appears on multiple pages for quick voice sale recording
 */
const FloatingVoiceMic = () => {
    const { isRecording, transcript, isSupported, error, startRecording, stopRecording, reset } = useVoiceRecorder();
    const [isProcessing, setIsProcessing] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const handleMicClick = () => {
        console.log('🎤 Mic button clicked, isRecording:', isRecording);
        if (isRecording) {
            console.log('⏹️ Stopping recording...');
            stopRecording();
        } else {
            console.log('▶️ Starting recording...');
            startRecording();
        }
    };

    // Auto-submit when recording stops and we have transcript
    useEffect(() => {
        if (!isRecording && transcript && !isProcessing) {
            console.log('✅ Auto-submitting transcript:', transcript);
            handleSubmitVoiceSale();
        }
    }, [isRecording, transcript, isProcessing]);

    const handleSubmitVoiceSale = async () => {
        if (!transcript) return;

        setIsProcessing(true);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_URL}/api/voice-sales/parse`,
                { voiceText: transcript },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Show success toast
            setToastMessage('✓ Voice sale recorded for review');
            setShowToast(true);

            // Reset after 3 seconds
            setTimeout(() => {
                setShowToast(false);
                reset();
            }, 3000);

        } catch (err) {
            console.error('Voice sale error:', err);
            setToastMessage('❌ Failed to record sale. Try again.');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isSupported) {
        return (
            <div className="fixed bottom-6 right-6 z-50">
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg shadow-lg max-w-xs">
                    <p className="text-sm text-red-600 dark:text-red-400 font-semibold mb-2">
                        ❌ Voice Not Supported
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400">
                        Use Chrome or Edge browser
                    </p>
                </div>
            </div>
        );
    }

    // Show error prominently if there is one
    if (error) {
        console.error('Voice Feature Error:', error);
    }

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={handleMicClick}
                disabled={isProcessing}
                className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300 ${isRecording
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                    : 'bg-gfg-green hover:bg-blue-700'
                    } text-white disabled:opacity-50`}
                aria-label={isRecording ? 'Stop recording' : 'Start voice sale'}
            >
                {isProcessing ? (
                    <Loader className="animate-spin" size={28} />
                ) : isRecording ? (
                    <MicOff size={28} />
                ) : (
                    <Mic size={28} />
                )}
            </button>

            {/* Recording Modal */}
            {isRecording && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
                    <div className="bg-white dark:bg-surface-dark p-8 rounded-xl shadow-xl max-w-md w-full mx-4">
                        <div className="text-center">
                            <div className="mb-4">
                                <div className="inline-block p-4 rounded-full bg-red-100 dark:bg-red-900/20">
                                    <Mic className="text-red-500 animate-pulse" size={48} />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                                🔴 Recording...
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                Speak your sale in Hindi/English
                            </p>
                            {transcript && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
                                    <p className="text-sm text-gray-700 dark:text-gray-200">
                                        "{transcript}"
                                    </p>
                                </div>
                            )}
                            <button
                                onClick={stopRecording}
                                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium"
                            >
                                Stop Recording
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success/Error Toast */}
            {showToast && (
                <div className="fixed top-20 right-6 z-50 bg-white dark:bg-surface-dark px-6 py-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 animate-slide-in">
                    <p className="text-gray-900 dark:text-white font-medium">
                        {toastMessage}
                    </p>
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div className="fixed bottom-40 right-6 z-50 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-lg shadow-lg max-w-xs">
                    <p className="text-sm text-red-600 dark:text-red-400">
                        {error}
                    </p>
                </div>
            )}
        </>
    );
};

export default FloatingVoiceMic;
