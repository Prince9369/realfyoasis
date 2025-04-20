import React from 'react';
import { SQUAT_PHASES } from '../utils/squatRules';
import { PUSHUP_PHASES } from '../utils/pushupRules';

const FeedbackDisplay = ({ exerciseType, phase, evaluation }) => {
  const getPhaseDescription = () => {
    if (exerciseType === 'squat') {
      switch (phase) {
        case SQUAT_PHASES.STANDING:
          return 'Stand with feet shoulder-width apart, toes slightly turned out';
        case SQUAT_PHASES.DESCENDING:
          return 'Bend knees and push hips back, keeping chest up';
        case SQUAT_PHASES.BOTTOM:
          return 'Lower until thighs are parallel to ground, knees tracking over toes';
        case SQUAT_PHASES.ASCENDING:
          return 'Push through heels to return to standing position';
        default:
          return '';
      }
    } else if (exerciseType === 'pushup') {
      switch (phase) {
        case PUSHUP_PHASES.TOP:
          return 'Start in plank position with arms extended, body in straight line';
        case PUSHUP_PHASES.DESCENDING:
          return 'Lower body by bending elbows, keeping them close to body';
        case PUSHUP_PHASES.BOTTOM:
          return 'Lower until chest is near ground, elbows at about 90 degrees';
        case PUSHUP_PHASES.ASCENDING:
          return 'Push back up to starting position, maintaining body alignment';
        default:
          return '';
      }
    }
    return '';
  };

  const getExerciseTips = () => {
    if (exerciseType === 'squat') {
      return [
        'Keep your chest up and back straight',
        'Push your knees out in line with your toes',
        'Distribute weight through your heels',
        'Maintain a neutral spine position',
        'Descend to proper depth (thighs parallel to ground)'
      ];
    } else if (exerciseType === 'pushup') {
      return [
        'Keep your body in a straight line from head to heels',
        'Position hands slightly wider than shoulder-width',
        'Keep elbows at about 45° angle to your body',
        'Lower until chest is about an inch from the ground',
        'Maintain a neutral neck position (don\'t look up or down)'
      ];
    }
    return [];
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <h2 className="text-xl font-bold mb-2">
        {exerciseType === 'squat' ? 'Squat' : 'Push-Up'} Evaluation
      </h2>
      
      <div className="mb-4">
        <h3 className="font-semibold text-gray-700">Current Phase:</h3>
        <div className="flex items-center mt-1">
          <div className={`w-3 h-3 rounded-full mr-2 ${phase ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
          <p className="text-sm">{phase}</p>
        </div>
        <p className="text-sm text-gray-600 mt-1">{getPhaseDescription()}</p>
      </div>
      
      <div className="mb-4">
        <h3 className="font-semibold text-gray-700">Form Check:</h3>
        <div className="flex items-center mt-1">
          <div className={`w-3 h-3 rounded-full mr-2 ${evaluation.isCorrect ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <p className="text-sm">{evaluation.isCorrect ? 'Good form' : 'Form needs correction'}</p>
        </div>
      </div>
      
      {evaluation.issues && evaluation.issues.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold text-gray-700">Issues to Fix:</h3>
          <ul className="list-disc list-inside text-sm text-red-600 mt-1">
            {evaluation.issues.map((issue, index) => (
              <li key={index}>{issue}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div>
        <h3 className="font-semibold text-gray-700">Tips for Perfect Form:</h3>
        <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
          {getExerciseTips().map((tip, index) => (
            <li key={index}>{tip}</li>
          ))}
        </ul>
      </div>
      
      {evaluation.angles && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h3 className="font-semibold text-gray-700">Joint Angles:</h3>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {Object.entries(evaluation.angles).map(([key, value]) => (
              <div key={key} className="text-xs">
                <span className="font-medium">{key}: </span>
                <span>{Math.round(value)}°</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackDisplay;
