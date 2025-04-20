import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const ThreeJsVisualizer = ({ landmarks, evaluation, exerciseType, phase }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const pointsRef = useRef([]);
  const linesRef = useRef([]);
  const annotationsRef = useRef([]);
  const referencePoseRef = useRef([]);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111); // Darker background for better contrast
    sceneRef.current = scene;

    // Ensure container has dimensions
    if (containerRef.current.clientWidth === 0 || containerRef.current.clientHeight === 0) {
      // Force minimum dimensions if container is not visible or has no size
      containerRef.current.style.width = '100%';
      containerRef.current.style.height = '250px';
      containerRef.current.style.display = 'block';
    }

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight || 2, // Fallback aspect ratio
      0.1,
      1000
    );
    camera.position.set(0, -0.5, 2.5); // Position camera closer for better view of the full body
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.autoRotate = false;
    controls.target.set(0, -0.5, 0); // Set the target to the center of the body
    controls.autoRotateSpeed = 1.0;
    controlsRef.current = controls;

    // Add grid
    const gridHelper = new THREE.GridHelper(2, 10, 0x444444, 0x222222);
    gridHelper.rotation.x = Math.PI / 2;
    scene.add(gridHelper);

    // Add a floor plane for better orientation
    const floorGeometry = new THREE.PlaneGeometry(4, 4);
    const floorMaterial = new THREE.MeshBasicMaterial({
      color: 0x111111,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = Math.PI / 2;
    floor.position.y = 0.01; // Slightly above the grid to avoid z-fighting
    scene.add(floor);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 1, 1);
    scene.add(directionalLight);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      if (controlsRef.current) controlsRef.current.update();
      if (rendererRef.current && cameraRef.current && sceneRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;

      cameraRef.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }

      // Clean up points, lines, and reference pose
      if (sceneRef.current) {
        pointsRef.current.forEach(point => sceneRef.current.remove(point));
        linesRef.current.forEach(line => sceneRef.current.remove(line));
        annotationsRef.current.forEach(annotation => sceneRef.current.remove(annotation));
        referencePoseRef.current.forEach(ref => sceneRef.current.remove(ref));
      }
    };
  }, []);

  // Add a reference pose based on exercise type and phase
  const addReferencePose = () => {
    if (!sceneRef.current || !exerciseType || !phase) {
      return;
    }

    // Clear previous reference pose
    referencePoseRef.current.forEach(ref => sceneRef.current.remove(ref));
    referencePoseRef.current = [];

    // Create material for reference pose
    const referenceMaterial = new THREE.MeshBasicMaterial({ color: 0x4287f5, transparent: true, opacity: 0.7 });

    // Position offset for reference pose (to the right of the user's pose)
    // Use a smaller offset to keep it in view
    const offsetX = 0.8;

    // Create reference pose based on exercise type and phase
    if (exerciseType === 'squat') {
      // Define landmark positions for different squat phases
      let landmarks = [];

      switch(phase) {
        case 'standing':
          // Standing position
          landmarks = [
            { x: 0.5, y: 0.2, z: 0 },  // Nose
            { x: 0.5, y: 0.25, z: 0 }, // Left eye
            { x: 0.5, y: 0.25, z: 0 }, // Right eye
            { x: 0.5, y: 0.3, z: 0 },  // Left ear
            { x: 0.5, y: 0.3, z: 0 },  // Right ear
            { x: 0.5, y: 0.35, z: 0 }, // Mouth left
            { x: 0.5, y: 0.35, z: 0 }, // Mouth right
            { x: 0.4, y: 0.4, z: 0 },  // Left shoulder
            { x: 0.6, y: 0.4, z: 0 },  // Right shoulder
            { x: 0.35, y: 0.55, z: 0 }, // Left elbow
            { x: 0.65, y: 0.55, z: 0 }, // Right elbow
            { x: 0.4, y: 0.7, z: 0 },  // Left wrist
            { x: 0.6, y: 0.7, z: 0 },  // Right wrist
            { x: 0.4, y: 0.7, z: 0 },  // Left pinky
            { x: 0.6, y: 0.7, z: 0 },  // Right pinky
            { x: 0.4, y: 0.7, z: 0 },  // Left index
            { x: 0.6, y: 0.7, z: 0 },  // Right index
            { x: 0.4, y: 0.7, z: 0 },  // Left thumb
            { x: 0.6, y: 0.7, z: 0 },  // Right thumb
            { x: 0.4, y: 0.7, z: 0 },  // Left hip
            { x: 0.6, y: 0.7, z: 0 },  // Right hip
            { x: 0.4, y: 0.9, z: 0 },  // Left knee
            { x: 0.6, y: 0.9, z: 0 },  // Right knee
            { x: 0.4, y: 1.1, z: 0 },  // Left ankle
            { x: 0.6, y: 1.1, z: 0 },  // Right ankle
            { x: 0.4, y: 1.15, z: 0 }, // Left heel
            { x: 0.6, y: 1.15, z: 0 }, // Right heel
            { x: 0.4, y: 1.2, z: 0 },  // Left foot index
            { x: 0.6, y: 1.2, z: 0 },  // Right foot index
          ];
          break;

        case 'bottom':
          // Bottom squat position
          landmarks = [
            { x: 0.5, y: 0.4, z: 0 },  // Nose
            { x: 0.5, y: 0.45, z: 0 }, // Left eye
            { x: 0.5, y: 0.45, z: 0 }, // Right eye
            { x: 0.5, y: 0.5, z: 0 },  // Left ear
            { x: 0.5, y: 0.5, z: 0 },  // Right ear
            { x: 0.5, y: 0.55, z: 0 }, // Mouth left
            { x: 0.5, y: 0.55, z: 0 }, // Mouth right
            { x: 0.4, y: 0.6, z: 0 },  // Left shoulder
            { x: 0.6, y: 0.6, z: 0 },  // Right shoulder
            { x: 0.35, y: 0.7, z: 0 }, // Left elbow
            { x: 0.65, y: 0.7, z: 0 }, // Right elbow
            { x: 0.4, y: 0.8, z: 0 },  // Left wrist
            { x: 0.6, y: 0.8, z: 0 },  // Right wrist
            { x: 0.4, y: 0.8, z: 0 },  // Left pinky
            { x: 0.6, y: 0.8, z: 0 },  // Right pinky
            { x: 0.4, y: 0.8, z: 0 },  // Left index
            { x: 0.6, y: 0.8, z: 0 },  // Right index
            { x: 0.4, y: 0.8, z: 0 },  // Left thumb
            { x: 0.6, y: 0.8, z: 0 },  // Right thumb
            { x: 0.4, y: 0.9, z: 0 },  // Left hip
            { x: 0.6, y: 0.9, z: 0 },  // Right hip
            { x: 0.4, y: 1.0, z: 0 },  // Left knee
            { x: 0.6, y: 1.0, z: 0 },  // Right knee
            { x: 0.4, y: 1.1, z: 0 },  // Left ankle
            { x: 0.6, y: 1.1, z: 0 },  // Right ankle
            { x: 0.4, y: 1.15, z: 0 }, // Left heel
            { x: 0.6, y: 1.15, z: 0 }, // Right heel
            { x: 0.4, y: 1.2, z: 0 },  // Left foot index
            { x: 0.6, y: 1.2, z: 0 },  // Right foot index
          ];
          break;

        case 'descending':
        case 'ascending':
          // Intermediate position
          landmarks = [
            { x: 0.5, y: 0.3, z: 0 },  // Nose
            { x: 0.5, y: 0.35, z: 0 }, // Left eye
            { x: 0.5, y: 0.35, z: 0 }, // Right eye
            { x: 0.5, y: 0.4, z: 0 },  // Left ear
            { x: 0.5, y: 0.4, z: 0 },  // Right ear
            { x: 0.5, y: 0.45, z: 0 }, // Mouth left
            { x: 0.5, y: 0.45, z: 0 }, // Mouth right
            { x: 0.4, y: 0.5, z: 0 },  // Left shoulder
            { x: 0.6, y: 0.5, z: 0 },  // Right shoulder
            { x: 0.35, y: 0.65, z: 0 }, // Left elbow
            { x: 0.65, y: 0.65, z: 0 }, // Right elbow
            { x: 0.4, y: 0.75, z: 0 },  // Left wrist
            { x: 0.6, y: 0.75, z: 0 },  // Right wrist
            { x: 0.4, y: 0.75, z: 0 },  // Left pinky
            { x: 0.6, y: 0.75, z: 0 },  // Right pinky
            { x: 0.4, y: 0.75, z: 0 },  // Left index
            { x: 0.6, y: 0.75, z: 0 },  // Right index
            { x: 0.4, y: 0.75, z: 0 },  // Left thumb
            { x: 0.6, y: 0.75, z: 0 },  // Right thumb
            { x: 0.4, y: 0.8, z: 0 },  // Left hip
            { x: 0.6, y: 0.8, z: 0 },  // Right hip
            { x: 0.4, y: 0.95, z: 0 },  // Left knee
            { x: 0.6, y: 0.95, z: 0 },  // Right knee
            { x: 0.4, y: 1.1, z: 0 },  // Left ankle
            { x: 0.6, y: 1.1, z: 0 },  // Right ankle
            { x: 0.4, y: 1.15, z: 0 }, // Left heel
            { x: 0.6, y: 1.15, z: 0 }, // Right heel
            { x: 0.4, y: 1.2, z: 0 },  // Left foot index
            { x: 0.6, y: 1.2, z: 0 },  // Right foot index
          ];
          break;
      }

      // Create reference pose points and connections
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

      // Create points for landmarks with offset
      landmarks.forEach((landmark, index) => {
        if (index < 33) { // Only use standard pose landmarks
          const geometry = new THREE.SphereGeometry(0.05, 16, 16); // Larger spheres for better visibility
          const point = new THREE.Mesh(geometry, referenceMaterial);

          // Scale and position the point with offset
          point.position.set(
            (landmark.x - 0.5) * 2 + offsetX,
            -(landmark.y - 0.5) * 2,
            landmark.z * 2
          );

          sceneRef.current.add(point);
          referencePoseRef.current.push(point);
        }
      });

      // Create connections
      connections.forEach(([startIdx, endIdx]) => {
        if (startIdx < landmarks.length && endIdx < landmarks.length) {
          const startPoint = landmarks[startIdx];
          const endPoint = landmarks[endIdx];

          const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(
              (startPoint.x - 0.5) * 2 + offsetX,
              -(startPoint.y - 0.5) * 2,
              startPoint.z * 2
            ),
            new THREE.Vector3(
              (endPoint.x - 0.5) * 2 + offsetX,
              -(endPoint.y - 0.5) * 2,
              endPoint.z * 2
            )
          ]);

          const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x4287f5,
            linewidth: 3,
            transparent: true,
            opacity: 0.7
          });
          const line = new THREE.Line(geometry, lineMaterial);

          // Add a cylinder for better visibility
          const direction = new THREE.Vector3(
            (endPoint.x - startPoint.x) * 2,
            -(endPoint.y - startPoint.y) * 2,
            (endPoint.z - startPoint.z) * 2
          );
          const length = direction.length();
          direction.normalize();

          const cylinderGeometry = new THREE.CylinderGeometry(0.02, 0.02, length, 8); // Thicker cylinders for better visibility
          const cylinder = new THREE.Mesh(cylinderGeometry, referenceMaterial);

          // Position and orient the cylinder with offset
          const midpoint = new THREE.Vector3(
            ((startPoint.x + endPoint.x) / 2 - 0.5) * 2 + offsetX,
            -((startPoint.y + endPoint.y) / 2 - 0.5) * 2,
            ((startPoint.z + endPoint.z) / 2) * 2
          );
          cylinder.position.copy(midpoint);

          // Orient the cylinder to match the line direction
          cylinder.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            direction
          );

          sceneRef.current.add(cylinder);
          referencePoseRef.current.push(cylinder);
          sceneRef.current.add(line);
          referencePoseRef.current.push(line);
        }
      });

      // Add a label for the reference pose
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 256;
      canvas.height = 64;

      context.fillStyle = '#000000';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = '#4287f5';
      context.font = 'bold 24px Arial';
      context.textAlign = 'center';
      context.fillText('Ideal Form', canvas.width / 2, 40);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);

      sprite.position.set(offsetX, -0.5, 0);
      sprite.scale.set(0.5, 0.125, 1);

      sceneRef.current.add(sprite);
      referencePoseRef.current.push(sprite);
    } else if (exerciseType === 'pushup') {
      // Define landmark positions for different pushup phases
      let landmarks = [];

      switch(phase) {
        case 'top':
          // Top position (plank position with arms extended)
          landmarks = [
            { x: 0.5, y: 0.4, z: 0 },  // Nose
            { x: 0.5, y: 0.45, z: 0 }, // Left eye
            { x: 0.5, y: 0.45, z: 0 }, // Right eye
            { x: 0.5, y: 0.5, z: 0 },  // Left ear
            { x: 0.5, y: 0.5, z: 0 },  // Right ear
            { x: 0.5, y: 0.55, z: 0 }, // Mouth left
            { x: 0.5, y: 0.55, z: 0 }, // Mouth right
            { x: 0.4, y: 0.6, z: 0 },  // Left shoulder
            { x: 0.6, y: 0.6, z: 0 },  // Right shoulder
            { x: 0.3, y: 0.8, z: 0 },  // Left elbow
            { x: 0.7, y: 0.8, z: 0 },  // Right elbow
            { x: 0.2, y: 0.6, z: 0 },  // Left wrist
            { x: 0.8, y: 0.6, z: 0 },  // Right wrist
            { x: 0.2, y: 0.6, z: 0 },  // Left pinky
            { x: 0.8, y: 0.6, z: 0 },  // Right pinky
            { x: 0.2, y: 0.6, z: 0 },  // Left index
            { x: 0.8, y: 0.6, z: 0 },  // Right index
            { x: 0.2, y: 0.6, z: 0 },  // Left thumb
            { x: 0.8, y: 0.6, z: 0 },  // Right thumb
            { x: 0.4, y: 0.6, z: 0 },  // Left hip
            { x: 0.6, y: 0.6, z: 0 },  // Right hip
            { x: 0.4, y: 0.8, z: 0 },  // Left knee
            { x: 0.6, y: 0.8, z: 0 },  // Right knee
            { x: 0.4, y: 1.0, z: 0 },  // Left ankle
            { x: 0.6, y: 1.0, z: 0 },  // Right ankle
            { x: 0.4, y: 1.05, z: 0 }, // Left heel
            { x: 0.6, y: 1.05, z: 0 }, // Right heel
            { x: 0.4, y: 1.1, z: 0 },  // Left foot index
            { x: 0.6, y: 1.1, z: 0 },  // Right foot index
          ];
          break;

        case 'bottom':
          // Bottom position (lowered with elbows bent)
          landmarks = [
            { x: 0.5, y: 0.7, z: 0 },  // Nose
            { x: 0.5, y: 0.75, z: 0 }, // Left eye
            { x: 0.5, y: 0.75, z: 0 }, // Right eye
            { x: 0.5, y: 0.8, z: 0 },  // Left ear
            { x: 0.5, y: 0.8, z: 0 },  // Right ear
            { x: 0.5, y: 0.85, z: 0 }, // Mouth left
            { x: 0.5, y: 0.85, z: 0 }, // Mouth right
            { x: 0.4, y: 0.7, z: 0 },  // Left shoulder
            { x: 0.6, y: 0.7, z: 0 },  // Right shoulder
            { x: 0.3, y: 0.7, z: 0 },  // Left elbow
            { x: 0.7, y: 0.7, z: 0 },  // Right elbow
            { x: 0.2, y: 0.6, z: 0 },  // Left wrist
            { x: 0.8, y: 0.6, z: 0 },  // Right wrist
            { x: 0.2, y: 0.6, z: 0 },  // Left pinky
            { x: 0.8, y: 0.6, z: 0 },  // Right pinky
            { x: 0.2, y: 0.6, z: 0 },  // Left index
            { x: 0.8, y: 0.6, z: 0 },  // Right index
            { x: 0.2, y: 0.6, z: 0 },  // Left thumb
            { x: 0.8, y: 0.6, z: 0 },  // Right thumb
            { x: 0.4, y: 0.6, z: 0 },  // Left hip
            { x: 0.6, y: 0.6, z: 0 },  // Right hip
            { x: 0.4, y: 0.8, z: 0 },  // Left knee
            { x: 0.6, y: 0.8, z: 0 },  // Right knee
            { x: 0.4, y: 1.0, z: 0 },  // Left ankle
            { x: 0.6, y: 1.0, z: 0 },  // Right ankle
            { x: 0.4, y: 1.05, z: 0 }, // Left heel
            { x: 0.6, y: 1.05, z: 0 }, // Right heel
            { x: 0.4, y: 1.1, z: 0 },  // Left foot index
            { x: 0.6, y: 1.1, z: 0 },  // Right foot index
          ];
          break;

        case 'descending':
        case 'ascending':
          // Intermediate position
          landmarks = [
            { x: 0.5, y: 0.55, z: 0 },  // Nose
            { x: 0.5, y: 0.6, z: 0 }, // Left eye
            { x: 0.5, y: 0.6, z: 0 }, // Right eye
            { x: 0.5, y: 0.65, z: 0 },  // Left ear
            { x: 0.5, y: 0.65, z: 0 },  // Right ear
            { x: 0.5, y: 0.7, z: 0 }, // Mouth left
            { x: 0.5, y: 0.7, z: 0 }, // Mouth right
            { x: 0.4, y: 0.65, z: 0 },  // Left shoulder
            { x: 0.6, y: 0.65, z: 0 },  // Right shoulder
            { x: 0.3, y: 0.75, z: 0 }, // Left elbow
            { x: 0.7, y: 0.75, z: 0 }, // Right elbow
            { x: 0.2, y: 0.6, z: 0 },  // Left wrist
            { x: 0.8, y: 0.6, z: 0 },  // Right wrist
            { x: 0.2, y: 0.6, z: 0 },  // Left pinky
            { x: 0.8, y: 0.6, z: 0 },  // Right pinky
            { x: 0.2, y: 0.6, z: 0 },  // Left index
            { x: 0.8, y: 0.6, z: 0 },  // Right index
            { x: 0.2, y: 0.6, z: 0 },  // Left thumb
            { x: 0.8, y: 0.6, z: 0 },  // Right thumb
            { x: 0.4, y: 0.6, z: 0 },  // Left hip
            { x: 0.6, y: 0.6, z: 0 },  // Right hip
            { x: 0.4, y: 0.8, z: 0 },  // Left knee
            { x: 0.6, y: 0.8, z: 0 },  // Right knee
            { x: 0.4, y: 1.0, z: 0 },  // Left ankle
            { x: 0.6, y: 1.0, z: 0 },  // Right ankle
            { x: 0.4, y: 1.05, z: 0 }, // Left heel
            { x: 0.6, y: 1.05, z: 0 }, // Right heel
            { x: 0.4, y: 1.1, z: 0 },  // Left foot index
            { x: 0.6, y: 1.1, z: 0 },  // Right foot index
          ];
          break;
      }

      // Create reference pose points and connections
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

      // Create points for landmarks with offset
      landmarks.forEach((landmark, index) => {
        if (index < 33) { // Only use standard pose landmarks
          const geometry = new THREE.SphereGeometry(0.05, 16, 16);
          const point = new THREE.Mesh(geometry, referenceMaterial);

          // Scale and position the point with offset
          point.position.set(
            (landmark.x - 0.5) * 2 + offsetX,
            -(landmark.y - 0.5) * 2,
            landmark.z * 2
          );

          sceneRef.current.add(point);
          referencePoseRef.current.push(point);
        }
      });

      // Create connections
      connections.forEach(([startIdx, endIdx]) => {
        if (startIdx < landmarks.length && endIdx < landmarks.length) {
          const startPoint = landmarks[startIdx];
          const endPoint = landmarks[endIdx];

          const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(
              (startPoint.x - 0.5) * 2 + offsetX,
              -(startPoint.y - 0.5) * 2,
              startPoint.z * 2
            ),
            new THREE.Vector3(
              (endPoint.x - 0.5) * 2 + offsetX,
              -(endPoint.y - 0.5) * 2,
              endPoint.z * 2
            )
          ]);

          const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x4287f5,
            linewidth: 3,
            transparent: true,
            opacity: 0.7
          });
          const line = new THREE.Line(geometry, lineMaterial);

          // Add a cylinder for better visibility
          const direction = new THREE.Vector3(
            (endPoint.x - startPoint.x) * 2,
            -(endPoint.y - startPoint.y) * 2,
            (endPoint.z - startPoint.z) * 2
          );
          const length = direction.length();
          direction.normalize();

          const cylinderGeometry = new THREE.CylinderGeometry(0.02, 0.02, length, 8);
          const cylinder = new THREE.Mesh(cylinderGeometry, referenceMaterial);

          // Position and orient the cylinder with offset
          const midpoint = new THREE.Vector3(
            ((startPoint.x + endPoint.x) / 2 - 0.5) * 2 + offsetX,
            -((startPoint.y + endPoint.y) / 2 - 0.5) * 2,
            ((startPoint.z + endPoint.z) / 2) * 2
          );
          cylinder.position.copy(midpoint);

          // Orient the cylinder to match the line direction
          cylinder.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            direction
          );

          sceneRef.current.add(cylinder);
          referencePoseRef.current.push(cylinder);
          sceneRef.current.add(line);
          referencePoseRef.current.push(line);
        }
      });

      // Add a label for the reference pose
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 256;
      canvas.height = 64;

      context.fillStyle = '#000000';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = '#4287f5';
      context.font = 'bold 24px Arial';
      context.textAlign = 'center';
      context.fillText('Ideal Form', canvas.width / 2, 40);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);

      sprite.position.set(offsetX, -0.5, 0);
      sprite.scale.set(0.5, 0.125, 1);

      sceneRef.current.add(sprite);
      referencePoseRef.current.push(sprite);
    }
  };

  // Add a simple human figure as a placeholder when no landmarks are detected
  const addPlaceholderFigure = () => {
    if (!sceneRef.current) return;

    // Clear previous objects
    pointsRef.current.forEach(point => sceneRef.current.remove(point));
    linesRef.current.forEach(line => sceneRef.current.remove(line));
    annotationsRef.current.forEach(annotation => sceneRef.current.remove(annotation));

    pointsRef.current = [];
    linesRef.current = [];
    annotationsRef.current = [];

    // Create a more visible stick figure
    const material = new THREE.MeshBasicMaterial({ color: 0xff6666 }); // Brighter red color for better visibility

    // Head
    const headGeometry = new THREE.SphereGeometry(0.2, 16, 16); // Larger head
    const head = new THREE.Mesh(headGeometry, material);
    head.position.set(0, 0.7, 0);
    sceneRef.current.add(head);
    pointsRef.current.push(head);

    // Body
    const bodyGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.7, 8); // Thicker body
    const body = new THREE.Mesh(bodyGeometry, material);
    body.position.set(0, 0.2, 0);
    sceneRef.current.add(body);
    pointsRef.current.push(body);

    // Arms
    const armGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 8); // Thicker arms
    const leftArm = new THREE.Mesh(armGeometry, material);
    leftArm.position.set(-0.3, 0.3, 0);
    leftArm.rotation.z = Math.PI / 2;
    sceneRef.current.add(leftArm);
    pointsRef.current.push(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, material);
    rightArm.position.set(0.3, 0.3, 0);
    rightArm.rotation.z = -Math.PI / 2;
    sceneRef.current.add(rightArm);
    pointsRef.current.push(rightArm);

    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.6, 8);
    const leftLeg = new THREE.Mesh(legGeometry, material);
    leftLeg.position.set(-0.15, -0.3, 0);
    sceneRef.current.add(leftLeg);
    pointsRef.current.push(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, material);
    rightLeg.position.set(0.15, -0.3, 0);
    sceneRef.current.add(rightLeg);
    pointsRef.current.push(rightLeg);

    // Add a text label
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 220; // Increased height to fit additional text

    context.fillStyle = '#000000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#ffffff';
    context.font = 'bold 32px Arial';
    context.textAlign = 'center';
    context.fillText('Position yourself in the camera view', canvas.width / 2, 50);
    context.fillText('to see pose evaluation', canvas.width / 2, 90);

    // Add more helpful instructions
    context.font = 'bold 24px Arial';
    context.fillStyle = '#ff9900';
    context.fillText('Make sure your full body is visible', canvas.width / 2, 140);
    context.fillText('Stand about 2-3 meters from camera', canvas.width / 2, 180);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);

    sprite.position.set(0, 1.2, 0);
    sprite.scale.set(1, 0.43, 1); // Adjusted scale for taller canvas

    sceneRef.current.add(sprite);
    annotationsRef.current.push(sprite);
  };

  // Update visualization when landmarks or evaluation changes
  useEffect(() => {
    if (!sceneRef.current) return;

    // Clear previous points, lines, and annotations
    pointsRef.current.forEach(point => sceneRef.current.remove(point));
    linesRef.current.forEach(line => sceneRef.current.remove(line));
    annotationsRef.current.forEach(annotation => sceneRef.current.remove(annotation));

    pointsRef.current = [];
    linesRef.current = [];
    annotationsRef.current = [];

    // Add reference pose if we have valid landmarks
    if (landmarks && landmarks.length > 0) {
      try {
        addReferencePose();
      } catch (error) {
        console.error('Error adding reference pose:', error);
      }
    }

    if (!landmarks || landmarks.length === 0) {
      // Add placeholder figure if no landmarks are detected
      addPlaceholderFigure();

      // Also add a reference pose even when no landmarks are detected
      // This helps users see what they should look like
      try {
        if (exerciseType && phase) {
          addReferencePose();
        }
      } catch (error) {
        console.error('Error adding reference pose in placeholder mode:', error);
      }

      return;
    }

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

    // Create material for points and lines
    const correctMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const incorrectMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const material = evaluation.isCorrect ? correctMaterial : incorrectMaterial;

    // Create points for landmarks
    landmarks.forEach((landmark) => {
      if (landmark.visibility > 0.5) {
        const geometry = new THREE.SphereGeometry(0.05, 16, 16); // Further increased size for better visibility
        const point = new THREE.Mesh(geometry, material);

        // Scale and position the point
        point.position.set(
          (landmark.x - 0.5) * 2,
          -(landmark.y - 0.5) * 2,
          landmark.z * 2
        );

        sceneRef.current.add(point);
        pointsRef.current.push(point);
      }
    });

    // Create lines for connections
    connections.forEach(([startIdx, endIdx]) => {
      if (startIdx < landmarks.length && endIdx < landmarks.length) {
        const startPoint = landmarks[startIdx];
        const endPoint = landmarks[endIdx];

        if (startPoint.visibility > 0.5 && endPoint.visibility > 0.5) {
          const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(
              (startPoint.x - 0.5) * 2,
              -(startPoint.y - 0.5) * 2,
              startPoint.z * 2
            ),
            new THREE.Vector3(
              (endPoint.x - 0.5) * 2,
              -(endPoint.y - 0.5) * 2,
              endPoint.z * 2
            )
          ]);

          // Use LineBasicMaterial with linewidth for thicker lines
          const lineMaterial = new THREE.LineBasicMaterial({
            color: evaluation.isCorrect ? 0x00ff00 : 0xff0000,
            linewidth: 3 // Note: linewidth may not work in WebGL, but we'll set it anyway
          });
          const line = new THREE.Line(geometry, lineMaterial);

          // Add a thin cylinder along the same path for better visibility
          const direction = new THREE.Vector3(
            (endPoint.x - startPoint.x) * 2,
            -(endPoint.y - startPoint.y) * 2,
            (endPoint.z - startPoint.z) * 2
          );
          const length = direction.length();
          direction.normalize();

          const cylinderGeometry = new THREE.CylinderGeometry(0.02, 0.02, length, 8); // Thicker cylinders for better visibility
          const cylinder = new THREE.Mesh(cylinderGeometry, material);

          // Position and orient the cylinder
          const midpoint = new THREE.Vector3(
            ((startPoint.x + endPoint.x) / 2 - 0.5) * 2,
            -((startPoint.y + endPoint.y) / 2 - 0.5) * 2,
            ((startPoint.z + endPoint.z) / 2) * 2
          );
          cylinder.position.copy(midpoint);

          // Orient the cylinder to match the line direction
          cylinder.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            direction
          );

          sceneRef.current.add(cylinder);
          linesRef.current.push(cylinder);
          sceneRef.current.add(line);
          linesRef.current.push(line);
        }
      }
    });

    // Add annotations for issues
    if (evaluation.issues && evaluation.issues.length > 0) {
      // Determine which body parts to annotate based on issues
      const issueKeywords = {
        knee: [13, 14, 23, 24], // Left and right knees
        back: [11, 12, 23, 24], // Shoulders and hips
        elbow: [7, 8], // Left and right elbows
        hip: [23, 24], // Left and right hips
        neck: [0, 1, 2] // Nose and eyes
      };

      evaluation.issues.forEach((issue) => {
        let targetIndices = [];

        // Determine which body part the issue refers to
        Object.entries(issueKeywords).forEach(([keyword, indices]) => {
          if (issue.toLowerCase().includes(keyword)) {
            targetIndices = [...targetIndices, ...indices];
          }
        });

        // If no specific body part is identified, use a default position
        if (targetIndices.length === 0) {
          targetIndices = [0]; // Default to nose
        }

        // Calculate average position of target landmarks
        const validTargets = targetIndices
          .filter(idx => idx < landmarks.length && landmarks[idx].visibility > 0.5)
          .map(idx => landmarks[idx]);

        if (validTargets.length > 0) {
          const avgX = validTargets.reduce((sum, lm) => sum + lm.x, 0) / validTargets.length;
          const avgY = validTargets.reduce((sum, lm) => sum + lm.y, 0) / validTargets.length;
          const avgZ = validTargets.reduce((sum, lm) => sum + lm.z, 0) / validTargets.length;

          // Create text sprite for annotation
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = 512; // Larger canvas for better visibility
          canvas.height = 256;

          context.fillStyle = '#000000';
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.fillStyle = '#ff0000';
          context.font = 'bold 32px Arial'; // Larger, bolder font

          // Wrap text to fit canvas
          const words = issue.split(' ');
          let line = '';
          let lines = [];
          let y = 24;

          for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = context.measureText(testLine);
            const testWidth = metrics.width;

            if (testWidth > canvas.width - 20 && i > 0) {
              lines.push(line);
              line = words[i] + ' ';
            } else {
              line = testLine;
            }
          }
          lines.push(line);

          // Draw text
          lines.forEach((line, i) => {
            context.fillText(line, 10, y + i * 26);
          });

          // Create sprite
          const texture = new THREE.CanvasTexture(canvas);
          const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
          const sprite = new THREE.Sprite(spriteMaterial);

          // Position sprite near the target landmarks
          sprite.position.set(
            (avgX - 0.5) * 2,
            -(avgY - 0.5) * 2 - 0.5, // Position further away for better visibility
            avgZ * 2 + 0.5 // Move forward in z-axis to be more visible
          );

          sprite.scale.set(0.8, 0.4, 1); // Larger scale for better visibility

          sceneRef.current.add(sprite);
          annotationsRef.current.push(sprite);

          // Add arrow pointing to the issue
          const arrowGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(
              (avgX - 0.5) * 2,
              -(avgY - 0.5) * 2 - 0.3, // Start further away
              avgZ * 2 + 0.3 // Start further in front
            ),
            new THREE.Vector3(
              (avgX - 0.5) * 2,
              -(avgY - 0.5) * 2,
              avgZ * 2
            )
          ]);

          const arrowMaterial = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 5 }); // Even thicker line for better visibility
          const arrow = new THREE.Line(arrowGeometry, arrowMaterial);

          // Add a sphere at the end of the arrow to make it more visible
          const sphereGeometry = new THREE.SphereGeometry(0.07, 16, 16); // Larger sphere for better visibility
          const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
          const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
          sphere.position.set((avgX - 0.5) * 2, -(avgY - 0.5) * 2, avgZ * 2);
          sceneRef.current.add(sphere);
          annotationsRef.current.push(sphere);

          sceneRef.current.add(arrow);
          annotationsRef.current.push(arrow);
        }
      });
    }

  }, [landmarks, evaluation]);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-gray-700">3D Visualization</h3>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full mr-1 bg-red-500"></div>
          <span className="text-xs text-gray-600 mr-3">Your Pose</span>
          <div className="w-3 h-3 rounded-full mr-1 bg-blue-500"></div>
          <span className="text-xs text-gray-600">Ideal Pose</span>
        </div>
      </div>
      <div
        ref={containerRef}
        className="w-full h-96 bg-gray-800 rounded"
        style={{ minHeight: '400px', display: 'block' }}
      >
        {/* Three.js will render here */}
      </div>
      <div className="flex justify-between items-center mt-2">
        <p className="text-xs text-gray-500">
          Drag to rotate, scroll to zoom
        </p>
        <p className="text-xs font-medium text-blue-600">
          Compare your form (red) with the ideal form (blue)
        </p>
      </div>
    </div>
  );
};

export default ThreeJsVisualizer;
