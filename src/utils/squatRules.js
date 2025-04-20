/**
 * Rules for evaluating squat form
 */
import { calculateAngle, calculate3DAngle, isPointVisible, getNamedLandmarks } from './poseUtils';

// Define squat phases
export const SQUAT_PHASES = {
  STANDING: 'standing',
  DESCENDING: 'descending',
  BOTTOM: 'bottom',
  ASCENDING: 'ascending'
};

// Threshold values for squat evaluation
const THRESHOLDS = {
  // Knee angle at bottom position (degrees)
  MIN_KNEE_ANGLE: 70,
  MAX_KNEE_ANGLE: 100,
  
  // Hip angle at bottom position (degrees)
  MIN_HIP_ANGLE: 70,
  MAX_HIP_ANGLE: 110,
  
  // Back angle relative to vertical (degrees)
  MAX_BACK_LEAN: 45,
  
  // Knee forward of toes
  MAX_KNEE_FORWARD: 0.1, // Normalized distance
  
  // Knee alignment (knees should track over toes)
  MAX_KNEE_INWARD: 0.1, // Normalized distance
  
  // Depth threshold (ratio of hip height in standing vs. bottom position)
  MIN_DEPTH_RATIO: 0.7,
  
  // Confidence threshold for landmarks
  CONFIDENCE_THRESHOLD: 0.5
};

// Determine the current phase of the squat
export const determineSquatPhase = (landmarks, prevPhase = SQUAT_PHASES.STANDING, prevHipHeight = null) => {
  const namedLandmarks = getNamedLandmarks(landmarks);
  if (!namedLandmarks) return { phase: prevPhase, hipHeight: prevHipHeight };
  
  const { leftHip, rightHip, leftKnee, rightKnee, leftAnkle, rightAnkle } = namedLandmarks;
  
  // Check if we have all the necessary landmarks with sufficient confidence
  if (!isPointVisible(leftHip) || !isPointVisible(rightHip) || 
      !isPointVisible(leftKnee) || !isPointVisible(rightKnee) || 
      !isPointVisible(leftAnkle) || !isPointVisible(rightAnkle)) {
    return { phase: prevPhase, hipHeight: prevHipHeight };
  }
  
  // Calculate average hip height
  const hipHeight = (leftHip.y + rightHip.y) / 2;
  
  // Calculate average knee angle
  const leftKneeAngle = calculate3DAngle(leftHip, leftKnee, leftAnkle);
  const rightKneeAngle = calculate3DAngle(rightHip, rightKnee, rightAnkle);
  const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;
  
  // Determine phase based on knee angle and hip height
  let phase = prevPhase;
  
  if (avgKneeAngle > 160) {
    // Standing position
    phase = SQUAT_PHASES.STANDING;
  } else if (avgKneeAngle < 110 && hipHeight > (prevHipHeight || 0)) {
    // Descending phase (hip height increasing as we go down)
    phase = SQUAT_PHASES.DESCENDING;
  } else if (avgKneeAngle < 110 && hipHeight < (prevHipHeight || 1)) {
    // Ascending phase (hip height decreasing as we go up)
    phase = SQUAT_PHASES.ASCENDING;
  }
  
  // Bottom position is the lowest point of the squat
  if (phase === SQUAT_PHASES.DESCENDING && prevPhase === SQUAT_PHASES.DESCENDING && 
      hipHeight < (prevHipHeight || 1)) {
    phase = SQUAT_PHASES.BOTTOM;
  }
  
  return { phase, hipHeight };
};

// Evaluate squat form based on the current phase
export const evaluateSquatForm = (landmarks, phase) => {
  const namedLandmarks = getNamedLandmarks(landmarks);
  if (!namedLandmarks) return { isCorrect: false, issues: ['No landmarks detected'] };
  
  const { 
    leftShoulder, rightShoulder, 
    leftHip, rightHip, 
    leftKnee, rightKnee, 
    leftAnkle, rightAnkle 
  } = namedLandmarks;
  
  // Check if we have all the necessary landmarks with sufficient confidence
  const requiredLandmarks = [
    leftShoulder, rightShoulder, 
    leftHip, rightHip, 
    leftKnee, rightKnee, 
    leftAnkle, rightAnkle
  ];
  
  if (requiredLandmarks.some(landmark => !isPointVisible(landmark, THRESHOLDS.CONFIDENCE_THRESHOLD))) {
    return { isCorrect: false, issues: ['Some key landmarks not visible'] };
  }
  
  const issues = [];
  
  // Calculate angles
  const leftKneeAngle = calculate3DAngle(leftHip, leftKnee, leftAnkle);
  const rightKneeAngle = calculate3DAngle(rightHip, rightKnee, rightAnkle);
  
  const leftHipAngle = calculate3DAngle(leftShoulder, leftHip, leftKnee);
  const rightHipAngle = calculate3DAngle(rightShoulder, rightHip, rightKnee);
  
  // Calculate back angle (angle between shoulders and hips relative to vertical)
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
  
  // Vertical reference point (same x as midHip, but y is 0)
  const verticalRef = { x: midHip.x, y: 0, z: midHip.z };
  
  // Calculate back angle relative to vertical
  const backAngle = calculateAngle(verticalRef, midHip, midShoulder);
  
  // Phase-specific evaluations
  switch (phase) {
    case SQUAT_PHASES.BOTTOM:
      // Check knee angle at bottom position
      if (leftKneeAngle > THRESHOLDS.MAX_KNEE_ANGLE || rightKneeAngle > THRESHOLDS.MAX_KNEE_ANGLE) {
        issues.push('Knees not bent enough');
      }
      
      if (leftKneeAngle < THRESHOLDS.MIN_KNEE_ANGLE || rightKneeAngle < THRESHOLDS.MIN_KNEE_ANGLE) {
        issues.push('Knees bent too much');
      }
      
      // Check hip angle at bottom position
      if (leftHipAngle > THRESHOLDS.MAX_HIP_ANGLE || rightHipAngle > THRESHOLDS.MAX_HIP_ANGLE) {
        issues.push('Hips not bent enough');
      }
      
      if (leftHipAngle < THRESHOLDS.MIN_HIP_ANGLE || rightHipAngle < THRESHOLDS.MIN_HIP_ANGLE) {
        issues.push('Hips bent too much');
      }
      
      // Check back angle
      if (backAngle > THRESHOLDS.MAX_BACK_LEAN) {
        issues.push('Back leaning too far forward');
      }
      
      // Check knee position relative to toes
      if (leftKnee.z < leftAnkle.z - THRESHOLDS.MAX_KNEE_FORWARD || 
          rightKnee.z < rightAnkle.z - THRESHOLDS.MAX_KNEE_FORWARD) {
        issues.push('Knees too far forward of toes');
      }
      
      // Check knee alignment (knees should track over toes)
      if (Math.abs(leftKnee.x - leftAnkle.x) > THRESHOLDS.MAX_KNEE_INWARD || 
          Math.abs(rightKnee.x - rightAnkle.x) > THRESHOLDS.MAX_KNEE_INWARD) {
        issues.push('Knees not aligned with toes');
      }
      break;
      
    case SQUAT_PHASES.DESCENDING:
    case SQUAT_PHASES.ASCENDING:
      // Check back angle during movement
      if (backAngle > THRESHOLDS.MAX_BACK_LEAN) {
        issues.push('Back leaning too far forward');
      }
      
      // Check knee alignment during movement
      if (Math.abs(leftKnee.x - leftAnkle.x) > THRESHOLDS.MAX_KNEE_INWARD || 
          Math.abs(rightKnee.x - rightAnkle.x) > THRESHOLDS.MAX_KNEE_INWARD) {
        issues.push('Knees not aligned with toes');
      }
      break;
      
    case SQUAT_PHASES.STANDING:
      // Check if fully extended at top
      if (leftKneeAngle < 160 || rightKneeAngle < 160) {
        issues.push('Not fully standing between reps');
      }
      
      // Check if back is upright
      if (backAngle > 20) {
        issues.push('Not standing upright between reps');
      }
      break;
  }
  
  return {
    isCorrect: issues.length === 0,
    issues,
    angles: {
      leftKnee: leftKneeAngle,
      rightKnee: rightKneeAngle,
      leftHip: leftHipAngle,
      rightHip: rightHipAngle,
      back: backAngle
    }
  };
};
