import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import { evaluateSquatForm, determineSquatPhase, SQUAT_PHASES } from '../utils/squatRules';
import { evaluatePushupForm, determinePushupPhase, PUSHUP_PHASES } from '../utils/pushupRules';
import FeedbackDisplay from './FeedbackDisplay';
import ThreeJsVisualizer from './ThreeJsVisualizer';

const PoseDetector = ({ exerciseType, onStopDetection }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [poseLandmarker, setPoseLandmarker] = useState(null);
  const [camera, setCamera] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [evaluation, setEvaluation] = useState({ isCorrect: true, issues: [] });
  const [phase, setPhase] = useState(exerciseType === 'squat' ? SQUAT_PHASES.STANDING : PUSHUP_PHASES.TOP);
  const [landmarks, setLandmarks] = useState(null);

  // Refs for tracking exercise state
  const prevPhaseRef = useRef(exerciseType === 'squat' ? SQUAT_PHASES.STANDING : PUSHUP_PHASES.TOP);
  const prevValueRef = useRef(null); // For hip height (squat) or elbow angle (pushup)

  // Initialize MediaPipe PoseLandmarker
  useEffect(() => {
    const initializePoseLandmarker = async () => {
      try {
        setIsLoading(true);

        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );

        // Try with CPU delegate first for better compatibility
        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task",
            delegate: "CPU" // Changed from GPU to CPU for better compatibility
          },
          runningMode: "VIDEO",
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
          outputSegmentationMasks: false
        });


        setPoseLandmarker(landmarker);
        setIsLoading(false);
      } catch (err) {
        console.error("Error initializing pose landmarker:", err);
        setError(`Failed to initialize pose detection: ${err.message}. Please try again or check browser compatibility.`);
        setIsLoading(false);
      }
    };

    initializePoseLandmarker();

    // Cleanup function
    return () => {
      if (camera) {

        camera.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Initialize camera
  useEffect(() => {
    const enableCamera = async () => {
      if (!poseLandmarker) {
        return;
      }

      try {

        const constraints = {
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);


        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener('loadeddata', predictWebcam);

        } else {
          console.error('Video element reference is not available');
          setError('Video element not found. Please refresh the page.');
        }

        setCamera(stream);
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError(`Failed to access camera: ${err.message}. Please check permissions and try again.`);
      }
    };

    enableCamera();

    return () => {
      if (videoRef.current) {

        videoRef.current.removeEventListener('loadeddata', predictWebcam);
      }
    };
  }, [poseLandmarker]);

  // Function to process video frames and detect poses
  let lastVideoTime = -1;
  const predictWebcam = async () => {
    try {
      if (!poseLandmarker || !videoRef.current) {

        requestAnimationFrame(predictWebcam);
        return;
      }

      const video = videoRef.current;

      // Check if video dimensions are available
      if (video.videoWidth === 0 || video.videoHeight === 0) {

        requestAnimationFrame(predictWebcam);
        return;
      }

      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      // Canvas setup for visualization
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = videoWidth;
        canvas.height = videoHeight;
        const ctx = canvas.getContext('2d');

        // Draw video frame
        ctx.save();
        ctx.scale(-1, 1); // Mirror horizontally
        ctx.translate(-videoWidth, 0);
        ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
        ctx.restore();
      } else {
        console.warn('Canvas reference not available');
      }

      // Process the frame if the video is playing
      if (video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;

        try {
          const startTimeMs = performance.now();
          const results = poseLandmarker.detectForVideo(video, startTimeMs);

          if (results.landmarks && results.landmarks.length > 0) {

            const detectedLandmarks = results.landmarks[0];
            setLandmarks(detectedLandmarks);

            // Evaluate exercise form based on exercise type
            if (exerciseType === 'squat') {
              // Determine squat phase
              const { phase: newPhase, hipHeight } = determineSquatPhase(
                detectedLandmarks,
                prevPhaseRef.current,
                prevValueRef.current
              );

              if (newPhase !== prevPhaseRef.current) {

                setPhase(newPhase);
                prevPhaseRef.current = newPhase;
              }

              prevValueRef.current = hipHeight;

              // Evaluate squat form
              const result = evaluateSquatForm(detectedLandmarks, newPhase);
              setEvaluation(result);

              // Draw landmarks on canvas
              if (canvas) {
                drawLandmarks(canvas, detectedLandmarks, result);
              }
            } else if (exerciseType === 'pushup') {
              // Determine pushup phase
              const { phase: newPhase, elbowAngle } = determinePushupPhase(
                detectedLandmarks,
                prevPhaseRef.current,
                prevValueRef.current
              );

              if (newPhase !== prevPhaseRef.current) {

                setPhase(newPhase);
                prevPhaseRef.current = newPhase;
              }

              prevValueRef.current = elbowAngle;

              // Evaluate pushup form
              const result = evaluatePushupForm(detectedLandmarks, newPhase);
              setEvaluation(result);

              // Draw landmarks on canvas
              if (canvas) {
                drawLandmarks(canvas, detectedLandmarks, result);
              }
            }
          }
        } catch (detectionError) {
          console.error('Error during pose detection:', detectionError);
        }
      }

      // Continue detection loop
      requestAnimationFrame(predictWebcam);
    } catch (error) {
      console.error('Unexpected error in predictWebcam:', error);
      setError(`Detection error: ${error.message}. Please refresh the page.`);
    }
  };

  // Function to draw landmarks on canvas
  const drawLandmarks = (canvas, landmarks, evaluation) => {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Define connections for visualization
    const connections = [
      // Torso
      [11, 12], [12, 24], [24, 23], [23, 11],
      // Right arm
      [12, 14], [14, 16],
      // Left arm
      [11, 13], [13, 15],
      // Right leg
      [24, 26], [26, 28], [28, 32], [32, 30], [30, 28],
      // Left leg
      [23, 25], [25, 27], [27, 31], [31, 29], [29, 27]
    ];

    // Draw connections
    ctx.lineWidth = 5;

    for (const [start, end] of connections) {
      if (start < landmarks.length && end < landmarks.length) {
        const startPoint = landmarks[start];
        const endPoint = landmarks[end];

        if (startPoint.visibility > 0.5 && endPoint.visibility > 0.5) {
          // Mirror x-coordinate
          const startX = width - startPoint.x * width;
          const startY = startPoint.y * height;
          const endX = width - endPoint.x * width;
          const endY = endPoint.y * height;

          // Set color based on evaluation
          ctx.strokeStyle = evaluation.isCorrect ? 'green' : 'red';

          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        }
      }
    }

    // Draw landmarks
    landmarks.forEach((landmark) => {
      if (landmark.visibility > 0.5) {
        // Mirror x-coordinate
        const x = width - landmark.x * width;
        const y = landmark.y * height;

        ctx.fillStyle = evaluation.isCorrect ? 'green' : 'red';
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    // Draw phase information
    ctx.font = '24px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText(`Phase: ${phase}`, 20, 30);

    // Draw issues if any
    if (evaluation.issues && evaluation.issues.length > 0) {
      ctx.font = '20px Arial';
      ctx.fillStyle = 'red';
      evaluation.issues.forEach((issue, i) => {
        ctx.fillText(issue, 20, 60 + i * 30);
      });
    }
  };

  // Handle stop detection
  const handleStop = () => {
    if (camera) {
      camera.getTracks().forEach(track => track.stop());
    }
    onStopDetection();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-lg font-semibold mb-2">Loading pose detection model...</p>
        <p className="text-sm text-gray-600 max-w-md text-center">
          This may take a moment. The app is loading the MediaPipe pose detection model and initializing the camera.
          Please make sure you've granted camera permissions when prompted.
        </p>
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 max-w-md">
          <h3 className="font-medium text-blue-700 mb-2">Troubleshooting Tips:</h3>
          <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
            <li>Make sure your camera is not being used by another application</li>
            <li>Try using a different browser (Chrome recommended)</li>
            <li>Check that JavaScript is enabled in your browser</li>
            <li>Ensure you have a stable internet connection</li>
          </ul>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-6 max-w-lg">
          <h3 className="font-bold text-lg mb-2">Error Detected</h3>
          <p className="mb-4">{error}</p>
          <div className="bg-white p-3 rounded border border-red-200">
            <p className="text-sm font-medium text-gray-700 mb-2">Possible solutions:</p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Make sure your camera is connected and working</li>
              <li>Grant camera permissions when prompted</li>
              <li>Try using a different browser (Chrome recommended)</li>
              <li>Restart your browser or device</li>
            </ul>
          </div>
        </div>
        <button
          onClick={onStopDetection}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors"
        >
          Go Back to Exercise Selection
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row w-full h-full">
      <div className="relative w-full md:w-3/4 h-full">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute top-0 left-0 w-full h-full object-cover"
          style={{ minHeight: '400px', opacity: 0.2 }} // Slightly visible for debugging
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full object-cover"
          style={{ minHeight: '400px', backgroundColor: '#1a1a1a' }}
        />

        <div className="absolute top-4 right-4">
          <button
            onClick={handleStop}
            className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            Stop
          </button>
        </div>
      </div>

      <div className="w-full md:w-1/4 p-4 bg-gray-100 overflow-y-auto">
        <FeedbackDisplay
          exerciseType={exerciseType}
          phase={phase}
          evaluation={evaluation}
        />

        {landmarks && (
          <ThreeJsVisualizer
            landmarks={landmarks}
            evaluation={evaluation}
            exerciseType={exerciseType}
            phase={phase}
          />
        )}
      </div>
    </div>
  );
};

export default PoseDetector;
