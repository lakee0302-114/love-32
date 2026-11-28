// WebRTC Peer-to-Peer Screen Sharing & Live Study Stream Service
// Uses Google Public STUN servers for NAT traversal + Firebase/WebSocket signaling

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
];

class WebRTCService {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.onRemoteStreamCallback = null;
    this.onIceCandidateCallback = null;
    this.onStreamEndCallback = null;
  }

  // Request screen or camera media capture for Live Study Room & Screen Sharing
  async startScreenCapture({ withAudio = true, withMic = true, mode = 'auto', cameraFacing = 'environment' } = {}) {
    if (typeof window === 'undefined' || !navigator.mediaDevices) {
      throw new Error('Media devices are not supported on this phone/browser.');
    }

    try {
      let stream = null;

      // 1. Try getDisplayMedia if mode is 'screen' or 'auto' on desktop
      if ((mode === 'screen' || mode === 'auto') && navigator.mediaDevices.getDisplayMedia) {
        try {
          stream = await navigator.mediaDevices.getDisplayMedia({
            video: {
              cursor: 'always',
              displaySurface: 'monitor',
              frameRate: { ideal: 30, max: 60 },
            },
            audio: withAudio,
          });
        } catch (displayErr) {
          // If user specifically wanted screen and explicitly denied, rethrow
          if (mode === 'screen' || displayErr.name === 'NotAllowedError') {
            throw displayErr;
          }
          console.warn('[WebRTC] getDisplayMedia fallback to study camera:', displayErr.message);
        }
      }

      // 2. If getDisplayMedia is not available (e.g. Android WebView / mobile phone) or mode is camera:
      // Fallback seamlessly to Live Study Camera (Paper Cam / Front Cam) with Audio!
      if (!stream && navigator.mediaDevices.getUserMedia) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: cameraFacing, // 'environment' for past papers / textbook, 'user' for face cam
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 },
          },
          audio: withMic,
        });
      }

      if (!stream) {
        throw new Error('Could not access screen or camera. Please grant Camera & Microphone permissions in Android settings.');
      }

      // Mix in microphone if screen stream didn't have audio
      if (withMic && mode === 'screen' && navigator.mediaDevices.getUserMedia) {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          micStream.getAudioTracks().forEach((track) => {
            stream.addTrack(track);
          });
        } catch (e) {
          console.warn('[WebRTC] Microphone permission notice:', e.message);
        }
      }

      this.localStream = stream;

      // Handle OS level "Stop sharing" button click
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          this.stopLocalStream();
          if (this.onStreamEndCallback) this.onStreamEndCallback();
        };
      }

      return stream;
    } catch (err) {
      console.warn('[WebRTC] capture error:', err);
      throw err;
    }
  }

  // Initialize RTCPeerConnection
  initPeerConnection(onRemoteStream, onIceCandidate, onStreamEnd) {
    this.cleanup();

    this.onRemoteStreamCallback = onRemoteStream;
    this.onIceCandidateCallback = onIceCandidate;
    this.onStreamEndCallback = onStreamEnd;

    this.peerConnection = new RTCPeerConnection({
      iceServers: ICE_SERVERS,
    });

    // Handle incoming remote screen track
    this.peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        if (this.onRemoteStreamCallback) {
          this.onRemoteStreamCallback(event.streams[0]);
        }
      }
    };

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.onIceCandidateCallback) {
        this.onIceCandidateCallback(event.candidate);
      }
    };

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState;
      console.log('[WebRTC] Connection state:', state);
      if (state === 'disconnected' || state === 'failed' || state === 'closed') {
        if (this.onStreamEndCallback) this.onStreamEndCallback();
      }
    };

    // Add local stream tracks if already present
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection.addTrack(track, this.localStream);
      });
    }

    return this.peerConnection;
  }

  // Presenter: Create WebRTC Offer
  async createOffer() {
    if (!this.peerConnection) throw new Error('Peer connection not initialized');
    const offer = await this.peerConnection.createOffer({
      offerToReceiveVideo: true,
      offerToReceiveAudio: true,
    });
    await this.peerConnection.setLocalDescription(offer);
    return offer;
  }

  // Viewer: Handle WebRTC Offer and create Answer
  async handleOffer(offer) {
    if (!this.peerConnection) throw new Error('Peer connection not initialized');
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    return answer;
  }

  // Presenter: Handle WebRTC Answer from Viewer
  async handleAnswer(answer) {
    if (!this.peerConnection) return;
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  }

  // Handle incoming ICE candidate
  async addIceCandidate(candidate) {
    if (!this.peerConnection || !candidate) return;
    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (e) {
      console.warn('[WebRTC] AddIceCandidate notice:', e.message);
    }
  }

  // Stop local screen stream
  stopLocalStream() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {}
      });
      this.localStream = null;
    }
  }

  // Full cleanup
  cleanup() {
    this.stopLocalStream();
    if (this.peerConnection) {
      try {
        this.peerConnection.close();
      } catch (e) {}
      this.peerConnection = null;
    }
    this.remoteStream = null;
  }
}

export const webrtcService = new WebRTCService();
