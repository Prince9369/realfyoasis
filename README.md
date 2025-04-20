# RealFy AI Exercise Evaluation

A real-time, browser-based fitness application that uses AI to evaluate exercise form for squats and push-ups.

## Features

- **Real-time Pose Detection**: Uses MediaPipe Pose Landmarker for accurate pose tracking
- **Exercise Selection**: Choose between squats and push-ups
- **Form Evaluation**: Analyzes your form in real-time and provides feedback
- **Visual Feedback**: Color-coded keypoints and connections (red for incorrect form, green for correct form)
- **3D Visualization**: Three.js visualization with annotations explaining form issues
- **Mobile Responsive**: Works on mobile browsers with webcam access

## Technologies Used

- **Frontend**: React with Vite
- **Styling**: Tailwind CSS
- **Pose Detection**: MediaPipe Pose Landmarker
- **3D Visualization**: Three.js

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/realfyoasis.git
cd realfyoasis
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

1. Allow camera access when prompted
2. Select an exercise (Squats or Push-Ups)
3. Position yourself in the camera view
4. Perform the exercise and receive real-time feedback
5. Use the 3D visualization to understand form issues

## How It Works

### Pose Detection
The app uses MediaPipe's Pose Landmarker model to detect 33 key points on the human body in real-time.

### Exercise Evaluation
- **Squats**: Evaluates knee angle, hip angle, back angle, and knee alignment
- **Push-Ups**: Evaluates elbow angle, back alignment, and neck position

### Visual Feedback
- Green keypoints and connections indicate correct form
- Red keypoints and connections indicate incorrect form
- 3D visualization with annotations explaining specific issues

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [MediaPipe](https://mediapipe.dev/) for the pose detection model
- [Three.js](https://threejs.org/) for 3D visualization
- [React](https://reactjs.org/) for the frontend framework
- [Tailwind CSS](https://tailwindcss.com/) for styling