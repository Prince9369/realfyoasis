/**
 * Utility functions for pose detection and analysis
 */

// Calculate the angle between three points (in radians)
export const calculateAngle = (a, b, c) => {
  // Convert to radians
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs(radians * 180.0 / Math.PI);
  
  // Ensure the angle is between 0 and 180 degrees
  if (angle > 180.0) {
    angle = 360.0 - angle;
  }
  
  return angle;
};

// Calculate the angle between three 3D points (in radians)
export const calculate3DAngle = (a, b, c) => {
  // Vectors
  const vectorBA = {
    x: a.x - b.x,
    y: a.y - b.y,
    z: a.z - b.z
  };
  
  const vectorBC = {
    x: c.x - b.x,
    y: c.y - b.y,
    z: c.z - b.z
  };
  
  // Dot product
  const dotProduct = vectorBA.x * vectorBC.x + vectorBA.y * vectorBC.y + vectorBA.z * vectorBC.z;
  
  // Magnitudes
  const magnitudeBA = Math.sqrt(vectorBA.x * vectorBA.x + vectorBA.y * vectorBA.y + vectorBA.z * vectorBA.z);
  const magnitudeBC = Math.sqrt(vectorBC.x * vectorBC.x + vectorBC.y * vectorBC.y + vectorBC.z * vectorBC.z);
  
  // Angle in radians
  const angle = Math.acos(dotProduct / (magnitudeBA * magnitudeBC));
  
  // Convert to degrees
  return angle * 180.0 / Math.PI;
};

// Calculate the distance between two points
export const calculateDistance = (a, b) => {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
};

// Calculate the distance between two 3D points
export const calculate3DDistance = (a, b) => {
  return Math.sqrt(
    Math.pow(b.x - a.x, 2) + 
    Math.pow(b.y - a.y, 2) + 
    Math.pow(b.z - a.z, 2)
  );
};

// Check if a point is visible (has high enough confidence)
export const isPointVisible = (point, minConfidence = 0.5) => {
  return point && point.visibility > minConfidence;
};

// Get the midpoint between two points
export const getMidpoint = (a, b) => {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    z: (a.z + b.z) / 2,
    visibility: Math.min(a.visibility, b.visibility)
  };
};

// Map MediaPipe pose landmarks to more readable names
export const landmarkIndices = {
  nose: 0,
  leftEye: 1,
  rightEye: 2,
  leftEar: 3,
  rightEar: 4,
  leftShoulder: 5,
  rightShoulder: 6,
  leftElbow: 7,
  rightElbow: 8,
  leftWrist: 9,
  rightWrist: 10,
  leftHip: 11,
  rightHip: 12,
  leftKnee: 13,
  rightKnee: 14,
  leftAnkle: 15,
  rightAnkle: 16
};

// Get named landmarks from the pose landmarks array
export const getNamedLandmarks = (landmarks) => {
  if (!landmarks || landmarks.length === 0) return null;
  
  const named = {};
  Object.entries(landmarkIndices).forEach(([name, index]) => {
    named[name] = landmarks[index];
  });
  
  return named;
};
