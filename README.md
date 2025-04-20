# RealFy AI Exercise Evaluation

A real-time, browser-based fitness application that uses AI to evaluate exercise form for squats and push-ups. This project was developed as part of the Realfy Oasis internship application process.

![RealFy AI Exercise Evaluation](screenshot.png)

## Demo

[Live Demo](https://your-deployment-url.com) | [Demo Video](https://your-video-url.com)

## Features

- **Real-time Pose Detection**: Uses MediaPipe Pose Landmarker for accurate pose tracking
- **Exercise Selection**: Choose between squats and push-ups
- **Form Evaluation**: Analyzes your form in real-time and provides feedback
- **Visual Feedback**: Color-coded keypoints and connections (red for incorrect form, green for correct form)
- **3D Visualization**: Three.js visualization with reference poses and annotations explaining form issues
- **Phase Detection**: Automatically detects different phases of exercises (standing, descending, bottom, ascending)
- **Detailed Feedback**: Provides specific feedback on form issues with joint angles
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
The app uses MediaPipe's Pose Landmarker model to detect 33 key points on the human body in real-time. These landmarks are used to calculate joint angles and body positions.

### Phase Detection
The application automatically detects different phases of each exercise:
- **Squats**: Standing, Descending, Bottom, Ascending
- **Push-Ups**: Top, Descending, Bottom, Ascending

### Exercise Evaluation
- **Squats**:
  - Knee angle (should be 70-100° at bottom position)
  - Hip angle (should be 70-110° at bottom position)
  - Back angle (should not lean forward more than 45°)
  - Knee alignment (knees should track over toes)
  - Depth (hips should lower enough for proper form)

- **Push-Ups**:
  - Elbow angle (should be 70-100° at bottom position)
  - Back alignment (should maintain a straight line)
  - Neck position (should remain neutral)
  - Depth (chest should lower enough for proper form)

### Visual Feedback
- Green keypoints and connections indicate correct form
- Red keypoints and connections indicate incorrect form
- 3D visualization with reference poses showing ideal form
- Text annotations explaining specific issues
- Joint angle measurements displayed for detailed analysis

### 3D Visualization
The Three.js visualization provides:
- Real-time 3D representation of your pose
- Reference pose showing ideal form for comparison
- Color-coded feedback (red for issues, blue for reference)
- Interactive view (drag to rotate, scroll to zoom)

## Project Structure

```
src/
├── App.jsx                 # Main application component
├── components/
│   ├── ExerciseSelector.jsx # Exercise selection UI
│   ├── FeedbackDisplay.jsx  # Form feedback display
│   ├── PoseDetector.jsx     # Camera and pose detection
│   └── ThreeJsVisualizer.jsx # 3D visualization
├── utils/
│   ├── poseUtils.js         # Utility functions for pose analysis
│   ├── pushupRules.js       # Push-up evaluation rules
│   └── squatRules.js        # Squat evaluation rules
└── main.jsx                # Entry point
```

## Deployment

This application can be deployed to various hosting platforms:

### GitHub Pages
```bash
npm install --save-dev gh-pages
```

Add to package.json:
```json
"homepage": "https://yourusername.github.io/realfyoasis",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

Deploy with:
```bash
npm run deploy
```

### Vercel or Netlify
Connect your GitHub repository to Vercel or Netlify for automatic deployments.

## Future Improvements

- Add more exercises (lunges, planks, etc.)
- Implement rep counting and workout tracking
- Add user profiles and progress history
- Improve mobile performance and offline capabilities
- Add audio feedback for hands-free operation

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [MediaPipe](https://mediapipe.dev/) for the pose detection model
- [Three.js](https://threejs.org/) for 3D visualization
- [React](https://reactjs.org/) for the frontend framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Realfy Oasis](https://realfy.in/) for the internship opportunity