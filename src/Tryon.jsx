import React, { useRef, useEffect } from "react";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";
import "@tensorflow/tfjs-backend-webgl";

const TryOn = ({ lensColor }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  let model = null;
  let animationId = null;

  useEffect(() => {
    startCamera();
    loadModel();

    return () => cancelAnimationFrame(animationId);
  }, []);

  // 🎥 Start Camera
  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
    });
    videoRef.current.srcObject = stream;
  };

  // 🤖 Load Model
  const loadModel = async () => {
    model = await faceLandmarksDetection.load(
      faceLandmarksDetection.SupportedPackages.mediapipeFacemesh
    );
    detect();
  };

  // 🔁 Continuous Detection (smooth)
  const detect = async () => {
    const ctx = canvasRef.current.getContext("2d");

    const render = async () => {
      if (videoRef.current.readyState === 4 && model) {
        const video = videoRef.current;

        canvasRef.current.width = video.videoWidth;
        canvasRef.current.height = video.videoHeight;

        // draw video
        ctx.drawImage(video, 0, 0);

        const predictions = await model.estimateFaces({
          input: video,
        });

        if (predictions.length > 0) {
          const keypoints = predictions[0].scaledMesh;

          drawLens(ctx, keypoints, [468, 469, 470, 471, 472]);
          drawLens(ctx, keypoints, [473, 474, 475, 476, 477]);
        }
      }

      animationId = requestAnimationFrame(render);
    };

    render();
  };

  // 🎨 DRAW LENS (FIXED VERSION)
  const drawLens = (ctx, keypoints, irisPoints) => {
    const points = irisPoints.map((i) => keypoints[i]);

    // get center
    const centerX =
      points.reduce((sum, p) => sum + p[0], 0) / points.length;
    const centerY =
      points.reduce((sum, p) => sum + p[1], 0) / points.length;

    // radius
    const radius =
      Math.hypot(points[0][0] - centerX, points[0][1] - centerY) * 1.5;

    // 🔥 create gradient (REALISTIC)
    const gradient = ctx.createRadialGradient(
      centerX,
      centerY,
      radius * 0.2,
      centerX,
      centerY,
      radius
    );

    gradient.addColorStop(0, "transparent");
    gradient.addColorStop(0.4, lensColor || "rgba(0,150,255,0.4)");
    gradient.addColorStop(1, "transparent");

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // 🔥 blend mode for realism
    ctx.globalCompositeOperation = "multiply";
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  };

  return (
    <div className="relative w-full">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="hidden"
      />

      <canvas
        ref={canvasRef}
        className="w-full h-auto rounded-xl"
      />
    </div>
  );
};

export default TryOn;