/**
 * Rules for evaluating push-up form
 */
import { calculateAngle, calculate3DAngle, isPointVisible, getNamedLandmarks } from './poseUtils';

// Define push-up phases
export const PUSHUP_PHASES = {
  TOP: 'top',
  DESCENDING: 'descending',
  BOTTOM: 'bottom',
  ASCENDING: 'ascending'
};

// Threshold values for push-up evaluation
const THRESHOLDS = {
  // Elbow angle at bottom position (degrees)
  MIN_ELBOW_ANGLE: 70,
  MAX_ELBOW_ANGLE: 100,
  
  // Elbow angle at top position (degrees)
  MIN_TOP_ELBOW_ANGLE: 150,
  
  // Back alignment (degrees from horizontal)
  MAX_BACK_SAG: 15,
  MAX_BACK_PIKE: 15,
  
  // Neck alignment (degrees)
  MAX_NECK_ANGLE: 30,
  
  // Depth threshold (ratio of shoulder height in top vs. bottom position)
  MIN_DEPTH_RATIO: 0.8,
  
  // Confidence threshold for landmarks
  CONFIDENCE_THRESHOLD: 0.5
};

// Determine the current phase of the push-up
export const determinePushupPhase = (landmarks, prevPhase = PUSHUP_PHASES.TOP, prevElbowAngle = null) => {
  const namedLandmarks = getNamedLandmarks(landmarks);
  if (!namedLandmarks) return { phase: prevPhase, elbowAngle: prevElbowAngle };
  
  const { leftShoulder, rightShoulder, leftElbow, rightElbow, leftWrist, rightWrist } = namedLandmarks;
  
  // Check if we have all the necessary landmarks with sufficient confidence
  if (!isPointVisible(leftShoulder) || !isPointVisible(rightShoulder) || 
      !isPointVisible(leftElbow) || !isPointVisible(rightElbow) || 
      !isPointVisible(leftWrist) || !isPointVisible(rightWrist)) {
    return { phase: prevPhase, elbowAngle: prevElbowAngle };
  }
  
  // Calculate average elbow angle
  const leftElbowAngle = calculate3DAngle(leftShoulder, leftElbow, leftWrist);
  const rightElbowAngle = calculate3DAngle(rightShoulder, rightElbow, rightWrist);
  const avgElbowAngle = (leftElbowAngle + rightElbowAngle) / 2;
  
  // Determine phase based on elbow angle and its change
  let phase = prevPhase;
  
  if (avgElbowAngle > 150) {
    // Top position (arms extended)
    phase = PUSHUP_PHASES.TOP;
  } else if (avgElbowAngle < 120 && (prevElbowAngle === null || avgElbowAngle < prevElbowAngle)) {
    // Descending phase (elbow angle decreasing)
    phase = PUSHUP_PHASES.DESCENDING;
  } else if (avgElbowAngle < 120 && avgElbowAngle > prevElbowAngle) {
    // Ascending phase (elbow angle increasing)
    phase = PUSHUP_PHASES.ASCENDING;
  }
  
  // Bottom position is the lowest point of the push-up
  if (phase === PUSHUP_PHASES.DESCENDING && prevPhase === PUSHUP_PHASES.DESCENDING && 
      avgElbowAngle > prevElbowAngle) {
    phase = PUSHUP_PHASES.BOTTOM;
  }
  
  return { phase, elbowAngle: avgElbowAngle };
};

// Evaluate push-up form based on the current phase
export const evaluatePushupForm = (landmarks, phase) => {
  const namedLandmarks = getNamedLandmarks(landmarks);
  if (!namedLandmarks) return { isCorrect: false, issues: ['No landmarks detected'] };
  
  const { 
    nose, leftEye, rightEye,
    leftShoulder, rightShoulder, 
    leftElbow, rightElbow, 
    leftWrist, rightWrist,
    leftHip, rightHip,
    leftAnkle, rightAnkle
  } = namedLandmarks;
  
  // Check if we have all the necessary landmarks with sufficient confidence
  const requiredLandmarks = [
    leftShoulder, rightShoulder, 
    leftElbow, rightElbow, 
    leftWrist, rightWrist,
    leftHip, rightHip
  ];
  
  if (requiredLandmarks.some(landmark => !isPointVisible(landmark, THRESHOLDS.CONFIDENCE_THRESHOLD))) {
    return { isCorrect: false, issues: ['Some key landmarks not visible'] };
  }
  
  const issues = [];
  
  // Calculate angles
  const leftElbowAngle = calculate3DAngle(leftShoulder, leftElbow, leftWrist);
  const rightElbowAngle = calculate3DAngle(rightShoulder, rightElbow, rightWrist);
  
  // Calculate back alignment (angle between shoulders, hips, and ankles)
  const midShoulder = { 
    x: (leftShoulder.x + rightShoulder.x) / 2, 
    y: (leftShoulder.y + rightShoulder.y) / 2,
    z: (leftShoulder.z + rightShoulder.z) / 2
  };
  
  const midHip = { 
    x: (leftHip.x + rightHip.x) / 2, 
    y: (leftHip.y + rightHip.y) / 2,
    z: (leftHip.z + rightHip.z) / 2
  };
  
  // Calculate back angle (should be close to horizontal in a proper push-up)
  // We use a horizontal reference point
  const horizontalRef = { x: midShoulder.x + 1, y: midShoulder.y, z: midShoulder.z };
  const backAngle = calculateAngle(horizontalRef, midShoulder, midHip);
  
  // Calculate neck angle (should be neutral, not looking up or down too much)
  const midEye = {
    x: (leftEye.x + rightEye.x) / 2,
    y: (leftEye.y + rightEye.y) / 2,
    z: (leftEye.z + rightEye.z) / 2
  };
  
  const neckAngle = calculateAngle(midShoulder, nose, midEye);
  
  // Phase-specific evaluations
  switch (phase) {
    case PUSHUP_PHASES.BOTTOM:
      // Check elbow angle at bottom position
      if (leftElbowAngle > THRESHOLDS.MAX_ELBOW_ANGLE || rightElbowAngle > THRESHOLDS.MAX_ELBOW_ANGLE) {
        issues.push('Not going deep enough');
      }
      
      if (leftElbowAngle < THRESHOLDS.MIN_ELBOW_ANGLE || rightElbowAngle < THRESHOLDS.MIN_ELBOW_ANGLE) {
        issues.push('Elbows bent too much');
      }
      
      // Check back alignment
      if (backAngle > THRESHOLDS.MAX_BACK_SAG) {
        issues.push('Back sagging too much');
      } else if (backAngle < -THRESHOLDS.MAX_BACK_PIKE) {
        issues.push('Hips too high (piking)');
      }
      
      // Check neck position
      if (Math.abs(neckAngle) > THRESHOLDS.MAX_NECK_ANGLE) {
        issues.push('Neck not in neutral position');
      }
      break;
      
    case PUSHUP_PHASES.TOP:
      // Check if arms are fully extended at top
      if (leftElbowAngle < THRESHOLDS.MIN_TOP_ELBOW_ANGLE || rightElbowAngle < THRESHOLDS.MIN_TOP_ELBOW_ANGLE) {
        issues.push('Arms not fully extended at top');
      }
      
      // Check back alignment
      if (backAngle > THRESHOLDS.MAX_BACK_SAG) {
        issues.push('Back sagging too much');
      } else if (backAngle < -THRESHOLDS.MAX_BACK_PIKE) {
        issues.push('Hips too high (piking)');
      }
      break;
      
    case PUSHUP_PHASES.DESCENDING:
    case PUSHUP_PHASES.ASCENDING:
      // Check back alignment during movement
      if (backAngle > THRESHOLDS.MAX_BACK_SAG) {
        issues.push('Back sagging too much');
      } else if (backAngle < -THRESHOLDS.MAX_BACK_PIKE) {
        issues.push('Hips too high (piking)');
      }
      
      // Check neck position during movement
      if (Math.abs(neckAngle) > THRESHOLDS.MAX_NECK_ANGLE) {
        issues.push('Neck not in neutral position');
      }
      break;
  }
  
  return {
    isCorrect: issues.length === 0,
    issues,
    angles: {
      leftElbow: leftElbowAngle,
      rightElbow: rightElbowAngle,
      back: backAngle,
      neck: neckAngle
    }
  };
};
