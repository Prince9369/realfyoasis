import { useState } from 'react';
import ExerciseSelector from './components/ExerciseSelector';
import PoseDetector from './components/PoseDetector';

function App() {
  const [selectedExercise, setSelectedExercise] = useState(null);

  const handleExerciseSelection = (exercise) => {
    setSelectedExercise(exercise);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">RealFy AI Exercise Evaluation</h1>
        </div>
      </header>

      <main className="container mx-auto p-4 flex flex-col items-center justify-center" style={{ minHeight: '70vh' }}>
        {selectedExercise ? (
          <PoseDetector
            exerciseType={selectedExercise}
            onStopDetection={() => setSelectedExercise(null)}
          />
        ) : (
          <ExerciseSelector
            onSelectExercise={handleExerciseSelection}
            isDetecting={!!selectedExercise}
          />
        )}
      </main>

      <footer className="bg-gray-800 text-white p-4 mt-auto">
        <div className="container mx-auto text-center">
          <p>© 2025 RealFy AI Exercise Evaluation</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
