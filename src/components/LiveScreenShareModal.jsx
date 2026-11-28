import React, { useState, useEffect, useRef } from 'react';
import {
  Tv,
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Radio,
  Play,
  StopCircle,
  Layers,
  Gamepad2,
  MousePointer,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/audio';
import { webrtcService } from '../utils/webrtcService';

export default function LiveScreenShareModal({
  isOpen,
  onClose,
  currentUserName,
  partnerUserName,
  currentUserId,
  onBroadcastEvent,
  incomingOffer,
  incomingAnswer,
  incomingIce,
  isPartnerSharing,
  incomingPointer,
  showToast,
  isPartnerJoined,
  partnerCode,
}) {
  const [mode, setMode] = useState('idle'); // 'idle' | 'presenter' | 'viewer'
  const [streamSource, setStreamSource] = useState('paperCam'); // 'paperCam' | 'faceCam' | 'screen'
  const [withMic, setWithMic] = useState(true);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [streamDuration, setStreamDuration] = useState(0);
  const [remotePointers, setRemotePointers] = useState([]);
  const [localPointers, setLocalPointers] = useState([]);

  const isDesktop = typeof navigator !== 'undefined' && !(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
  const hasDisplayMedia = typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getDisplayMedia);

  const remoteVideoRef = useRef(null);
  const localPreviewRef = useRef(null);
  const durationTimerRef = useRef(null);

  // Handle incoming remote pointer clicks from partner
  useEffect(() => {
    if (incomingPointer && incomingPointer.x != null && incomingPointer.y != null) {
      soundManager.playLaserClick();
      const newPointer = {
        ...incomingPointer,
        id: Date.now() + Math.random(),
      };
      setRemotePointers((prev) => [...prev.slice(-4), newPointer]);

      // Remove after 3.5s
      setTimeout(() => {
        setRemotePointers((prev) => prev.filter((p) => p.id !== newPointer.id));
      }, 3500);
    }
  }, [incomingPointer]);

  // Viewer: Handle Tap on Video to Send Remote Laser Pointer Click
  const handleViewerVideoClick = (e) => {
    if (mode !== 'viewer') return;
    const targetElement = remoteVideoRef.current || e.currentTarget;
    if (!targetElement) return;

    const rect = targetElement.getBoundingClientRect();
    const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX);
    const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY);
    if (clientX == null || clientY == null) return;

    const x = Math.max(2, Math.min(98, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(2, Math.min(98, ((clientY - rect.top) / rect.height) * 100));

    soundManager.playLaserClick();

    // Broadcast click to presenter
    if (onBroadcastEvent) {
      onBroadcastEvent('REMOTE_POINTER_CLICK', currentUserName, {
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10,
        senderName: currentUserName,
        timestamp: Date.now(),
      });
    }

    // Local ripple feedback
    const localP = { id: Date.now(), x, y };
    setLocalPointers((prev) => [...prev.slice(-3), localP]);
    setTimeout(() => {
      setLocalPointers((prev) => prev.filter((p) => p.id !== localP.id));
    }, 2000);
  };

  // Presenter: Start Screen Sharing with OS permission prompt
  const handleStartSharing = async (chosenSource = streamSource) => {
    setErrorMsg('');
    soundManager.playKissPop();

    try {
      const cameraFacing = chosenSource === 'faceCam' ? 'user' : 'environment';
      const actualMode = chosenSource === 'screen' ? 'screen' : (chosenSource === 'paperCam' || chosenSource === 'faceCam') ? 'camera' : 'auto';

      // 1. Prompt browser/OS for screen or camera capture permission
      const stream = await webrtcService.startScreenCapture({
        withAudio: true,
        withMic,
        mode: actualMode,
        cameraFacing,
      });

      setMode('presenter');
      soundManager.playSuccess();
      try {
        confetti({ particleCount: 70, spread: 80 });
      } catch (e) {}

      // Show local preview thumbnail
      if (localPreviewRef.current) {
        localPreviewRef.current.srcObject = stream;
      }

      // Initialize WebRTC as Presenter
      webrtcService.initPeerConnection(
        null, // No remote stream needed for presenter
        (candidate) => {
          // Send ICE candidate to partner
          if (onBroadcastEvent) {
            onBroadcastEvent('SCREEN_SHARE_ICE', currentUserName, { candidate });
          }
        },
        () => {
          handleStopSharing();
        }
      );

      // Create WebRTC Offer
      const offer = await webrtcService.createOffer();

      // Broadcast offer to partner via Firebase Realtime Database
      if (onBroadcastEvent) {
        onBroadcastEvent('SCREEN_SHARE_OFFER', currentUserName, {
          offer,
          senderName: currentUserName,
          timestamp: Date.now(),
        });
      }

      if (showToast) {
        showToast(isPartnerJoined
          ? `📺 Stream started! Streaming to ${partnerUserName}...`
          : '📺 Stream active! Share partner code with lover to connect.'
        );
      }
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.message?.includes('Permission denied')) {
        setErrorMsg('Camera or Screen permission was declined. Please allow Camera/Mic in phone settings.');
      } else {
        setErrorMsg(err.message || 'Could not start live stream.');
      }
    }
  };

  // Viewer: Accept Partner's Screen Stream
  const handleAcceptIncomingStream = async () => {
    setErrorMsg('');
    soundManager.playChime();
    setMode('viewer');

    try {
      webrtcService.initPeerConnection(
        (remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        },
        (candidate) => {
          if (onBroadcastEvent) {
            onBroadcastEvent('SCREEN_SHARE_ICE', currentUserName, { candidate });
          }
        },
        () => {
          handleCloseViewer();
        }
      );

      if (incomingOffer?.offer) {
        const answer = await webrtcService.handleOffer(incomingOffer.offer);
        if (onBroadcastEvent) {
          onBroadcastEvent('SCREEN_SHARE_ANSWER', currentUserName, { answer });
        }
      }

      if (showToast) showToast(`📺 Connected! Watching ${partnerUserName}'s screen.`);
    } catch (err) {
      setErrorMsg('Failed to establish WebRTC connection: ' + err.message);
    }
  };

  // Presenter handles Viewer's Answer
  useEffect(() => {
    if (mode === 'presenter' && incomingAnswer?.answer) {
      webrtcService.handleAnswer(incomingAnswer.answer);
    }
  }, [incomingAnswer, mode]);

  // Handle incoming ICE candidates
  useEffect(() => {
    if (incomingIce?.candidate) {
      webrtcService.addIceCandidate(incomingIce.candidate);
    }
  }, [incomingIce]);

  // Auto-switch to viewer if incoming offer arrives while modal is open
  useEffect(() => {
    if (isOpen && incomingOffer && mode === 'idle') {
      // Prompt user or allow immediate 1-tap accept
    }
  }, [incomingOffer, isOpen, mode]);

  // Stream Duration Timer
  useEffect(() => {
    if (mode === 'presenter' || mode === 'viewer') {
      durationTimerRef.current = setInterval(() => {
        setStreamDuration((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(durationTimerRef.current);
      setStreamDuration(0);
    }
    return () => clearInterval(durationTimerRef.current);
  }, [mode]);

  // Presenter: Stop Sharing
  const handleStopSharing = () => {
    soundManager.playKissPop();
    webrtcService.cleanup();
    setMode('idle');
    if (onBroadcastEvent) {
      onBroadcastEvent('SCREEN_SHARE_STOP', currentUserName, {});
    }
    if (showToast) showToast('🛑 Screen sharing stopped.');
  };

  // Viewer: Close Viewer
  const handleCloseViewer = () => {
    soundManager.playKissPop();
    webrtcService.cleanup();
    setMode('idle');
  };

  // Toggle Mic (Presenter)
  const handleToggleMic = () => {
    if (webrtcService.localStream) {
      const audioTracks = webrtcService.localStream.getAudioTracks();
      audioTracks.forEach((t) => {
        t.enabled = !t.enabled;
      });
      setIsMicMuted(!isMicMuted);
    }
  };

  // Toggle Picture-in-Picture (Viewer)
  const handleTogglePiP = async () => {
    try {
      if (remoteVideoRef.current && document.pictureInPictureEnabled) {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await remoteVideoRef.current.requestPictureInPicture();
        }
      }
    } catch (e) {
      console.warn('PiP notice:', e);
    }
  };

  // Fullscreen (Viewer)
  const handleFullscreen = () => {
    if (remoteVideoRef.current) {
      if (remoteVideoRef.current.requestFullscreen) {
        remoteVideoRef.current.requestFullscreen();
      }
    }
  };

  // Format Duration MM:SS
  const formatSec = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-950 border border-indigo-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">

        {/* Modal Top Header */}
        <div className="p-4 bg-gradient-to-r from-indigo-950/80 via-purple-950/80 to-slate-900/90 border-b border-indigo-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Tv size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <span>Live Screen Sharing</span>
                {mode === 'presenter' && (
                  <span className="text-[10px] bg-rose-500 text-white font-bold px-2 py-0.2 rounded-full animate-pulse flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    LIVE
                  </span>
                )}
                {mode === 'viewer' && (
                  <span className="text-[10px] bg-emerald-500 text-white font-bold px-2 py-0.2 rounded-full flex items-center gap-1">
                    <Radio size={10} className="animate-spin" />
                    WATCHING
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-indigo-200">
                {mode === 'presenter'
                  ? `Streaming your screen to ${partnerUserName} (${formatSec(streamDuration)})`
                  : mode === 'viewer'
                  ? `Watching ${partnerUserName}'s live screen (${formatSec(streamDuration)})`
                  : `Study & watch together with ${partnerUserName} 👫`}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (mode === 'presenter') handleStopSharing();
              else if (mode === 'viewer') handleCloseViewer();
              onClose();
            }}
            className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition active:scale-95"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">

          {/* ERROR ALERT */}
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ========================================================
              STATE A: IDLE / NOT SHARING YET
             ======================================================== */}
          {mode === 'idle' && (
            <div className="space-y-4">
              {/* Partner currently sharing banner */}
              {isPartnerSharing || incomingOffer ? (
                <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-teal-950/80 to-slate-900 border border-emerald-500/40 shadow-xl space-y-2.5 animate-pulse">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>{partnerUserName} is sharing their screen right now!</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Tap below to connect and view their screen live in real-time.
                  </p>
                  <button
                    onClick={handleAcceptIncomingStream}
                    className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs shadow-lg shadow-emerald-500/30 hover:opacity-95 active:scale-95 transition flex items-center justify-center gap-2"
                  >
                    <Play size={16} fill="currentColor" />
                    <span>Watch {partnerUserName}'s Screen Now 👀</span>
                  </button>
                </div>
              ) : null}

              {/* Feature Introduction Card */}
              <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30">
                  <Tv size={32} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    {partnerUserName ? `Share Live Stream with ${partnerUserName}` : 'Live Study Room & Screen Sharing'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Solve A/L past papers, discuss problems, show your notes, or watch educational videos together in real-time with WebRTC!
                  </p>
                </div>

                {!isPartnerJoined && (
                  <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-300 space-y-1">
                    <div className="font-bold flex items-center justify-center gap-1">
                      <span>⚠️ Partner has not joined yet</span>
                    </div>
                    <div className="text-[10px] text-slate-300">
                      Share Partner Code <span className="font-mono font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded">{partnerCode || 'LOVE-4634'}</span> so they can connect!
                    </div>
                  </div>
                )}

                <div className="pt-1 flex items-center justify-center gap-2 text-[11px] text-indigo-300">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span>Encrypted Peer-to-Peer WebRTC Transmission</span>
                </div>
              </div>

              {/* Stream Mode Selection (Past Paper Cam / Face Cam / Screen) */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">
                  Choose Live Stream Mode:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStreamSource('paperCam')}
                    className={`p-3 rounded-2xl border text-left transition active:scale-95 cursor-pointer ${
                      streamSource === 'paperCam'
                        ? 'bg-indigo-600/25 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-lg mb-1">📖 📸</div>
                    <div className="text-xs font-bold text-white">Paper / Book Cam</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Point phone at A/L notes</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStreamSource('faceCam')}
                    className={`p-3 rounded-2xl border text-left transition active:scale-95 cursor-pointer ${
                      streamSource === 'faceCam'
                        ? 'bg-purple-600/25 border-purple-500 text-white shadow-md'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-lg mb-1">🤳 ✨</div>
                    <div className="text-xs font-bold text-white">Study Face Cam</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Study together face-to-face</div>
                  </button>

                  {hasDisplayMedia && (
                    <button
                      type="button"
                      onClick={() => setStreamSource('screen')}
                      className={`col-span-2 p-3 rounded-2xl border text-left transition active:scale-95 cursor-pointer ${
                        streamSource === 'screen'
                          ? 'bg-rose-600/25 border-rose-500 text-white shadow-md'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">💻</span>
                        <div>
                          <div className="text-xs font-bold text-white">Full Screen Share</div>
                          <div className="text-[10px] text-slate-400">Share computer / tablet screen</div>
                        </div>
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* Settings / Options */}
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Mic size={16} className="text-indigo-400" />
                  <span>Include Microphone (Talk while streaming)</span>
                </div>
                <input
                  type="checkbox"
                  checked={withMic}
                  onChange={(e) => setWithMic(e.target.checked)}
                  className="w-4 h-4 text-indigo-500 accent-indigo-500 cursor-pointer"
                />
              </div>

              {/* Start Sharing Button */}
              <button
                type="button"
                onClick={() => handleStartSharing()}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white font-black text-xs shadow-xl shadow-indigo-500/25 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Tv size={18} />
                <span>
                  {streamSource === 'faceCam'
                    ? 'Start Face Cam Stream 🤳'
                    : streamSource === 'screen'
                    ? 'Start Screen Sharing 💻'
                    : 'Start Study Cam Stream 📖'}
                </span>
              </button>
            </div>
          )}

          {/* ========================================================
              STATE B: PRESENTER MODE (YOU ARE SHARING)
             ======================================================== */}
          {mode === 'presenter' && (
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-gradient-to-br from-rose-950/40 via-purple-950/40 to-slate-900 border border-rose-500/30 text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center animate-pulse">
                  <Tv size={28} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">🔴 Screen is Live Streaming</h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {partnerUserName} can now see your screen and hear your voice!
                  </p>
                  <div className="font-mono text-xs text-rose-400 font-bold mt-1">
                    Live Duration: {formatSec(streamDuration)}
                  </div>
                </div>

                {/* Local preview video element */}
                <div className="rounded-2xl overflow-hidden border border-slate-800 bg-black aspect-video max-h-48 mx-auto relative shadow-inner">
                  <video
                    ref={localPreviewRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-contain"
                  />
                  <span className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] font-bold text-white uppercase tracking-wider">
                    Presenter Preview
                  </span>

                  {/* Incoming Partner Laser Pointer Clicks */}
                  {remotePointers.map((p) => (
                    <div
                      key={p.id}
                      className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 z-30 transition-all duration-300"
                      style={{ left: `${p.x}%`, top: `${p.y}%` }}
                    >
                      <div className="relative flex items-center justify-center">
                        <span className="w-8 h-8 rounded-full bg-rose-500/40 absolute animate-ping" />
                        <span className="w-5 h-5 rounded-full bg-rose-500/80 absolute animate-pulse" />
                        <span className="w-3 h-3 rounded-full bg-white border border-rose-600 shadow-md" />
                        <span className="absolute left-4 -top-2 whitespace-nowrap bg-rose-600/95 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-lg border border-white/30 flex items-center gap-1">
                          <span>👆 {p.senderName || partnerUserName}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Banner when partner points */}
                {remotePointers.length > 0 && (
                  <div className="p-2.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center justify-center gap-2 animate-pulse">
                    <MousePointer size={14} className="text-rose-400" />
                    <span>{partnerUserName} is pointing at your screen right now!</span>
                  </div>
                )}
              </div>

              {/* Presenter Action Bar */}
              <div className="flex gap-2">
                <button
                  onClick={handleToggleMic}
                  className={`flex-1 py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                    isMicMuted
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {isMicMuted ? <MicOff size={16} /> : <Mic size={16} />}
                  <span>{isMicMuted ? 'Mic Muted' : 'Mic Active'}</span>
                </button>

                <button
                  onClick={handleStopSharing}
                  className="flex-1 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-500/30 flex items-center justify-center gap-1.5 active:scale-95 transition"
                >
                  <StopCircle size={16} />
                  <span>Stop Sharing ⏹️</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              STATE C: VIEWER MODE (WATCHING PARTNER'S SCREEN)
             ======================================================== */}
          {mode === 'viewer' && (
            <div className="space-y-3">
              {/* Remote Video Stream Container */}
              <div
                onClick={handleViewerVideoClick}
                className="relative rounded-3xl overflow-hidden bg-black border border-indigo-500/40 shadow-2xl aspect-video flex items-center justify-center cursor-crosshair group select-none"
              >
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  controls={false}
                  className="w-full h-full object-contain pointer-events-none"
                />

                {/* Viewer Local Click Ripple Feedback */}
                {localPointers.map((p) => (
                  <div
                    key={p.id}
                    className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 z-30 animate-ping"
                    style={{ left: `${p.x}%`, top: `${p.y}%` }}
                  >
                    <div className="w-6 h-6 rounded-full bg-rose-500/70 border-2 border-white shadow-xl" />
                  </div>
                ))}

                {/* Pointer Tip Badge */}
                <div className="absolute bottom-2.5 left-2.5 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1.5 text-[10px] font-bold text-slate-300 pointer-events-none">
                  <MousePointer size={12} className="text-rose-400" />
                  <span>Tap video to point for {partnerUserName} 🎯</span>
                </div>

                {/* Top overlay badge */}
                <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1.5 text-[10px] font-bold text-emerald-300 pointer-events-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>{partnerUserName}'s Live Screen • {formatSec(streamDuration)}</span>
                </div>

                {/* Floating controls */}
                <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 pointer-events-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTogglePiP();
                    }}
                    className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur border border-white/10"
                    title="Picture in Picture Mode"
                  >
                    <ExternalLink size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFullscreen();
                    }}
                    className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur border border-white/10"
                    title="Fullscreen"
                  >
                    <Maximize2 size={14} />
                  </button>
                </div>
              </div>

              {/* Viewer Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleTogglePiP}
                  className="flex-1 py-2 rounded-xl bg-slate-900 border border-slate-800 text-indigo-300 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-800"
                >
                  <Layers size={14} />
                  <span>Mini Player (PiP)</span>
                </button>

                <button
                  onClick={handleCloseViewer}
                  className="flex-1 py-2 rounded-xl bg-slate-900 border border-slate-800 text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-800"
                >
                  <span>Leave Stream 🚪</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
