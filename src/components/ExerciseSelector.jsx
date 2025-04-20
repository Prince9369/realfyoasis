import React from 'react';

const ExerciseSelector = ({ onSelectExercise, isDetecting }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-6">
      <h1 className="text-3xl font-bold text-center">
        AI Exercise Evaluation
      </h1>
      <p className="text-center text-gray-600 max-w-md">
        Choose an exercise to begin real-time evaluation of your form using AI.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <button
          onClick={() => onSelectExercise('squat')}
          disabled={isDetecting}
          className={`px-6 py-3 rounded-lg text-white font-semibold transition-all
            ${isDetecting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          Start Squats
        </button>
        
        <button
          onClick={() => onSelectExercise('pushup')}
          disabled={isDetecting}
          className={`px-6 py-3 rounded-lg text-white font-semibold transition-all
            ${isDetecting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
        >
          Start Push-Ups
        </button>
      </div>
      
      {isDetecting && (
        <button
          onClick={() => onSelectExercise(null)}
          className="px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-all"
        >
          Stop Detection
        </button>
      )}
    </div>
  );
};

export default ExerciseSelector;
