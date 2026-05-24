// import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

// const CANVAS_WIDTH = 1280;
// const CANVAS_HEIGHT = 720;

// const FACE_MESH_SCRIPT =
//   "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js";

// const FACE_MESH_ASSET_PATH =
//   "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh";

// const LENS_OPTIONS = [
//   {
//     id: "natural-hazel",
//     name: "Natural Hazel",
//     color: "#9b6a2f",
//     ring: "#3a2414",
//     price: "PKR 4,800",
//   },
//   {
//     id: "crystal-gray",
//     name: "Crystal Gray",
//     color: "#aeb6bd",
//     ring: "#35404a",
//     price: "PKR 5,200",
//   },
//   {
//     id: "ocean-blue",
//     name: "Ocean Blue",
//     color: "#4aa3ff",
//     ring: "#123455",
//     price: "PKR 5,500",
//   },
//   {
//     id: "emerald-green",
//     name: "Emerald Green",
//     color: "#2fbf71",
//     ring: "#0d3b24",
//     price: "PKR 5,900",
//   },
//   {
//     id: "honey-brown",
//     name: "Honey Brown",
//     color: "#c9822b",
//     ring: "#4a2b10",
//     price: "PKR 4,900",
//   },
//   {
//     id: "violet-dream",
//     name: "Violet Dream",
//     color: "#8f65ff",
//     ring: "#302050",
//     price: "PKR 6,300",
//   },
// ];

// const LEFT_IRIS = [468, 469, 470, 471, 472];
// const RIGHT_IRIS = [473, 474, 475, 476, 477];

// const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

// function loadScript(src) {
//   return new Promise((resolve, reject) => {
//     const oldScript = document.querySelector(`script[src="${src}"]`);

//     if (oldScript) {
//       resolve();
//       return;
//     }

//     const script = document.createElement("script");
//     script.src = src;
//     script.async = true;
//     script.crossOrigin = "anonymous";
//     script.onload = resolve;
//     script.onerror = reject;
//     document.body.appendChild(script);
//   });
// }

// function getIrisData(landmarks, irisIndexes, width, height) {
//   const points = irisIndexes
//     .map((index) => landmarks[index])
//     .filter(Boolean)
//     .map((point) => ({
//       x: point.x * width,
//       y: point.y * height,
//     }));

//   if (points.length < 4) return null;

//   const center = points.reduce(
//     (acc, point) => ({
//       x: acc.x + point.x / points.length,
//       y: acc.y + point.y / points.length,
//     }),
//     { x: 0, y: 0 }
//   );

//   const maxDistance = points.reduce((max, point) => {
//     const dx = point.x - center.x;
//     const dy = point.y - center.y;
//     return Math.max(max, Math.sqrt(dx * dx + dy * dy));
//   }, 0);

//   return {
//     x: center.x,
//     y: center.y,
//     radius: clamp(maxDistance * 1.9, 5, 42),
//   };
// }

// function drawLens(ctx, iris, lens, settings, side = "left") {
//   if (!iris) return;

//   const sideSize = side === "left" ? settings.leftSize : settings.rightSize;
//   const sideOffsetX = side === "left" ? settings.leftOffsetX : settings.rightOffsetX;
//   const sideOffsetY = side === "left" ? settings.leftOffsetY : settings.rightOffsetY;

//   const autoFitBoost = settings.autoFit ? clamp(iris.radius / 22, 0.55, 1.45) : 1;

//   const x = iris.x + sideOffsetX;
//   const y = iris.y + sideOffsetY;

//   const radiusX =
//     iris.radius *
//     settings.size *
//     sideSize *
//     autoFitBoost *
//     settings.stretchX;

//   const radiusY =
//     iris.radius *
//     settings.size *
//     sideSize *
//     autoFitBoost *
//     settings.stretchY;

//   const safeRadiusX = clamp(radiusX, 2, 95);
//   const safeRadiusY = clamp(radiusY, 2, 95);
//   const baseRadius = Math.max(safeRadiusX, safeRadiusY);

//   const gradient = ctx.createRadialGradient(
//     x,
//     y,
//     baseRadius * 0.04,
//     x,
//     y,
//     baseRadius
//   );

//   gradient.addColorStop(0, "rgba(255,255,255,0.12)");
//   gradient.addColorStop(0.18, lens.color);
//   gradient.addColorStop(0.72, lens.color);
//   gradient.addColorStop(1, lens.ring);

//   ctx.save();

//   ctx.translate(x, y);
//   ctx.scale(safeRadiusX / safeRadiusY, 1);
//   ctx.translate(-x, -y);

//   ctx.globalAlpha = settings.opacity;
//   ctx.globalCompositeOperation = settings.blendMode;

//   ctx.beginPath();
//   ctx.arc(x, y, safeRadiusY, 0, Math.PI * 2);
//   ctx.fillStyle = gradient;
//   ctx.fill();

//   ctx.globalCompositeOperation = "source-over";
//   ctx.globalAlpha = settings.opacity * settings.ringOpacity;

//   ctx.beginPath();
//   ctx.arc(x, y, safeRadiusY, 0, Math.PI * 2);
//   ctx.lineWidth = Math.max(0.5, safeRadiusY * settings.ringThickness);
//   ctx.strokeStyle = lens.ring;
//   ctx.stroke();

//   ctx.globalAlpha = settings.opacity * settings.patternOpacity;

//   for (let i = 0; i < settings.patternLines; i += 1) {
//     const angle = (Math.PI * 2 * i) / settings.patternLines;
//     const inner = safeRadiusY * settings.patternInner;
//     const outer = safeRadiusY * settings.patternOuter;

//     ctx.beginPath();
//     ctx.moveTo(x + Math.cos(angle) * inner, y + Math.sin(angle) * inner);
//     ctx.lineTo(x + Math.cos(angle) * outer, y + Math.sin(angle) * outer);
//     ctx.lineWidth = Math.max(0.3, safeRadiusY * 0.018);
//     ctx.strokeStyle = "rgba(255,255,255,0.22)";
//     ctx.stroke();
//   }

//   ctx.globalAlpha = settings.pupilCutoutOpacity;
//   ctx.globalCompositeOperation = "destination-out";

//   ctx.beginPath();
//   ctx.arc(x, y, safeRadiusY * settings.pupil, 0, Math.PI * 2);
//   ctx.fill();

//   ctx.restore();
// }

// export default function TryOn() {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const streamRef = useRef(null);
//   const faceMeshRef = useRef(null);
//   const frameRef = useRef(null);
//   const latestLandmarksRef = useRef(null);
//   const lastSendRef = useRef(0);

//   const [cameraReady, setCameraReady] = useState(false);
//   const [modelReady, setModelReady] = useState(false);
//   const [cameraError, setCameraError] = useState("");
//   const [selectedLensId, setSelectedLensId] = useState(LENS_OPTIONS[0].id);

//   const [settings, setSettings] = useState({
//     autoFit: 1,

//     size: 1,
//     leftSize: 1,
//     rightSize: 1,

//     stretchX: 1,
//     stretchY: 1,

//     leftOffsetX: 0,
//     leftOffsetY: 0,
//     rightOffsetX: 0,
//     rightOffsetY: 0,

//     opacity: 0.72,
//     pupil: 0.34,

//     ringThickness: 0.11,
//     ringOpacity: 0.75,

//     patternOpacity: 0.5,
//     patternLines: 26,
//     patternInner: 0.28,
//     patternOuter: 0.88,

//     pupilCutoutOpacity: 0.95,

//     brightness: 100,
//     contrast: 108,
//     saturation: 112,

//     blendMode: "multiply",
//   });

//   const selectedLens = useMemo(
//     () => LENS_OPTIONS.find((lens) => lens.id === selectedLensId) || LENS_OPTIONS[0],
//     [selectedLensId]
//   );

//   const updateSetting = useCallback((key, value) => {
//     setSettings((current) => ({
//       ...current,
//       [key]: key === "blendMode" ? value : Number(value),
//     }));
//   }, []);

//   const resetSettings = useCallback(() => {
//     setSettings({
//       autoFit: 1,

//       size: 1,
//       leftSize: 1,
//       rightSize: 1,

//       stretchX: 1,
//       stretchY: 1,

//       leftOffsetX: 0,
//       leftOffsetY: 0,
//       rightOffsetX: 0,
//       rightOffsetY: 0,

//       opacity: 0.72,
//       pupil: 0.34,

//       ringThickness: 0.11,
//       ringOpacity: 0.75,

//       patternOpacity: 0.5,
//       patternLines: 26,
//       patternInner: 0.28,
//       patternOuter: 0.88,

//       pupilCutoutOpacity: 0.95,

//       brightness: 100,
//       contrast: 108,
//       saturation: 112,

//       blendMode: "multiply",
//     });
//   }, []);

//   const capturePhoto = useCallback(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const link = document.createElement("a");
//     link.download = `lens-tryon-${Date.now()}.png`;
//     link.href = canvas.toDataURL("image/png");
//     link.click();
//   }, []);

//   useEffect(() => {
//     let mounted = true;

//     async function setup() {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: {
//             width: { ideal: CANVAS_WIDTH },
//             height: { ideal: CANVAS_HEIGHT },
//             facingMode: "user",
//           },
//           audio: false,
//         });

//         if (!mounted) return;

//         streamRef.current = stream;

//         if (videoRef.current) {
//           videoRef.current.srcObject = stream;
//           await videoRef.current.play();
//         }

//         setCameraReady(true);
//       } catch (error) {
//         setCameraError("Camera permission failed. Allow camera access and reload.");
//       }

//       try {
//         await loadScript(FACE_MESH_SCRIPT);

//         if (!mounted || !window.FaceMesh) return;

//         const faceMesh = new window.FaceMesh({
//           locateFile: (file) => `${FACE_MESH_ASSET_PATH}/${file}`,
//         });

//         faceMesh.setOptions({
//           maxNumFaces: 1,
//           refineLandmarks: true,
//           minDetectionConfidence: 0.65,
//           minTrackingConfidence: 0.65,
//         });

//         faceMesh.onResults((results) => {
//           latestLandmarksRef.current =
//             results.multiFaceLandmarks && results.multiFaceLandmarks.length
//               ? results.multiFaceLandmarks[0]
//               : null;
//         });

//         faceMeshRef.current = faceMesh;
//         setModelReady(true);
//       } catch (error) {
//         setCameraError("Face tracking failed to load. Check internet/CDN access.");
//       }
//     }

//     setup();

//     return () => {
//       mounted = false;

//       if (frameRef.current) {
//         cancelAnimationFrame(frameRef.current);
//       }

//       if (streamRef.current) {
//         streamRef.current.getTracks().forEach((track) => track.stop());
//       }

//       if (faceMeshRef.current && faceMeshRef.current.close) {
//         faceMeshRef.current.close();
//       }
//     };
//   }, []);

//   useEffect(() => {
//     const video = videoRef.current;
//     const canvas = canvasRef.current;
//     const ctx = canvas?.getContext("2d");

//     if (!video || !canvas || !ctx) return;

//     let running = true;

//     async function render(time) {
//       if (!running) return;

//       const videoReady = video.readyState >= 2;

//       ctx.save();
//       ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

//       if (videoReady) {
//         ctx.translate(CANVAS_WIDTH, 0);
//         ctx.scale(-1, 1);
//         ctx.filter = `brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturation}%)`;
//         ctx.drawImage(video, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
//         ctx.filter = "none";
//         ctx.restore();

//         if (faceMeshRef.current && modelReady && time - lastSendRef.current > 45) {
//           lastSendRef.current = time;

//           try {
//             await faceMeshRef.current.send({ image: video });
//           } catch (error) {
//             // Dropped frames are normal on weaker devices.
//           }
//         }

//         const landmarks = latestLandmarksRef.current;

//         if (landmarks) {
//           const mirroredLandmarks = landmarks.map((point) => ({
//             ...point,
//             x: 1 - point.x,
//           }));

//           const leftIris = getIrisData(
//             mirroredLandmarks,
//             LEFT_IRIS,
//             CANVAS_WIDTH,
//             CANVAS_HEIGHT
//           );

//           const rightIris = getIrisData(
//             mirroredLandmarks,
//             RIGHT_IRIS,
//             CANVAS_WIDTH,
//             CANVAS_HEIGHT
//           );

//           drawLens(ctx, leftIris, selectedLens, settings, "left");
//           drawLens(ctx, rightIris, selectedLens, settings, "right");
//         }
//       } else {
//         ctx.restore();
//         ctx.fillStyle = "#07070b";
//         ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
//       }

//       frameRef.current = requestAnimationFrame(render);
//     }

//     frameRef.current = requestAnimationFrame(render);

//     return () => {
//       running = false;
//       if (frameRef.current) cancelAnimationFrame(frameRef.current);
//     };
//   }, [modelReady, selectedLens, settings]);

//   return (
//     <div style={styles.page}>
//       <video ref={videoRef} muted playsInline autoPlay style={styles.hiddenVideo} />

//       <main style={styles.shell}>
//         <section style={styles.previewPanel}>
//           <canvas
//             ref={canvasRef}
//             width={CANVAS_WIDTH}
//             height={CANVAS_HEIGHT}
//             style={styles.canvas}
//           />

//           <div style={styles.topBar}>
//             <div>
//               <div style={styles.brand}>Lens Studio</div>
//               <div style={styles.subBrand}>Custom contact lens try-on</div>
//             </div>

//             <div style={styles.status}>
//               <span
//                 style={{
//                   ...styles.statusDot,
//                   background: cameraReady && modelReady ? "#36d67a" : "#f4b942",
//                 }}
//               />
//               {cameraReady && modelReady ? "Live tracking" : "Loading"}
//             </div>
//           </div>

//           <div style={styles.mobileLensBar}>
//             {LENS_OPTIONS.map((lens) => (
//               <button
//                 key={lens.id}
//                 type="button"
//                 onClick={() => setSelectedLensId(lens.id)}
//                 style={{
//                   ...styles.mobileLensButton,
//                   borderColor:
//                     selectedLensId === lens.id
//                       ? "#ffffff"
//                       : "rgba(255,255,255,.22)",
//                 }}
//               >
//                 <span style={{ ...styles.colorDot, background: lens.color }} />
//               </button>
//             ))}
//           </div>

//           {(!cameraReady || !modelReady || cameraError) && (
//             <div style={styles.loadingOverlay}>
//               <div style={styles.loaderCard}>
//                 <div style={styles.spinner} />
//                 <h2 style={styles.loaderTitle}>
//                   {cameraError ? "Setup problem" : "Starting try-on"}
//                 </h2>
//                 <p style={styles.loaderText}>
//                   {cameraError || "Allow camera access. Keep your face centered."}
//                 </p>
//               </div>
//             </div>
//           )}
//         </section>

//         <aside style={styles.controlPanel}>
//           <div>
//             <p style={styles.eyebrow}>CUSTOM FIT</p>
//             <h1 style={styles.title}>Adjust lens for every eye</h1>
//             <p style={styles.description}>
//               Use eye-based controls, not race or country. The right fit depends on
//               iris size, camera distance, eye shape, and face angle.
//             </p>
//           </div>

//           <div style={styles.selectedCard}>
//             <div style={{ ...styles.selectedSwatch, background: selectedLens.color }} />
//             <div>
//               <h2 style={styles.selectedName}>{selectedLens.name}</h2>
//               <p style={styles.selectedPrice}>{selectedLens.price}</p>
//             </div>
//           </div>

//           <div style={styles.grid}>
//             {LENS_OPTIONS.map((lens) => (
//               <button
//                 key={lens.id}
//                 type="button"
//                 onClick={() => setSelectedLensId(lens.id)}
//                 style={{
//                   ...styles.lensCard,
//                   borderColor:
//                     selectedLensId === lens.id
//                       ? "rgba(255,255,255,.95)"
//                       : "rgba(255,255,255,.12)",
//                   background:
//                     selectedLensId === lens.id
//                       ? "rgba(255,255,255,.14)"
//                       : "rgba(255,255,255,.055)",
//                 }}
//               >
//                 <span style={{ ...styles.lensSwatch, background: lens.color }} />
//                 <strong style={styles.lensName}>{lens.name}</strong>
//                 <span style={styles.lensPrice}>{lens.price}</span>
//               </button>
//             ))}
//           </div>

//           <div style={styles.controls}>
//             <SectionTitle title="Fit Controls" />

//             <ToggleSlider
//               label="Auto eye fit"
//               value={settings.autoFit}
//               display={settings.autoFit ? "On" : "Off"}
//               onChange={(value) => updateSetting("autoFit", value)}
//             />

//             <Slider
//               label="Overall lens size"
//               value={settings.size}
//               min="0.25"
//               max="2.6"
//               step="0.01"
//               display={`${Math.round(settings.size * 100)}%`}
//               onChange={(value) => updateSetting("size", value)}
//             />

//             <Slider
//               label="Left lens size"
//               value={settings.leftSize}
//               min="0.25"
//               max="2.6"
//               step="0.01"
//               display={`${Math.round(settings.leftSize * 100)}%`}
//               onChange={(value) => updateSetting("leftSize", value)}
//             />

//             <Slider
//               label="Right lens size"
//               value={settings.rightSize}
//               min="0.25"
//               max="2.6"
//               step="0.01"
//               display={`${Math.round(settings.rightSize * 100)}%`}
//               onChange={(value) => updateSetting("rightSize", value)}
//             />

//             <Slider
//               label="Horizontal stretch"
//               value={settings.stretchX}
//               min="0.35"
//               max="2"
//               step="0.01"
//               display={`${Math.round(settings.stretchX * 100)}%`}
//               onChange={(value) => updateSetting("stretchX", value)}
//             />

//             <Slider
//               label="Vertical stretch"
//               value={settings.stretchY}
//               min="0.35"
//               max="2"
//               step="0.01"
//               display={`${Math.round(settings.stretchY * 100)}%`}
//               onChange={(value) => updateSetting("stretchY", value)}
//             />

//             <SectionTitle title="Position Fine-Tuning" />

//             <Slider
//               label="Left lens horizontal"
//               value={settings.leftOffsetX}
//               min="-35"
//               max="35"
//               step="1"
//               display={`${settings.leftOffsetX}px`}
//               onChange={(value) => updateSetting("leftOffsetX", value)}
//             />

//             <Slider
//               label="Left lens vertical"
//               value={settings.leftOffsetY}
//               min="-35"
//               max="35"
//               step="1"
//               display={`${settings.leftOffsetY}px`}
//               onChange={(value) => updateSetting("leftOffsetY", value)}
//             />

//             <Slider
//               label="Right lens horizontal"
//               value={settings.rightOffsetX}
//               min="-35"
//               max="35"
//               step="1"
//               display={`${settings.rightOffsetX}px`}
//               onChange={(value) => updateSetting("rightOffsetX", value)}
//             />

//             <Slider
//               label="Right lens vertical"
//               value={settings.rightOffsetY}
//               min="-35"
//               max="35"
//               step="1"
//               display={`${settings.rightOffsetY}px`}
//               onChange={(value) => updateSetting("rightOffsetY", value)}
//             />

//             <SectionTitle title="Lens Appearance" />

//             <Slider
//               label="Lens opacity"
//               value={settings.opacity}
//               min="0.05"
//               max="1"
//               step="0.01"
//               display={`${Math.round(settings.opacity * 100)}%`}
//               onChange={(value) => updateSetting("opacity", value)}
//             />

//             <Slider
//               label="Pupil opening"
//               value={settings.pupil}
//               min="0.1"
//               max="0.65"
//               step="0.01"
//               display={`${Math.round(settings.pupil * 100)}%`}
//               onChange={(value) => updateSetting("pupil", value)}
//             />

//             <Slider
//               label="Pupil cutout strength"
//               value={settings.pupilCutoutOpacity}
//               min="0.25"
//               max="1"
//               step="0.01"
//               display={`${Math.round(settings.pupilCutoutOpacity * 100)}%`}
//               onChange={(value) => updateSetting("pupilCutoutOpacity", value)}
//             />

//             <Slider
//               label="Outer ring thickness"
//               value={settings.ringThickness}
//               min="0"
//               max="0.28"
//               step="0.01"
//               display={`${Math.round(settings.ringThickness * 100)}%`}
//               onChange={(value) => updateSetting("ringThickness", value)}
//             />

//             <Slider
//               label="Outer ring opacity"
//               value={settings.ringOpacity}
//               min="0"
//               max="1"
//               step="0.01"
//               display={`${Math.round(settings.ringOpacity * 100)}%`}
//               onChange={(value) => updateSetting("ringOpacity", value)}
//             />

//             <Slider
//               label="Pattern opacity"
//               value={settings.patternOpacity}
//               min="0"
//               max="1"
//               step="0.01"
//               display={`${Math.round(settings.patternOpacity * 100)}%`}
//               onChange={(value) => updateSetting("patternOpacity", value)}
//             />

//             <Slider
//               label="Pattern lines"
//               value={settings.patternLines}
//               min="0"
//               max="64"
//               step="1"
//               display={`${settings.patternLines}`}
//               onChange={(value) => updateSetting("patternLines", value)}
//             />

//             <Slider
//               label="Pattern inner radius"
//               value={settings.patternInner}
//               min="0.05"
//               max="0.65"
//               step="0.01"
//               display={`${Math.round(settings.patternInner * 100)}%`}
//               onChange={(value) => updateSetting("patternInner", value)}
//             />

//             <Slider
//               label="Pattern outer radius"
//               value={settings.patternOuter}
//               min="0.4"
//               max="1"
//               step="0.01"
//               display={`${Math.round(settings.patternOuter * 100)}%`}
//               onChange={(value) => updateSetting("patternOuter", value)}
//             />

//             <SectionTitle title="Camera Image" />

//             <Slider
//               label="Brightness"
//               value={settings.brightness}
//               min="50"
//               max="170"
//               step="1"
//               display={`${settings.brightness}%`}
//               onChange={(value) => updateSetting("brightness", value)}
//             />

//             <Slider
//               label="Contrast"
//               value={settings.contrast}
//               min="50"
//               max="180"
//               step="1"
//               display={`${settings.contrast}%`}
//               onChange={(value) => updateSetting("contrast", value)}
//             />

//             <Slider
//               label="Saturation"
//               value={settings.saturation}
//               min="40"
//               max="200"
//               step="1"
//               display={`${settings.saturation}%`}
//               onChange={(value) => updateSetting("saturation", value)}
//             />

//             <label style={styles.selectWrap}>
//               <div style={styles.sliderTop}>
//                 <span>Blend mode</span>
//                 <strong>{settings.blendMode}</strong>
//               </div>

//               <select
//                 value={settings.blendMode}
//                 onChange={(event) => updateSetting("blendMode", event.target.value)}
//                 style={styles.select}
//               >
//                 <option value="multiply">multiply</option>
//                 <option value="source-over">normal</option>
//                 <option value="overlay">overlay</option>
//                 <option value="soft-light">soft-light</option>
//                 <option value="color">color</option>
//               </select>
//             </label>
//           </div>

//           <div style={styles.actions}>
//             <button type="button" onClick={resetSettings} style={styles.secondaryButton}>
//               Reset
//             </button>

//             <button type="button" onClick={capturePhoto} style={styles.primaryButton}>
//               Capture
//             </button>
//           </div>
//         </aside>
//       </main>

//       <style>{`
//         * {
//           box-sizing: border-box;
//         }

//         body {
//           margin: 0;
//         }

//         input[type="range"] {
//           width: 100%;
//           accent-color: #ffffff;
//         }

//         button,
//         select {
//           font-family: inherit;
//         }

//         @keyframes spin {
//           to {
//             transform: rotate(360deg);
//           }
//         }

//         @media (max-width: 980px) {
//           main {
//             grid-template-columns: 1fr !important;
//             overflow: auto !important;
//           }

//           aside {
//             max-height: none !important;
//             min-height: auto !important;
//           }

//           canvas {
//             min-height: 64vh !important;
//           }

//           section {
//             min-height: 64vh !important;
//           }
//         }

//         @media (max-width: 560px) {
//           main {
//             padding: 10px !important;
//             gap: 10px !important;
//           }

//           section,
//           aside {
//             border-radius: 24px !important;
//           }
//         }
//       `}</style>
//     </div>
//   );
// }

// function SectionTitle({ title }) {
//   return <div style={styles.sectionTitle}>{title}</div>;
// }

// function Slider({ label, value, min, max, step, display, onChange }) {
//   return (
//     <label style={styles.sliderWrap}>
//       <div style={styles.sliderTop}>
//         <span>{label}</span>
//         <strong>{display}</strong>
//       </div>

//       <input
//         type="range"
//         value={value}
//         min={min}
//         max={max}
//         step={step}
//         onChange={(event) => onChange(event.target.value)}
//       />
//     </label>
//   );
// }

// function ToggleSlider({ label, value, display, onChange }) {
//   return (
//     <label style={styles.sliderWrap}>
//       <div style={styles.sliderTop}>
//         <span>{label}</span>
//         <strong>{display}</strong>
//       </div>

//       <input
//         type="range"
//         value={value}
//         min="0"
//         max="1"
//         step="1"
//         onChange={(event) => onChange(event.target.value)}
//       />
//     </label>
//   );
// }

// const styles = {
//   page: {
//     minHeight: "100vh",
//     width: "100%",
//     background:
//       "radial-gradient(circle at top left, #334155 0%, #0f172a 38%, #020617 100%)",
//     color: "#ffffff",
//     fontFamily:
//       "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
//     overflow: "hidden",
//   },
//   hiddenVideo: {
//     display: "none",
//   },
//   shell: {
//     minHeight: "100vh",
//     display: "grid",
//     gridTemplateColumns: "minmax(0, 1fr) 430px",
//     gap: 20,
//     padding: 20,
//   },
//   previewPanel: {
//     position: "relative",
//     minHeight: "calc(100vh - 40px)",
//     borderRadius: 34,
//     overflow: "hidden",
//     background: "#000000",
//     border: "1px solid rgba(255,255,255,.12)",
//     boxShadow: "0 30px 90px rgba(0,0,0,.45)",
//   },
//   canvas: {
//     width: "100%",
//     height: "100%",
//     minHeight: "calc(100vh - 40px)",
//     display: "block",
//     objectFit: "cover",
//   },
//   topBar: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     padding: 24,
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "space-between",
//     background:
//       "linear-gradient(to bottom, rgba(0,0,0,.68), rgba(0,0,0,.18), transparent)",
//   },
//   brand: {
//     fontSize: 28,
//     lineHeight: 1,
//     fontWeight: 900,
//     letterSpacing: "-0.05em",
//   },
//   subBrand: {
//     marginTop: 8,
//     fontSize: 13,
//     color: "rgba(255,255,255,.68)",
//     fontWeight: 600,
//   },
//   status: {
//     display: "inline-flex",
//     alignItems: "center",
//     gap: 9,
//     padding: "10px 14px",
//     borderRadius: 999,
//     background: "rgba(0,0,0,.48)",
//     border: "1px solid rgba(255,255,255,.14)",
//     backdropFilter: "blur(14px)",
//     fontSize: 13,
//     fontWeight: 800,
//   },
//   statusDot: {
//     width: 9,
//     height: 9,
//     borderRadius: 999,
//     boxShadow: "0 0 18px currentColor",
//   },
//   mobileLensBar: {
//     position: "absolute",
//     left: 16,
//     right: 16,
//     bottom: 16,
//     display: "flex",
//     gap: 10,
//     overflowX: "auto",
//     padding: 12,
//     borderRadius: 24,
//     background: "rgba(0,0,0,.48)",
//     border: "1px solid rgba(255,255,255,.14)",
//     backdropFilter: "blur(18px)",
//   },
//   mobileLensButton: {
//     flex: "0 0 auto",
//     width: 50,
//     height: 50,
//     borderRadius: 999,
//     border: "2px solid rgba(255,255,255,.22)",
//     background: "rgba(255,255,255,.08)",
//     display: "grid",
//     placeItems: "center",
//     cursor: "pointer",
//   },
//   colorDot: {
//     width: 28,
//     height: 28,
//     borderRadius: 999,
//     border: "2px solid rgba(255,255,255,.55)",
//   },
//   loadingOverlay: {
//     position: "absolute",
//     inset: 0,
//     display: "grid",
//     placeItems: "center",
//     background: "rgba(2,6,23,.84)",
//     backdropFilter: "blur(8px)",
//   },
//   loaderCard: {
//     width: "min(360px, calc(100vw - 48px))",
//     padding: 28,
//     borderRadius: 28,
//     textAlign: "center",
//     background: "rgba(255,255,255,.08)",
//     border: "1px solid rgba(255,255,255,.16)",
//   },
//   spinner: {
//     width: 52,
//     height: 52,
//     margin: "0 auto 18px",
//     borderRadius: "50%",
//     border: "4px solid rgba(255,255,255,.18)",
//     borderTopColor: "#ffffff",
//     animation: "spin .8s linear infinite",
//   },
//   loaderTitle: {
//     margin: 0,
//     fontSize: 22,
//     fontWeight: 900,
//   },
//   loaderText: {
//     margin: "10px 0 0",
//     color: "rgba(255,255,255,.7)",
//     lineHeight: 1.5,
//   },
//   controlPanel: {
//     minHeight: "calc(100vh - 40px)",
//     maxHeight: "calc(100vh - 40px)",
//     overflowY: "auto",
//     borderRadius: 34,
//     padding: 24,
//     background: "rgba(255,255,255,.08)",
//     border: "1px solid rgba(255,255,255,.14)",
//     backdropFilter: "blur(22px)",
//     display: "flex",
//     flexDirection: "column",
//     gap: 20,
//   },
//   eyebrow: {
//     margin: 0,
//     color: "rgba(255,255,255,.55)",
//     fontSize: 12,
//     fontWeight: 900,
//     letterSpacing: 2.6,
//   },
//   title: {
//     margin: "8px 0 0",
//     fontSize: 34,
//     lineHeight: 1.05,
//     letterSpacing: "-0.06em",
//   },
//   description: {
//     margin: "12px 0 0",
//     color: "rgba(255,255,255,.68)",
//     fontSize: 14,
//     lineHeight: 1.6,
//   },
//   selectedCard: {
//     display: "flex",
//     alignItems: "center",
//     gap: 14,
//     padding: 16,
//     borderRadius: 24,
//     background: "rgba(255,255,255,.09)",
//     border: "1px solid rgba(255,255,255,.14)",
//   },
//   selectedSwatch: {
//     width: 54,
//     height: 54,
//     borderRadius: 999,
//     border: "3px solid rgba(255,255,255,.5)",
//     boxShadow: "0 14px 30px rgba(0,0,0,.28)",
//   },
//   selectedName: {
//     margin: 0,
//     fontSize: 18,
//     fontWeight: 900,
//   },
//   selectedPrice: {
//     margin: "4px 0 0",
//     color: "rgba(255,255,255,.62)",
//     fontSize: 13,
//     fontWeight: 700,
//   },
//   grid: {
//     display: "grid",
//     gridTemplateColumns: "repeat(2, 1fr)",
//     gap: 12,
//   },
//   lensCard: {
//     minHeight: 116,
//     padding: 14,
//     borderRadius: 22,
//     border: "1px solid rgba(255,255,255,.12)",
//     color: "#ffffff",
//     cursor: "pointer",
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "flex-start",
//     gap: 8,
//     textAlign: "left",
//   },
//   lensSwatch: {
//     width: 34,
//     height: 34,
//     borderRadius: 999,
//     border: "2px solid rgba(255,255,255,.48)",
//   },
//   lensName: {
//     fontSize: 13,
//     lineHeight: 1.2,
//   },
//   lensPrice: {
//     color: "rgba(255,255,255,.58)",
//     fontSize: 12,
//     fontWeight: 700,
//   },
//   controls: {
//     display: "grid",
//     gap: 16,
//     padding: 18,
//     borderRadius: 24,
//     background: "rgba(0,0,0,.18)",
//     border: "1px solid rgba(255,255,255,.1)",
//   },
//   sectionTitle: {
//     marginTop: 4,
//     paddingTop: 4,
//     color: "rgba(255,255,255,.9)",
//     fontSize: 13,
//     fontWeight: 950,
//     letterSpacing: 1.2,
//     textTransform: "uppercase",
//   },
//   sliderWrap: {
//     display: "grid",
//     gap: 8,
//   },
//   sliderTop: {
//     display: "flex",
//     justifyContent: "space-between",
//     gap: 12,
//     color: "rgba(255,255,255,.72)",
//     fontSize: 13,
//     fontWeight: 800,
//   },
//   selectWrap: {
//     display: "grid",
//     gap: 8,
//   },
//   select: {
//     width: "100%",
//     border: "1px solid rgba(255,255,255,.18)",
//     borderRadius: 14,
//     padding: "12px 14px",
//     background: "rgba(255,255,255,.1)",
//     color: "#ffffff",
//     outline: "none",
//     fontWeight: 800,
//   },
//   actions: {
//     display: "grid",
//     gridTemplateColumns: "1fr 1.5fr",
//     gap: 12,
//   },
//   secondaryButton: {
//     border: "1px solid rgba(255,255,255,.18)",
//     background: "rgba(255,255,255,.08)",
//     color: "#ffffff",
//     borderRadius: 999,
//     padding: "15px 18px",
//     cursor: "pointer",
//     fontWeight: 900,
//   },
//   primaryButton: {
//     border: "none",
//     background: "#ffffff",
//     color: "#020617",
//     borderRadius: 999,
//     padding: "15px 18px",
//     cursor: "pointer",
//     fontWeight: 950,
//     boxShadow: "0 14px 30px rgba(255,255,255,.18)",
//   },
// };































// import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

// const CANVAS_WIDTH = 1280;
// const CANVAS_HEIGHT = 720;

// const FACE_MESH_SCRIPT =
//   "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js";

// const FACE_MESH_ASSET_PATH =
//   "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh";

// const LENS_OPTIONS = [
//   {
//     id: "natural-hazel",
//     name: "Natural Hazel",
//     color: "#9b6a2f",
//     ring: "#3a2414",
//     price: "PKR 4,800",
//   },
//   {
//     id: "crystal-gray",
//     name: "Crystal Gray",
//     color: "#aeb6bd",
//     ring: "#35404a",
//     price: "PKR 5,200",
//   },
//   {
//     id: "ocean-blue",
//     name: "Ocean Blue",
//     color: "#4aa3ff",
//     ring: "#123455",
//     price: "PKR 5,500",
//   },
//   {
//     id: "emerald-green",
//     name: "Emerald Green",
//     color: "#2fbf71",
//     ring: "#0d3b24",
//     price: "PKR 5,900",
//   },
//   {
//     id: "honey-brown",
//     name: "Honey Brown",
//     color: "#c9822b",
//     ring: "#4a2b10",
//     price: "PKR 4,900",
//   },
//   {
//     id: "violet-dream",
//     name: "Violet Dream",
//     color: "#8f65ff",
//     ring: "#302050",
//     price: "PKR 6,300",
//   },
// ];

// const LEFT_IRIS = [468, 469, 470, 471, 472];
// const RIGHT_IRIS = [473, 474, 475, 476, 477];

// const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

// function loadScript(src) {
//   return new Promise((resolve, reject) => {
//     const oldScript = document.querySelector(`script[src="${src}"]`);

//     if (oldScript) {
//       resolve();
//       return;
//     }

//     const script = document.createElement("script");
//     script.src = src;
//     script.async = true;
//     script.crossOrigin = "anonymous";
//     script.onload = resolve;
//     script.onerror = reject;
//     document.body.appendChild(script);
//   });
// }

// function getIrisData(landmarks, irisIndexes, width, height) {
//   const points = irisIndexes
//     .map((index) => landmarks[index])
//     .filter(Boolean)
//     .map((point) => ({
//       x: point.x * width,
//       y: point.y * height,
//     }));

//   if (points.length < 4) return null;

//   const center = points.reduce(
//     (acc, point) => ({
//       x: acc.x + point.x / points.length,
//       y: acc.y + point.y / points.length,
//     }),
//     { x: 0, y: 0 }
//   );

//   const maxDistance = points.reduce((max, point) => {
//     const dx = point.x - center.x;
//     const dy = point.y - center.y;
//     return Math.max(max, Math.sqrt(dx * dx + dy * dy));
//   }, 0);

//   return {
//     x: center.x,
//     y: center.y,
//     radius: clamp(maxDistance * 1.9, 5, 42),
//   };
// }

// function drawLens(ctx, iris, lens, settings, side = "left") {
//   if (!iris) return;

//   const sideSize = side === "left" ? settings.leftSize : settings.rightSize;
//   const sideOffsetX = side === "left" ? settings.leftOffsetX : settings.rightOffsetX;
//   const sideOffsetY = side === "left" ? settings.leftOffsetY : settings.rightOffsetY;

//   const autoFitBoost = settings.autoFit ? clamp(iris.radius / 22, 0.55, 1.45) : 1;

//   const x = iris.x + sideOffsetX;
//   const y = iris.y + sideOffsetY;

//   const radiusX =
//     iris.radius *
//     settings.size *
//     sideSize *
//     autoFitBoost *
//     settings.stretchX;

//   const radiusY =
//     iris.radius *
//     settings.size *
//     sideSize *
//     autoFitBoost *
//     settings.stretchY;

//   const safeRadiusX = clamp(radiusX, 2, 95);
//   const safeRadiusY = clamp(radiusY, 2, 95);
//   const baseRadius = Math.max(safeRadiusX, safeRadiusY);

//   const gradient = ctx.createRadialGradient(
//     x,
//     y,
//     baseRadius * 0.04,
//     x,
//     y,
//     baseRadius
//   );

//   gradient.addColorStop(0, "rgba(255,255,255,0.12)");
//   gradient.addColorStop(0.18, lens.color);
//   gradient.addColorStop(0.72, lens.color);
//   gradient.addColorStop(1, lens.ring);

//   ctx.save();

//   ctx.translate(x, y);
//   ctx.scale(safeRadiusX / safeRadiusY, 1);
//   ctx.translate(-x, -y);

//   ctx.globalAlpha = settings.opacity;
//   ctx.globalCompositeOperation = settings.blendMode;

//   ctx.beginPath();
//   ctx.arc(x, y, safeRadiusY, 0, Math.PI * 2);
//   ctx.fillStyle = gradient;
//   ctx.fill();

//   ctx.globalCompositeOperation = "source-over";
//   ctx.globalAlpha = settings.opacity * settings.ringOpacity;

//   ctx.beginPath();
//   ctx.arc(x, y, safeRadiusY, 0, Math.PI * 2);
//   ctx.lineWidth = Math.max(0.5, safeRadiusY * settings.ringThickness);
//   ctx.strokeStyle = lens.ring;
//   ctx.stroke();

//   ctx.globalAlpha = settings.opacity * settings.patternOpacity;

//   for (let i = 0; i < settings.patternLines; i += 1) {
//     const angle = (Math.PI * 2 * i) / settings.patternLines;
//     const inner = safeRadiusY * settings.patternInner;
//     const outer = safeRadiusY * settings.patternOuter;

//     ctx.beginPath();
//     ctx.moveTo(x + Math.cos(angle) * inner, y + Math.sin(angle) * inner);
//     ctx.lineTo(x + Math.cos(angle) * outer, y + Math.sin(angle) * outer);
//     ctx.lineWidth = Math.max(0.3, safeRadiusY * 0.018);
//     ctx.strokeStyle = "rgba(255,255,255,0.22)";
//     ctx.stroke();
//   }

//   ctx.globalAlpha = settings.pupilCutoutOpacity;
//   ctx.globalCompositeOperation = "destination-out";

//   ctx.beginPath();
//   ctx.arc(x, y, safeRadiusY * settings.pupil, 0, Math.PI * 2);
//   ctx.fill();

//   ctx.restore();
// }

// export default function TryOn() {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const streamRef = useRef(null);
//   const faceMeshRef = useRef(null);
//   const frameRef = useRef(null);
//   const latestLandmarksRef = useRef(null);
//   const lastSendRef = useRef(0);

//   const [cameraReady, setCameraReady] = useState(false);
//   const [modelReady, setModelReady] = useState(false);
//   const [cameraError, setCameraError] = useState("");
//   const [selectedLensId, setSelectedLensId] = useState(LENS_OPTIONS[0].id);

//   const [settings, setSettings] = useState({
//     autoFit: 0,

//     size: 0.29,
//     leftSize: 1,
//     rightSize: 1,

//     stretchX: 1.62,
//     stretchY: 1.16,

//     leftOffsetX: 0,
//     leftOffsetY: 0,
//     rightOffsetX: 0,
//     rightOffsetY: 0,

//     opacity: 0.72,
//     pupil: 0.34,

//     ringThickness: 0.11,
//     ringOpacity: 0.75,

//     patternOpacity: 0.5,
//     patternLines: 26,
//     patternInner: 0.28,
//     patternOuter: 0.88,

//     pupilCutoutOpacity: 0.95,

//     brightness: 143,
//     contrast: 76,
//     saturation: 100,

//     blendMode: "multiply",
//   });

//   const selectedLens = useMemo(
//     () => LENS_OPTIONS.find((lens) => lens.id === selectedLensId) || LENS_OPTIONS[0],
//     [selectedLensId]
//   );

//   const updateSetting = useCallback((key, value) => {
//     setSettings((current) => ({
//       ...current,
//       [key]: key === "blendMode" ? value : Number(value),
//     }));
//   }, []);

//   const resetSettings = useCallback(() => {
//     setSettings({
//       autoFit: 0,

//       size: 0.29,
//       leftSize: 1,
//       rightSize: 1,

//       stretchX: 1.62,
//       stretchY: 1.16,

//       leftOffsetX: 0,
//       leftOffsetY: 0,
//       rightOffsetX: 0,
//       rightOffsetY: 0,

//       opacity: 0.72,
//       pupil: 0.34,

//       ringThickness: 0.11,
//       ringOpacity: 0.75,

//       patternOpacity: 0.5,
//       patternLines: 26,
//       patternInner: 0.28,
//       patternOuter: 0.88,

//       pupilCutoutOpacity: 0.95,

//       brightness: 143,
//       contrast: 76,
//       saturation: 100,

//       blendMode: "multiply",
//     });
//   }, []);

//   const capturePhoto = useCallback(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const link = document.createElement("a");
//     link.download = `lens-tryon-${Date.now()}.png`;
//     link.href = canvas.toDataURL("image/png");
//     link.click();
//   }, []);

//   useEffect(() => {
//     let mounted = true;

//     async function setup() {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: {
//             width: { ideal: CANVAS_WIDTH },
//             height: { ideal: CANVAS_HEIGHT },
//             facingMode: "user",
//           },
//           audio: false,
//         });

//         if (!mounted) return;

//         streamRef.current = stream;

//         if (videoRef.current) {
//           videoRef.current.srcObject = stream;
//           await videoRef.current.play();
//         }

//         setCameraReady(true);
//       } catch (error) {
//         setCameraError("Camera permission failed. Allow camera access and reload.");
//       }

//       try {
//         await loadScript(FACE_MESH_SCRIPT);

//         if (!mounted || !window.FaceMesh) return;

//         const faceMesh = new window.FaceMesh({
//           locateFile: (file) => `${FACE_MESH_ASSET_PATH}/${file}`,
//         });

//         faceMesh.setOptions({
//           maxNumFaces: 1,
//           refineLandmarks: true,
//           minDetectionConfidence: 0.65,
//           minTrackingConfidence: 0.65,
//         });

//         faceMesh.onResults((results) => {
//           latestLandmarksRef.current =
//             results.multiFaceLandmarks && results.multiFaceLandmarks.length
//               ? results.multiFaceLandmarks[0]
//               : null;
//         });

//         faceMeshRef.current = faceMesh;
//         setModelReady(true);
//       } catch (error) {
//         setCameraError("Face tracking failed to load. Check internet/CDN access.");
//       }
//     }

//     setup();

//     return () => {
//       mounted = false;

//       if (frameRef.current) {
//         cancelAnimationFrame(frameRef.current);
//       }

//       if (streamRef.current) {
//         streamRef.current.getTracks().forEach((track) => track.stop());
//       }

//       if (faceMeshRef.current && faceMeshRef.current.close) {
//         faceMeshRef.current.close();
//       }
//     };
//   }, []);

//   useEffect(() => {
//     const video = videoRef.current;
//     const canvas = canvasRef.current;
//     const ctx = canvas?.getContext("2d");

//     if (!video || !canvas || !ctx) return;

//     let running = true;

//     async function render(time) {
//       if (!running) return;

//       const videoReady = video.readyState >= 2;

//       ctx.save();
//       ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

//       if (videoReady) {
//         ctx.translate(CANVAS_WIDTH, 0);
//         ctx.scale(-1, 1);
//         ctx.filter = `brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturation}%)`;
//         ctx.drawImage(video, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
//         ctx.filter = "none";
//         ctx.restore();

//         if (faceMeshRef.current && modelReady && time - lastSendRef.current > 45) {
//           lastSendRef.current = time;

//           try {
//             await faceMeshRef.current.send({ image: video });
//           } catch (error) {
//             // Dropped frames are normal on weaker devices.
//           }
//         }

//         const landmarks = latestLandmarksRef.current;

//         if (landmarks) {
//           const mirroredLandmarks = landmarks.map((point) => ({
//             ...point,
//             x: 1 - point.x,
//           }));

//           const leftIris = getIrisData(
//             mirroredLandmarks,
//             LEFT_IRIS,
//             CANVAS_WIDTH,
//             CANVAS_HEIGHT
//           );

//           const rightIris = getIrisData(
//             mirroredLandmarks,
//             RIGHT_IRIS,
//             CANVAS_WIDTH,
//             CANVAS_HEIGHT
//           );

//           drawLens(ctx, leftIris, selectedLens, settings, "left");
//           drawLens(ctx, rightIris, selectedLens, settings, "right");
//         }
//       } else {
//         ctx.restore();
//         ctx.fillStyle = "#07070b";
//         ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
//       }

//       frameRef.current = requestAnimationFrame(render);
//     }

//     frameRef.current = requestAnimationFrame(render);

//     return () => {
//       running = false;
//       if (frameRef.current) cancelAnimationFrame(frameRef.current);
//     };
//   }, [modelReady, selectedLens, settings]);

//   return (
//     <div style={styles.page}>
//       <video ref={videoRef} muted playsInline autoPlay style={styles.hiddenVideo} />

//       <main style={styles.shell}>
//         <section style={styles.previewPanel}>
//           <canvas
//             ref={canvasRef}
//             width={CANVAS_WIDTH}
//             height={CANVAS_HEIGHT}
//             style={styles.canvas}
//           />

//           <div style={styles.topBar}>
//             <div>
//               <div style={styles.brand}>Lens Studio</div>
//               <div style={styles.subBrand}>Custom contact lens try-on</div>
//             </div>

//             <div style={styles.status}>
//               <span
//                 style={{
//                   ...styles.statusDot,
//                   background: cameraReady && modelReady ? "#36d67a" : "#f4b942",
//                 }}
//               />
//               {cameraReady && modelReady ? "Live tracking" : "Loading"}
//             </div>
//           </div>

//           <div style={styles.mobileLensBar}>
//             {LENS_OPTIONS.map((lens) => (
//               <button
//                 key={lens.id}
//                 type="button"
//                 onClick={() => setSelectedLensId(lens.id)}
//                 style={{
//                   ...styles.mobileLensButton,
//                   borderColor:
//                     selectedLensId === lens.id
//                       ? "#ffffff"
//                       : "rgba(255,255,255,.22)",
//                 }}
//               >
//                 <span style={{ ...styles.colorDot, background: lens.color }} />
//               </button>
//             ))}
//           </div>

//           {(!cameraReady || !modelReady || cameraError) && (
//             <div style={styles.loadingOverlay}>
//               <div style={styles.loaderCard}>
//                 <div style={styles.spinner} />
//                 <h2 style={styles.loaderTitle}>
//                   {cameraError ? "Setup problem" : "Starting try-on"}
//                 </h2>
//                 <p style={styles.loaderText}>
//                   {cameraError || "Allow camera access. Keep your face centered."}
//                 </p>
//               </div>
//             </div>
//           )}
//         </section>

//         <aside style={styles.controlPanel}>
//           <div>
//             <p style={styles.eyebrow}>CUSTOM FIT</p>
//             <h1 style={styles.title}>Adjust lens for every eye</h1>
//             <p style={styles.description}>
//               Use eye-based controls, not race or country. The right fit depends on
//               iris size, camera distance, eye shape, and face angle.
//             </p>
//           </div>

//           <div style={styles.selectedCard}>
//             <div style={{ ...styles.selectedSwatch, background: selectedLens.color }} />
//             <div>
//               <h2 style={styles.selectedName}>{selectedLens.name}</h2>
//               <p style={styles.selectedPrice}>{selectedLens.price}</p>
//             </div>
//           </div>

//           <div style={styles.grid}>
//             {LENS_OPTIONS.map((lens) => (
//               <button
//                 key={lens.id}
//                 type="button"
//                 onClick={() => setSelectedLensId(lens.id)}
//                 style={{
//                   ...styles.lensCard,
//                   borderColor:
//                     selectedLensId === lens.id
//                       ? "rgba(255,255,255,.95)"
//                       : "rgba(255,255,255,.12)",
//                   background:
//                     selectedLensId === lens.id
//                       ? "rgba(255,255,255,.14)"
//                       : "rgba(255,255,255,.055)",
//                 }}
//               >
//                 <span style={{ ...styles.lensSwatch, background: lens.color }} />
//                 <strong style={styles.lensName}>{lens.name}</strong>
//                 <span style={styles.lensPrice}>{lens.price}</span>
//               </button>
//             ))}
//           </div>

//           <div style={styles.controls}>
//             <SectionTitle title="Lens Appearance" />

//             <Slider
//               label="Lens opacity"
//               value={settings.opacity}
//               min="0.05"
//               max="1"
//               step="0.01"
//               display={`${Math.round(settings.opacity * 100)}%`}
//               onChange={(value) => updateSetting("opacity", value)}
//             />

//             <Slider
//               label="Pupil opening"
//               value={settings.pupil}
//               min="0.1"
//               max="0.65"
//               step="0.01"
//               display={`${Math.round(settings.pupil * 100)}%`}
//               onChange={(value) => updateSetting("pupil", value)}
//             />

//             <Slider
//               label="Pupil cutout strength"
//               value={settings.pupilCutoutOpacity}
//               min="0.25"
//               max="1"
//               step="0.01"
//               display={`${Math.round(settings.pupilCutoutOpacity * 100)}%`}
//               onChange={(value) => updateSetting("pupilCutoutOpacity", value)}
//             />

//             <Slider
//               label="Outer ring thickness"
//               value={settings.ringThickness}
//               min="0"
//               max="0.28"
//               step="0.01"
//               display={`${Math.round(settings.ringThickness * 100)}%`}
//               onChange={(value) => updateSetting("ringThickness", value)}
//             />

//             <Slider
//               label="Outer ring opacity"
//               value={settings.ringOpacity}
//               min="0"
//               max="1"
//               step="0.01"
//               display={`${Math.round(settings.ringOpacity * 100)}%`}
//               onChange={(value) => updateSetting("ringOpacity", value)}
//             />

//             <Slider
//               label="Pattern opacity"
//               value={settings.patternOpacity}
//               min="0"
//               max="1"
//               step="0.01"
//               display={`${Math.round(settings.patternOpacity * 100)}%`}
//               onChange={(value) => updateSetting("patternOpacity", value)}
//             />

//             <Slider
//               label="Pattern lines"
//               value={settings.patternLines}
//               min="0"
//               max="64"
//               step="1"
//               display={`${settings.patternLines}`}
//               onChange={(value) => updateSetting("patternLines", value)}
//             />

//             <Slider
//               label="Pattern inner radius"
//               value={settings.patternInner}
//               min="0.05"
//               max="0.65"
//               step="0.01"
//               display={`${Math.round(settings.patternInner * 100)}%`}
//               onChange={(value) => updateSetting("patternInner", value)}
//             />

//             <Slider
//               label="Pattern outer radius"
//               value={settings.patternOuter}
//               min="0.4"
//               max="1"
//               step="0.01"
//               display={`${Math.round(settings.patternOuter * 100)}%`}
//               onChange={(value) => updateSetting("patternOuter", value)}
//             />

//             <SectionTitle title="Camera Image" />

//             <Slider
//               label="Brightness"
//               value={settings.brightness}
//               min="50"
//               max="170"
//               step="1"
//               display={`${settings.brightness}%`}
//               onChange={(value) => updateSetting("brightness", value)}
//             />

//             <Slider
//               label="Contrast"
//               value={settings.contrast}
//               min="50"
//               max="180"
//               step="1"
//               display={`${settings.contrast}%`}
//               onChange={(value) => updateSetting("contrast", value)}
//             />

//             <Slider
//               label="Saturation"
//               value={settings.saturation}
//               min="40"
//               max="200"
//               step="1"
//               display={`${settings.saturation}%`}
//               onChange={(value) => updateSetting("saturation", value)}
//             />

//             <label style={styles.selectWrap}>
//               <div style={styles.sliderTop}>
//                 <span>Blend mode</span>
//                 <strong>{settings.blendMode}</strong>
//               </div>

//               <select
//                 value={settings.blendMode}
//                 onChange={(event) => updateSetting("blendMode", event.target.value)}
//                 style={styles.select}
//               >
//                 <option value="multiply">multiply</option>
//                 <option value="source-over">normal</option>
//                 <option value="overlay">overlay</option>
//                 <option value="soft-light">soft-light</option>
//                 <option value="color">color</option>
//               </select>
//             </label>
//           </div>

//           <div style={styles.actions}>
//             <button type="button" onClick={resetSettings} style={styles.secondaryButton}>
//               Reset
//             </button>

//             <button type="button" onClick={capturePhoto} style={styles.primaryButton}>
//               Capture
//             </button>
//           </div>
//         </aside>
//       </main>

//       <style>{`
//         * {
//           box-sizing: border-box;
//         }

//         body {
//           margin: 0;
//         }

//         input[type="range"] {
//           width: 100%;
//           accent-color: #ffffff;
//         }

//         button,
//         select {
//           font-family: inherit;
//         }

//         @keyframes spin {
//           to {
//             transform: rotate(360deg);
//           }
//         }

//         @media (max-width: 980px) {
//           main {
//             grid-template-columns: 1fr !important;
//             overflow: auto !important;
//           }

//           aside {
//             max-height: none !important;
//             min-height: auto !important;
//           }

//           canvas {
//             min-height: 64vh !important;
//           }

//           section {
//             min-height: 64vh !important;
//           }
//         }

//         @media (max-width: 560px) {
//           main {
//             padding: 10px !important;
//             gap: 10px !important;
//           }

//           section,
//           aside {
//             border-radius: 24px !important;
//           }
//         }
//       `}</style>
//     </div>
//   );
// }

// function SectionTitle({ title }) {
//   return <div style={styles.sectionTitle}>{title}</div>;
// }

// function Slider({ label, value, min, max, step, display, onChange }) {
//   return (
//     <label style={styles.sliderWrap}>
//       <div style={styles.sliderTop}>
//         <span>{label}</span>
//         <strong>{display}</strong>
//       </div>

//       <input
//         type="range"
//         value={value}
//         min={min}
//         max={max}
//         step={step}
//         onChange={(event) => onChange(event.target.value)}
//       />
//     </label>
//   );
// }

// function ToggleSlider({ label, value, display, onChange }) {
//   return (
//     <label style={styles.sliderWrap}>
//       <div style={styles.sliderTop}>
//         <span>{label}</span>
//         <strong>{display}</strong>
//       </div>

//       <input
//         type="range"
//         value={value}
//         min="0"
//         max="1"
//         step="1"
//         onChange={(event) => onChange(event.target.value)}
//       />
//     </label>
//   );
// }

// const styles = {
//   page: {
//     minHeight: "100vh",
//     width: "100%",
//     background:
//       "radial-gradient(circle at top left, #334155 0%, #0f172a 38%, #020617 100%)",
//     color: "#ffffff",
//     fontFamily:
//       "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
//     overflow: "hidden",
//   },
//   hiddenVideo: {
//     display: "none",
//   },
//   shell: {
//     minHeight: "100vh",
//     display: "grid",
//     gridTemplateColumns: "minmax(0, 1fr) 430px",
//     gap: 20,
//     padding: 20,
//   },
//   previewPanel: {
//     position: "relative",
//     minHeight: "calc(100vh - 40px)",
//     borderRadius: 34,
//     overflow: "hidden",
//     background: "#000000",
//     border: "1px solid rgba(255,255,255,.12)",
//     boxShadow: "0 30px 90px rgba(0,0,0,.45)",
//   },
//   canvas: {
//     width: "100%",
//     height: "100%",
//     minHeight: "calc(100vh - 40px)",
//     display: "block",
//     objectFit: "cover",
//   },
//   topBar: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     padding: 24,
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "space-between",
//     background:
//       "linear-gradient(to bottom, rgba(0,0,0,.68), rgba(0,0,0,.18), transparent)",
//   },
//   brand: {
//     fontSize: 28,
//     lineHeight: 1,
//     fontWeight: 900,
//     letterSpacing: "-0.05em",
//   },
//   subBrand: {
//     marginTop: 8,
//     fontSize: 13,
//     color: "rgba(255,255,255,.68)",
//     fontWeight: 600,
//   },
//   status: {
//     display: "inline-flex",
//     alignItems: "center",
//     gap: 9,
//     padding: "10px 14px",
//     borderRadius: 999,
//     background: "rgba(0,0,0,.48)",
//     border: "1px solid rgba(255,255,255,.14)",
//     backdropFilter: "blur(14px)",
//     fontSize: 13,
//     fontWeight: 800,
//   },
//   statusDot: {
//     width: 9,
//     height: 9,
//     borderRadius: 999,
//     boxShadow: "0 0 18px currentColor",
//   },
//   mobileLensBar: {
//     position: "absolute",
//     left: 16,
//     right: 16,
//     bottom: 16,
//     display: "flex",
//     gap: 10,
//     overflowX: "auto",
//     padding: 12,
//     borderRadius: 24,
//     background: "rgba(0,0,0,.48)",
//     border: "1px solid rgba(255,255,255,.14)",
//     backdropFilter: "blur(18px)",
//   },
//   mobileLensButton: {
//     flex: "0 0 auto",
//     width: 50,
//     height: 50,
//     borderRadius: 999,
//     border: "2px solid rgba(255,255,255,.22)",
//     background: "rgba(255,255,255,.08)",
//     display: "grid",
//     placeItems: "center",
//     cursor: "pointer",
//   },
//   colorDot: {
//     width: 28,
//     height: 28,
//     borderRadius: 999,
//     border: "2px solid rgba(255,255,255,.55)",
//   },
//   loadingOverlay: {
//     position: "absolute",
//     inset: 0,
//     display: "grid",
//     placeItems: "center",
//     background: "rgba(2,6,23,.84)",
//     backdropFilter: "blur(8px)",
//   },
//   loaderCard: {
//     width: "min(360px, calc(100vw - 48px))",
//     padding: 28,
//     borderRadius: 28,
//     textAlign: "center",
//     background: "rgba(255,255,255,.08)",
//     border: "1px solid rgba(255,255,255,.16)",
//   },
//   spinner: {
//     width: 52,
//     height: 52,
//     margin: "0 auto 18px",
//     borderRadius: "50%",
//     border: "4px solid rgba(255,255,255,.18)",
//     borderTopColor: "#ffffff",
//     animation: "spin .8s linear infinite",
//   },
//   loaderTitle: {
//     margin: 0,
//     fontSize: 22,
//     fontWeight: 900,
//   },
//   loaderText: {
//     margin: "10px 0 0",
//     color: "rgba(255,255,255,.7)",
//     lineHeight: 1.5,
//   },
//   controlPanel: {
//     minHeight: "calc(100vh - 40px)",
//     maxHeight: "calc(100vh - 40px)",
//     overflowY: "auto",
//     borderRadius: 34,
//     padding: 24,
//     background: "rgba(255,255,255,.08)",
//     border: "1px solid rgba(255,255,255,.14)",
//     backdropFilter: "blur(22px)",
//     display: "flex",
//     flexDirection: "column",
//     gap: 20,
//   },
//   eyebrow: {
//     margin: 0,
//     color: "rgba(255,255,255,.55)",
//     fontSize: 12,
//     fontWeight: 900,
//     letterSpacing: 2.6,
//   },
//   title: {
//     margin: "8px 0 0",
//     fontSize: 34,
//     lineHeight: 1.05,
//     letterSpacing: "-0.06em",
//   },
//   description: {
//     margin: "12px 0 0",
//     color: "rgba(255,255,255,.68)",
//     fontSize: 14,
//     lineHeight: 1.6,
//   },
//   selectedCard: {
//     display: "flex",
//     alignItems: "center",
//     gap: 14,
//     padding: 16,
//     borderRadius: 24,
//     background: "rgba(255,255,255,.09)",
//     border: "1px solid rgba(255,255,255,.14)",
//   },
//   selectedSwatch: {
//     width: 54,
//     height: 54,
//     borderRadius: 999,
//     border: "3px solid rgba(255,255,255,.5)",
//     boxShadow: "0 14px 30px rgba(0,0,0,.28)",
//   },
//   selectedName: {
//     margin: 0,
//     fontSize: 18,
//     fontWeight: 900,
//   },
//   selectedPrice: {
//     margin: "4px 0 0",
//     color: "rgba(255,255,255,.62)",
//     fontSize: 13,
//     fontWeight: 700,
//   },
//   grid: {
//     display: "grid",
//     gridTemplateColumns: "repeat(2, 1fr)",
//     gap: 12,
//   },
//   lensCard: {
//     minHeight: 116,
//     padding: 14,
//     borderRadius: 22,
//     border: "1px solid rgba(255,255,255,.12)",
//     color: "#ffffff",
//     cursor: "pointer",
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "flex-start",
//     gap: 8,
//     textAlign: "left",
//   },
//   lensSwatch: {
//     width: 34,
//     height: 34,
//     borderRadius: 999,
//     border: "2px solid rgba(255,255,255,.48)",
//   },
//   lensName: {
//     fontSize: 13,
//     lineHeight: 1.2,
//   },
//   lensPrice: {
//     color: "rgba(255,255,255,.58)",
//     fontSize: 12,
//     fontWeight: 700,
//   },
//   controls: {
//     display: "grid",
//     gap: 16,
//     padding: 18,
//     borderRadius: 24,
//     background: "rgba(0,0,0,.18)",
//     border: "1px solid rgba(255,255,255,.1)",
//   },
//   sectionTitle: {
//     marginTop: 4,
//     paddingTop: 4,
//     color: "rgba(255,255,255,.9)",
//     fontSize: 13,
//     fontWeight: 950,
//     letterSpacing: 1.2,
//     textTransform: "uppercase",
//   },
//   sliderWrap: {
//     display: "grid",
//     gap: 8,
//   },
//   sliderTop: {
//     display: "flex",
//     justifyContent: "space-between",
//     gap: 12,
//     color: "rgba(255,255,255,.72)",
//     fontSize: 13,
//     fontWeight: 800,
//   },
//   selectWrap: {
//     display: "grid",
//     gap: 8,
//   },
//   select: {
//     width: "100%",
//     border: "1px solid rgba(255,255,255,.18)",
//     borderRadius: 14,
//     padding: "12px 14px",
//     background: "rgba(255,255,255,.1)",
//     color: "#ffffff",
//     outline: "none",
//     fontWeight: 800,
//   },
//   actions: {
//     display: "grid",
//     gridTemplateColumns: "1fr 1.5fr",
//     gap: 12,
//   },
//   secondaryButton: {
//     border: "1px solid rgba(255,255,255,.18)",
//     background: "rgba(255,255,255,.08)",
//     color: "#ffffff",
//     borderRadius: 999,
//     padding: "15px 18px",
//     cursor: "pointer",
//     fontWeight: 900,
//   },
//   primaryButton: {
//     border: "none",
//     background: "#ffffff",
//     color: "#020617",
//     borderRadius: 999,
//     padding: "15px 18px",
//     cursor: "pointer",
//     fontWeight: 950,
//     boxShadow: "0 14px 30px rgba(255,255,255,.18)",
//   },
// };




































// import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

// const CANVAS_WIDTH = 1280;
// const CANVAS_HEIGHT = 720;

// const FACE_MESH_SCRIPT =
//   "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js";

// const FACE_MESH_ASSET_PATH =
//   "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh";

// const LENS_OPTIONS = [
//   { id: "natural-hazel",  name: "Natural Hazel",  color: "#9b6a2f", ring: "#3a2414", price: "PKR 4,800" },
//   { id: "crystal-gray",   name: "Crystal Gray",   color: "#aeb6bd", ring: "#35404a", price: "PKR 5,200" },
//   { id: "ocean-blue",     name: "Ocean Blue",     color: "#4aa3ff", ring: "#123455", price: "PKR 5,500" },
//   { id: "emerald-green",  name: "Emerald Green",  color: "#2fbf71", ring: "#0d3b24", price: "PKR 5,900" },
//   { id: "honey-brown",    name: "Honey Brown",    color: "#c9822b", ring: "#4a2b10", price: "PKR 4,900" },
//   { id: "violet-dream",   name: "Violet Dream",   color: "#8f65ff", ring: "#302050", price: "PKR 6,300" },
// ];

// const LEFT_IRIS  = [468, 469, 470, 471, 472];
// const RIGHT_IRIS = [473, 474, 475, 476, 477];

// const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

// function loadScript(src) {
//   return new Promise((resolve, reject) => {
//     const old = document.querySelector(`script[src="${src}"]`);
//     if (old) { resolve(); return; }
//     const s = document.createElement("script");
//     s.src = src; s.async = true; s.crossOrigin = "anonymous";
//     s.onload = resolve; s.onerror = reject;
//     document.body.appendChild(s);
//   });
// }

// function getIrisData(landmarks, irisIndexes, width, height) {
//   const points = irisIndexes
//     .map((i) => landmarks[i])
//     .filter(Boolean)
//     .map((p) => ({ x: p.x * width, y: p.y * height }));
//   if (points.length < 4) return null;
//   const center = points.reduce(
//     (acc, p) => ({ x: acc.x + p.x / points.length, y: acc.y + p.y / points.length }),
//     { x: 0, y: 0 }
//   );
//   const maxDistance = points.reduce((max, p) => {
//     const dx = p.x - center.x, dy = p.y - center.y;
//     return Math.max(max, Math.sqrt(dx * dx + dy * dy));
//   }, 0);
//   return { x: center.x, y: center.y, radius: clamp(maxDistance * 1.9, 5, 42) };
// }

// function drawLens(ctx, iris, lens, settings, side = "left") {
//   if (!iris) return;
//   const sideSize    = side === "left" ? settings.leftSize    : settings.rightSize;
//   const sideOffsetX = side === "left" ? settings.leftOffsetX : settings.rightOffsetX;
//   const sideOffsetY = side === "left" ? settings.leftOffsetY : settings.rightOffsetY;
//   const autoFitBoost = settings.autoFit ? clamp(iris.radius / 22, 0.55, 1.45) : 1;
//   const x = iris.x + sideOffsetX;
//   const y = iris.y + sideOffsetY;
//   const radiusX = iris.radius * settings.size * sideSize * autoFitBoost * settings.stretchX;
//   const radiusY = iris.radius * settings.size * sideSize * autoFitBoost * settings.stretchY;
//   const safeRadiusX = clamp(radiusX, 2, 95);
//   const safeRadiusY = clamp(radiusY, 2, 95);
//   const baseRadius  = Math.max(safeRadiusX, safeRadiusY);
//   const gradient = ctx.createRadialGradient(x, y, baseRadius * 0.04, x, y, baseRadius);
//   gradient.addColorStop(0, "rgba(255,255,255,0.12)");
//   gradient.addColorStop(0.18, lens.color);
//   gradient.addColorStop(0.72, lens.color);
//   gradient.addColorStop(1, lens.ring);
//   ctx.save();
//   ctx.translate(x, y); ctx.scale(safeRadiusX / safeRadiusY, 1); ctx.translate(-x, -y);
//   ctx.globalAlpha = settings.opacity;
//   ctx.globalCompositeOperation = settings.blendMode;
//   ctx.beginPath(); ctx.arc(x, y, safeRadiusY, 0, Math.PI * 2);
//   ctx.fillStyle = gradient; ctx.fill();
//   ctx.globalCompositeOperation = "source-over";
//   ctx.globalAlpha = settings.opacity * settings.ringOpacity;
//   ctx.beginPath(); ctx.arc(x, y, safeRadiusY, 0, Math.PI * 2);
//   ctx.lineWidth = Math.max(0.5, safeRadiusY * settings.ringThickness);
//   ctx.strokeStyle = lens.ring; ctx.stroke();
//   ctx.globalAlpha = settings.opacity * settings.patternOpacity;
//   for (let i = 0; i < settings.patternLines; i++) {
//     const angle = (Math.PI * 2 * i) / settings.patternLines;
//     const inner = safeRadiusY * settings.patternInner;
//     const outer = safeRadiusY * settings.patternOuter;
//     ctx.beginPath();
//     ctx.moveTo(x + Math.cos(angle) * inner, y + Math.sin(angle) * inner);
//     ctx.lineTo(x + Math.cos(angle) * outer, y + Math.sin(angle) * outer);
//     ctx.lineWidth = Math.max(0.3, safeRadiusY * 0.018);
//     ctx.strokeStyle = "rgba(255,255,255,0.22)"; ctx.stroke();
//   }
//   ctx.globalAlpha = settings.pupilCutoutOpacity;
//   ctx.globalCompositeOperation = "destination-out";
//   ctx.beginPath(); ctx.arc(x, y, safeRadiusY * settings.pupil, 0, Math.PI * 2);
//   ctx.fill();
//   ctx.restore();
// }

// // DEFAULT VALUES: Brightness 145%, Contrast 50%, Saturation 100%, blend mode soft-light
// const DEFAULT_SETTINGS = {
//   autoFit: 0,
//   size: 0.29,
//   leftSize: 1,
//   rightSize: 1,
//   stretchX: 1.62,
//   stretchY: 1.16,
//   leftOffsetX: 0,
//   leftOffsetY: 0,
//   rightOffsetX: 0,
//   rightOffsetY: 0,
//   opacity: 0.72,
//   pupil: 0.34,
//   ringThickness: 0.11,
//   ringOpacity: 0.75,
//   patternOpacity: 0.5,
//   patternLines: 26,
//   patternInner: 0.28,
//   patternOuter: 0.88,
//   pupilCutoutOpacity: 0.95,
//   brightness: 145,
//   contrast: 50,
//   saturation: 100,
//   blendMode: "soft-light",
// };

// export default function TryOn() {
//   const videoRef           = useRef(null);
//   const canvasRef          = useRef(null);
//   const streamRef          = useRef(null);
//   const faceMeshRef        = useRef(null);
//   const frameRef           = useRef(null);
//   const latestLandmarksRef = useRef(null);
//   const lastSendRef        = useRef(0);

//   const [cameraReady,   setCameraReady]   = useState(false);
//   const [modelReady,    setModelReady]    = useState(false);
//   const [cameraError,   setCameraError]   = useState("");
//   const [selectedLensId, setSelectedLensId] = useState(LENS_OPTIONS[0].id);
//   const [settings, setSettings] = useState({ ...DEFAULT_SETTINGS });

//   const selectedLens = useMemo(
//     () => LENS_OPTIONS.find((l) => l.id === selectedLensId) || LENS_OPTIONS[0],
//     [selectedLensId]
//   );

//   const updateSetting = useCallback((key, value) => {
//     setSettings((cur) => ({ ...cur, [key]: key === "blendMode" ? value : Number(value) }));
//   }, []);

//   const resetSettings = useCallback(() => setSettings({ ...DEFAULT_SETTINGS }), []);

//   const capturePhoto = useCallback(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const link = document.createElement("a");
//     link.download = `lens-tryon-${Date.now()}.png`;
//     link.href = canvas.toDataURL("image/png");
//     link.click();
//   }, []);

//   useEffect(() => {
//     let mounted = true;
//     async function setup() {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: { width: { ideal: CANVAS_WIDTH }, height: { ideal: CANVAS_HEIGHT }, facingMode: "user" },
//           audio: false,
//         });
//         if (!mounted) return;
//         streamRef.current = stream;
//         if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
//         setCameraReady(true);
//       } catch { setCameraError("Camera permission failed. Allow camera access and reload."); }

//       try {
//         await loadScript(FACE_MESH_SCRIPT);
//         if (!mounted || !window.FaceMesh) return;
//         const fm = new window.FaceMesh({ locateFile: (f) => `${FACE_MESH_ASSET_PATH}/${f}` });
//         fm.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.65, minTrackingConfidence: 0.65 });
//         fm.onResults((results) => {
//           latestLandmarksRef.current =
//             results.multiFaceLandmarks?.length ? results.multiFaceLandmarks[0] : null;
//         });
//         faceMeshRef.current = fm;
//         setModelReady(true);
//       } catch { setCameraError("Face tracking failed to load. Check internet/CDN access."); }
//     }
//     setup();
//     return () => {
//       mounted = false;
//       if (frameRef.current) cancelAnimationFrame(frameRef.current);
//       streamRef.current?.getTracks().forEach((t) => t.stop());
//       faceMeshRef.current?.close?.();
//     };
//   }, []);

//   useEffect(() => {
//     const video  = videoRef.current;
//     const canvas = canvasRef.current;
//     const ctx    = canvas?.getContext("2d");
//     if (!video || !canvas || !ctx) return;
//     let running = true;

//     async function render(time) {
//       if (!running) return;
//       const videoReady = video.readyState >= 2;
//       ctx.save();
//       ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
//       if (videoReady) {
//         ctx.translate(CANVAS_WIDTH, 0); ctx.scale(-1, 1);
//         ctx.filter = `brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturation}%)`;
//         ctx.drawImage(video, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
//         ctx.filter = "none"; ctx.restore();
//         if (faceMeshRef.current && modelReady && time - lastSendRef.current > 45) {
//           lastSendRef.current = time;
//           try { await faceMeshRef.current.send({ image: video }); } catch {}
//         }
//         const landmarks = latestLandmarksRef.current;
//         if (landmarks) {
//           const ml = landmarks.map((p) => ({ ...p, x: 1 - p.x }));
//           const leftIris  = getIrisData(ml, LEFT_IRIS,  CANVAS_WIDTH, CANVAS_HEIGHT);
//           const rightIris = getIrisData(ml, RIGHT_IRIS, CANVAS_WIDTH, CANVAS_HEIGHT);
//           drawLens(ctx, leftIris,  selectedLens, settings, "left");
//           drawLens(ctx, rightIris, selectedLens, settings, "right");
//         }
//       } else {
//         ctx.restore();
//         ctx.fillStyle = "#07070b";
//         ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
//       }
//       frameRef.current = requestAnimationFrame(render);
//     }

//     frameRef.current = requestAnimationFrame(render);
//     return () => { running = false; if (frameRef.current) cancelAnimationFrame(frameRef.current); };
//   }, [modelReady, selectedLens, settings]);

//   return (
//     <div className="ls-page">
//       <video ref={videoRef} muted playsInline autoPlay className="ls-hidden-video" />

//       <main className="ls-shell">
//         {/* ── CAMERA PANEL - takes 65% height on mobile ── */}
//         <section className="ls-preview">
//           <div className="ls-canvas-wrap">
//             <canvas
//               ref={canvasRef}
//               width={CANVAS_WIDTH}
//               height={CANVAS_HEIGHT}
//               className="ls-canvas"
//             />
//           </div>

//           {/* Top bar - Snapchat style */}
//           <div className="ls-topbar">
//             <div>
//               <div className="ls-brand">👁️ AURALENS</div>
//               <div className="ls-subbrand">virtual try-on</div>
//             </div>
//             <div className="ls-status">
//               <span className="ls-dot" style={{ background: cameraReady && modelReady ? "#36d67a" : "#f4b942" }} />
//               {cameraReady && modelReady ? "LIVE" : "STARTING"}
//             </div>
//           </div>

//           {/* Bottom lens carousel - Instagram/Snapchat style */}
//           <div className="ls-mobile-lensbar">
//             {LENS_OPTIONS.map((lens) => (
//               <button
//                 key={lens.id}
//                 type="button"
//                 onClick={() => setSelectedLensId(lens.id)}
//                 className={`ls-mobile-lens-btn ${selectedLensId === lens.id ? "active-lens" : ""}`}
//                 style={{ borderColor: selectedLensId === lens.id ? "#ffffff" : "rgba(255,255,255,.3)" }}
//               >
//                 <span className="ls-color-dot" style={{ background: lens.color }} />
//                 <span className="ls-lens-label">{lens.name.split(" ")[0]}</span>
//               </button>
//             ))}
//           </div>

//           {/* Capture button overlay - center bottom like Instagram */}
//           <button className="ls-capture-btn" onClick={capturePhoto}>
//             <div className="capture-inner" />
//           </button>

//           {(!cameraReady || !modelReady || cameraError) && (
//             <div className="ls-overlay">
//               <div className="ls-loader-card">
//                 <div className="ls-spinner" />
//                 <h2 className="ls-loader-title">{cameraError ? "Setup problem" : "Starting try-on"}</h2>
//                 <p className="ls-loader-text">{cameraError || "Allow camera access. Keep your face centered."}</p>
//               </div>
//             </div>
//           )}
//         </section>

//         {/* ── CONTROL PANEL - scrollable bottom sheet ── */}
//         <aside className="ls-sidebar">
//           <div className="ls-sidebar-header">
//             <p className="ls-eyebrow">✨ CUSTOMIZE</p>
//             <h1 className="ls-title">Adjust your lens</h1>
//           </div>

//           {/* Selected lens pill */}
//           <div className="ls-selected-card">
//             <div className="ls-selected-swatch" style={{ background: selectedLens.color, boxShadow: `0 0 12px ${selectedLens.color}` }} />
//             <div>
//               <h2 className="ls-selected-name">{selectedLens.name}</h2>
//               <p className="ls-selected-price">{selectedLens.price}</p>
//             </div>
//           </div>

//           {/* Quick lens row */}
//           <div className="ls-quick-row">
//             {LENS_OPTIONS.slice(0, 4).map((lens) => (
//               <button
//                 key={lens.id}
//                 onClick={() => setSelectedLensId(lens.id)}
//                 className={`ls-quick-lens ${selectedLensId === lens.id ? "active" : ""}`}
//               >
//                 <span style={{ background: lens.color }} />
//               </button>
//             ))}
//           </div>

//           <div className="ls-controls">
//             <div className="ls-section-header">
//               <span>🎨 IMAGE FILTERS</span>
//               <button onClick={resetSettings} className="ls-reset-mini">reset</button>
//             </div>

//             <Slider label="☀️ Brightness" value={settings.brightness} min="50" max="170" step="1" display={`${settings.brightness}%`} onChange={(v) => updateSetting("brightness", v)} />
//             <Slider label="🎚️ Contrast"   value={settings.contrast}   min="50" max="180" step="1" display={`${settings.contrast}%`}   onChange={(v) => updateSetting("contrast", v)} />
//             <Slider label="🌈 Saturation" value={settings.saturation} min="40" max="200" step="1" display={`${settings.saturation}%`} onChange={(v) => updateSetting("saturation", v)} />

//             <div className="ls-select-wrap">
//               <div className="ls-slider-top">
//                 <span>🎭 Blend Mode</span>
//                 <strong>{settings.blendMode}</strong>
//               </div>
//               <select
//                 value={settings.blendMode}
//                 onChange={(e) => updateSetting("blendMode", e.target.value)}
//                 className="ls-select"
//               >
//                 <option value="soft-light">soft-light (default)</option>
//                 <option value="multiply">multiply</option>
//                 <option value="overlay">overlay</option>
//                 <option value="color">color</option>
//                 <option value="source-over">normal</option>
//               </select>
//             </div>

//             <details className="ls-details">
//               <summary>🔧 lens fine-tuning</summary>
//               <div className="ls-details-content">
//                 <Slider label="Lens opacity" value={settings.opacity} min="0.05" max="1" step="0.01" display={`${Math.round(settings.opacity * 100)}%`} onChange={(v) => updateSetting("opacity", v)} />
//                 <Slider label="Pupil size" value={settings.pupil} min="0.1" max="0.65" step="0.01" display={`${Math.round(settings.pupil * 100)}%`} onChange={(v) => updateSetting("pupil", v)} />
//                 <Slider label="Ring thickness" value={settings.ringThickness} min="0" max="0.28" step="0.01" display={`${Math.round(settings.ringThickness * 100)}%`} onChange={(v) => updateSetting("ringThickness", v)} />
//               </div>
//             </details>
//           </div>
//         </aside>
//       </main>

//       <style>{`
//         *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
//         body { margin: 0; background: #000; }

//         input[type="range"] { width: 100%; accent-color: #ffffff; cursor: pointer; }
//         button { font-family: inherit; cursor: pointer; border: none; background: none; }

//         @keyframes spin { to { transform: rotate(360deg); } }

//         .ls-page {
//           min-height: 100vh;
//           background: #0a0a0f;
//           color: #ffffff;
//           font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, sans-serif;
//         }

//         .ls-hidden-video { display: none; }

//         .ls-shell {
//           display: flex;
//           flex-direction: column;
//           min-height: 100vh;
//         }

//         /* CAMERA PREVIEW - takes ~65% of screen height on mobile */
//         .ls-preview {
//           position: relative;
//           background: #000;
//           height: 65vh;
//           min-height: 420px;
//           max-height: 70vh;
//           overflow: hidden;
//         }

//         .ls-canvas-wrap {
//           position: relative;
//           width: 100%;
//           height: 100%;
//           background: #000;
//         }

//         .ls-canvas {
//           position: absolute;
//           top: 0;
//           left: 0;
//           width: 100%;
//           height: 100%;
//           object-fit: cover;
//         }

//         /* Top bar */
//         .ls-topbar {
//           position: absolute;
//           top: 0;
//           left: 0;
//           right: 0;
//           padding: 16px 18px;
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           background: linear-gradient(to bottom, rgba(0,0,0,0.6), transparent);
//           z-index: 10;
//           pointer-events: none;
//         }
//         .ls-brand { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
//         .ls-subbrand { font-size: 10px; opacity: 0.7; margin-top: 2px; }
//         .ls-status {
//           background: rgba(0,0,0,0.5);
//  backdrop-filter: blur(12px);
//           padding: 6px 14px;
//           border-radius: 40px;
//           font-size: 11px;
//           font-weight: 700;
//           pointer-events: auto;
//         }
//         .ls-dot {
//           width: 8px;
//           height: 8px;
//           border-radius: 50%;
//           display: inline-block;
//           margin-right: 6px;
//         }

//         /* Bottom lens carousel */
//         .ls-mobile-lensbar {
//           position: absolute;
//           bottom: 80px;
//           left: 16px;
//           right: 16px;
//           display: flex;
//           gap: 12px;
//           overflow-x: auto;
//           padding: 8px 4px;
//           z-index: 10;
//           scrollbar-width: none;
//         }
//         .ls-mobile-lensbar::-webkit-scrollbar { display: none; }

//         .ls-mobile-lens-btn {
//           flex: 0 0 auto;
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           gap: 6px;
//           background: rgba(0,0,0,0.55);
//           backdrop-filter: blur(16px);
//           border: 1.5px solid rgba(255,255,255,0.3);
//           border-radius: 48px;
//           padding: 8px 14px;
//           transition: all 0.1s ease;
//         }
//         .ls-mobile-lens-btn.active-lens {
//           border-color: white;
//           background: rgba(255,255,255,0.2);
//           transform: scale(1.02);
//         }
//         .ls-color-dot {
//           width: 28px;
//           height: 28px;
//           border-radius: 50%;
//           border: 2px solid white;
//           display: block;
//         }
//         .ls-lens-label {
//           font-size: 10px;
//           font-weight: 600;
//           color: white;
//         }

//         /* Capture button - center bottom like Instagram */
//         .ls-capture-btn {
//           position: absolute;
//           bottom: 20px;
//           left: 50%;
//           transform: translateX(-50%);
//           width: 68px;
//           height: 68px;
//           border-radius: 50%;
//           background: rgba(255,255,255,0.2);
//           backdrop-filter: blur(8px);
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           z-index: 20;
//           border: 2px solid white;
//           transition: transform 0.05s ease;
//         }
//         .ls-capture-btn:active { transform: translateX(-50%) scale(0.92); }
//         .capture-inner {
//           width: 56px;
//           height: 56px;
//           border-radius: 50%;
//           background: white;
//         }

//         /* Loader overlay */
//         .ls-overlay {
//           position: absolute;
//           inset: 0;
//           background: rgba(0,0,0,0.85);
//           backdrop-filter: blur(12px);
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           z-index: 30;
//         }
//         .ls-loader-card {
//           text-align: center;
//           padding: 24px;
//           background: rgba(30,30,40,0.8);
//           border-radius: 32px;
//           width: 260px;
//         }
//         .ls-spinner {
//           width: 44px;
//           height: 44px;
//           border: 3px solid rgba(255,255,255,0.2);
//           border-top-color: white;
//           border-radius: 50%;
//           margin: 0 auto 16px;
//           animation: spin 0.8s linear infinite;
//         }

//         /* Bottom control sheet */
//         .ls-sidebar {
//           background: rgba(18, 20, 28, 0.96);
//           backdrop-filter: blur(20px);
//           border-radius: 28px 28px 0 0;
//           padding: 20px 18px 30px;
//           flex: 1;
//         }
//         .ls-sidebar-header { margin-bottom: 16px; }
//         .ls-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 1.5px; color: #aaa; text-transform: uppercase; }
//         .ls-title { font-size: 24px; font-weight: 800; margin-top: 6px; letter-spacing: -0.5px; }

//         .ls-selected-card {
//           display: flex;
//           align-items: center;
//           gap: 14px;
//           background: rgba(255,255,255,0.08);
//           border-radius: 28px;
//           padding: 12px 16px;
//           margin-bottom: 12px;
//         }
//         .ls-selected-swatch { width: 48px; height: 48px; border-radius: 50%; border: 2px solid white; }
//         .ls-selected-name { font-size: 16px; font-weight: 800; }
//         .ls-selected-price { font-size: 12px; opacity: 0.7; margin-top: 2px; }

//         .ls-quick-row {
//           display: flex;
//           gap: 12px;
//           margin-bottom: 20px;
//         }
//         .ls-quick-lens {
//           width: 44px;
//           height: 44px;
//           border-radius: 50%;
//           background: rgba(255,255,255,0.1);
//           border: 2px solid rgba(255,255,255,0.3);
//           display: flex;
//           align-items: center;
//           justify-content: center;
//         }
//         .ls-quick-lens.active { border-color: white; background: rgba(255,255,255,0.2); transform: scale(1.05); }
//         .ls-quick-lens span { width: 28px; height: 28px; border-radius: 50%; display: block; }

//         .ls-controls {
//           display: flex;
//           flex-direction: column;
//           gap: 16px;
//         }
//         .ls-section-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           font-size: 12px;
//           font-weight: 700;
//           color: #aaa;
//           letter-spacing: 1px;
//         }
//         .ls-reset-mini {
//           background: rgba(255,255,255,0.12);
//           padding: 6px 14px;
//           border-radius: 40px;
//           font-size: 11px;
//           color: white;
//         }
//         .slider-item { display: flex; flex-direction: column; gap: 6px; }
//         .ls-slider-top { display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; opacity: 0.9; }
//         .ls-select-wrap { display: flex; flex-direction: column; gap: 6px; }
//         .ls-select {
//           background: rgba(255,255,255,0.1);
//           border: 1px solid rgba(255,255,255,0.2);
//           border-radius: 14px;
//           padding: 12px;
//           color: white;
//           font-weight: 600;
//           outline: none;
//         }
//         .ls-details { margin-top: 8px; }
//         .ls-details summary { font-size: 12px; font-weight: 600; opacity: 0.8; padding: 8px 0; cursor: pointer; }
//         .ls-details-content { display: flex; flex-direction: column; gap: 12px; margin-top: 12px; padding-left: 6px; }

//         /* Desktop/tablet fallback */
//         @media (min-width: 768px) {
//           .ls-preview { height: 70vh; max-height: 600px; }
//           .ls-sidebar { border-radius: 28px; margin: 12px; max-height: none; }
//           .ls-shell { padding: 12px; }
//         }
//       `}</style>
//     </div>
//   );
// }

// function Slider({ label, value, min, max, step, display, onChange }) {
//   return (
//     <label className="slider-item">
//       <div className="ls-slider-top">
//         <span>{label}</span>
//         <strong>{display}</strong>
//       </div>
//       <input
//         type="range"
//         value={value}
//         min={min}
//         max={max}
//         step={step}
//         onChange={(e) => onChange(e.target.value)}
//       />
//     </label>
//   );
// }




import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

const FACE_MESH_SCRIPT = "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js";
const FACE_MESH_ASSET_PATH = "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh";

const LENS_OPTIONS = [
  { id: "natural-hazel",  name: "Natural Hazel",  color: "#9b6a2f", ring: "#3a2414", price: "PKR 4,800", emoji: "🍯" },
  { id: "crystal-gray",   name: "Crystal Gray",   color: "#aeb6bd", ring: "#35404a", price: "PKR 5,200", emoji: "🩶" },
  { id: "ocean-blue",     name: "Ocean Blue",     color: "#4aa3ff", ring: "#123455", price: "PKR 5,500", emoji: "🌊" },
  { id: "emerald-green",  name: "Emerald Green",  color: "#2fbf71", ring: "#0d3b24", price: "PKR 5,900", emoji: "💚" },
  { id: "honey-brown",    name: "Honey Brown",    color: "#c9822b", ring: "#4a2b10", price: "PKR 4,900", emoji: "🌻" },
  { id: "violet-dream",   name: "Violet Dream",   color: "#8f65ff", ring: "#302050", price: "PKR 6,300", emoji: "✨" },
];

const LEFT_IRIS  = [468, 469, 470, 471, 472];
const RIGHT_IRIS = [473, 474, 475, 476, 477];

const clamp = (v, mn, mx) => Math.min(Math.max(v, mn), mx);

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement("script");
    s.src = src; s.async = true; s.crossOrigin = "anonymous";
    s.onload = resolve; s.onerror = reject;
    document.body.appendChild(s);
  });
}

function getIrisData(landmarks, irisIndexes, width, height) {
  const points = irisIndexes.map(i => landmarks[i]).filter(Boolean).map(p => ({ x: p.x * width, y: p.y * height }));
  if (points.length < 4) return null;
  const center = points.reduce((acc, p) => ({ x: acc.x + p.x / points.length, y: acc.y + p.y / points.length }), { x: 0, y: 0 });
  const maxDistance = points.reduce((max, p) => {
    const dx = p.x - center.x, dy = p.y - center.y;
    return Math.max(max, Math.sqrt(dx * dx + dy * dy));
  }, 0);
  return { x: center.x, y: center.y, radius: clamp(maxDistance * 1.9, 5, 42) };
}

function drawLens(ctx, iris, lens, settings, side = "left") {
  if (!iris) return;
  const sideSize    = side === "left" ? settings.leftSize    : settings.rightSize;
  const sideOffsetX = side === "left" ? settings.leftOffsetX : settings.rightOffsetX;
  const sideOffsetY = side === "left" ? settings.leftOffsetY : settings.rightOffsetY;
  const autoFitBoost = settings.autoFit ? clamp(iris.radius / 22, 0.55, 1.45) : 1;
  const x = iris.x + sideOffsetX;
  const y = iris.y + sideOffsetY;
  const radiusX = iris.radius * settings.size * sideSize * autoFitBoost * settings.stretchX;
  const radiusY = iris.radius * settings.size * sideSize * autoFitBoost * settings.stretchY;
  const safeRadiusX = clamp(radiusX, 2, 95);
  const safeRadiusY = clamp(radiusY, 2, 95);
  const baseRadius  = Math.max(safeRadiusX, safeRadiusY);
  const gradient = ctx.createRadialGradient(x, y, baseRadius * 0.04, x, y, baseRadius);
  gradient.addColorStop(0, "rgba(255,255,255,0.12)");
  gradient.addColorStop(0.18, lens.color);
  gradient.addColorStop(0.72, lens.color);
  gradient.addColorStop(1, lens.ring);
  ctx.save();
  ctx.translate(x, y); ctx.scale(safeRadiusX / safeRadiusY, 1); ctx.translate(-x, -y);
  ctx.globalAlpha = settings.opacity;
  ctx.globalCompositeOperation = settings.blendMode;
  ctx.beginPath(); ctx.arc(x, y, safeRadiusY, 0, Math.PI * 2);
  ctx.fillStyle = gradient; ctx.fill();
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = settings.opacity * settings.ringOpacity;
  ctx.beginPath(); ctx.arc(x, y, safeRadiusY, 0, Math.PI * 2);
  ctx.lineWidth = Math.max(0.5, safeRadiusY * settings.ringThickness);
  ctx.strokeStyle = lens.ring; ctx.stroke();
  ctx.globalAlpha = settings.opacity * settings.patternOpacity;
  for (let i = 0; i < settings.patternLines; i++) {
    const angle = (Math.PI * 2 * i) / settings.patternLines;
    const inner = safeRadiusY * settings.patternInner;
    const outer = safeRadiusY * settings.patternOuter;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(angle) * inner, y + Math.sin(angle) * inner);
    ctx.lineTo(x + Math.cos(angle) * outer, y + Math.sin(angle) * outer);
    ctx.lineWidth = Math.max(0.3, safeRadiusY * 0.018);
    ctx.strokeStyle = "rgba(255,255,255,0.22)"; ctx.stroke();
  }
  ctx.globalAlpha = settings.pupilCutoutOpacity;
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath(); ctx.arc(x, y, safeRadiusY * settings.pupil, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

const DEFAULT_SETTINGS = {
  autoFit: 0, size: 0.29,
  leftSize: 1, rightSize: 1,
  stretchX: 1.62, stretchY: 1.16,
  leftOffsetX: 0, leftOffsetY: 0, rightOffsetX: 0, rightOffsetY: 0,
  opacity: 0.72, pupil: 0.34,
  ringThickness: 0.11, ringOpacity: 0.75,
  patternOpacity: 0.5, patternLines: 26,
  patternInner: 0.28, patternOuter: 0.88,
  pupilCutoutOpacity: 0.95,
  brightness: 145, contrast: 50, saturation: 100,
  blendMode: "soft-light",
};

export default function TryOn() {
  const videoRef           = useRef(null);
  const canvasRef          = useRef(null);
  const streamRef          = useRef(null);
  const faceMeshRef        = useRef(null);
  const frameRef           = useRef(null);
  const latestLandmarksRef = useRef(null);
  const lastSendRef        = useRef(0);
  const touchStartX        = useRef(null);
  const sheetRef           = useRef(null);

  const [cameraReady,    setCameraReady]    = useState(false);
  const [modelReady,     setModelReady]     = useState(false);
  const [cameraError,    setCameraError]    = useState("");
  const [selectedLensId, setSelectedLensId] = useState(LENS_OPTIONS[0].id);
  const [settings,       setSettings]       = useState({ ...DEFAULT_SETTINGS });
  const [sheetOpen,      setSheetOpen]      = useState(false);
  const [captured,       setCaptured]       = useState(false);
  const [ripple,         setRipple]         = useState(false);

  const selectedLens = useMemo(
    () => LENS_OPTIONS.find(l => l.id === selectedLensId) || LENS_OPTIONS[0],
    [selectedLensId]
  );
  const selectedIdx = LENS_OPTIONS.findIndex(l => l.id === selectedLensId);

  const updateSetting = useCallback((key, value) => {
    setSettings(cur => ({ ...cur, [key]: key === "blendMode" ? value : Number(value) }));
  }, []);

  const resetSettings = useCallback(() => setSettings({ ...DEFAULT_SETTINGS }), []);

  const capturePhoto = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setRipple(true);
    setTimeout(() => setRipple(false), 600);
    setCaptured(true);
    setTimeout(() => setCaptured(false), 1200);
    const link = document.createElement("a");
    link.download = `auralens-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, []);

  const cycleLens = useCallback((dir) => {
    const next = (selectedIdx + dir + LENS_OPTIONS.length) % LENS_OPTIONS.length;
    setSelectedLensId(LENS_OPTIONS[next].id);
  }, [selectedIdx]);

  // Touch swipe to change lens
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) cycleLens(diff > 0 ? 1 : -1);
    touchStartX.current = null;
  };

  useEffect(() => {
    let mounted = true;
    async function setup() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: CANVAS_WIDTH }, height: { ideal: CANVAS_HEIGHT }, facingMode: "user" },
          audio: false,
        });
        if (!mounted) return;
        streamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
        setCameraReady(true);
      } catch { setCameraError("Camera access denied. Allow camera and reload."); }

      try {
        await loadScript(FACE_MESH_SCRIPT);
        if (!mounted || !window.FaceMesh) return;
        const fm = new window.FaceMesh({ locateFile: f => `${FACE_MESH_ASSET_PATH}/${f}` });
        fm.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.65, minTrackingConfidence: 0.65 });
        fm.onResults(results => {
          latestLandmarksRef.current = results.multiFaceLandmarks?.length ? results.multiFaceLandmarks[0] : null;
        });
        faceMeshRef.current = fm;
        setModelReady(true);
      } catch { setCameraError("Face tracking failed to load."); }
    }
    setup();
    return () => {
      mounted = false;
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
      faceMeshRef.current?.close?.();
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current, canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!video || !canvas || !ctx) return;
    let running = true;

    async function render(time) {
      if (!running) return;
      const videoReady = video.readyState >= 2;
      ctx.save();
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      if (videoReady) {
        ctx.translate(CANVAS_WIDTH, 0); ctx.scale(-1, 1);
        ctx.filter = `brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturation}%)`;
        ctx.drawImage(video, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.filter = "none"; ctx.restore();
        if (faceMeshRef.current && modelReady && time - lastSendRef.current > 45) {
          lastSendRef.current = time;
          try { await faceMeshRef.current.send({ image: video }); } catch {}
        }
        const landmarks = latestLandmarksRef.current;
        if (landmarks) {
          const ml = landmarks.map(p => ({ ...p, x: 1 - p.x }));
          drawLens(ctx, getIrisData(ml, LEFT_IRIS,  CANVAS_WIDTH, CANVAS_HEIGHT), selectedLens, settings, "left");
          drawLens(ctx, getIrisData(ml, RIGHT_IRIS, CANVAS_WIDTH, CANVAS_HEIGHT), selectedLens, settings, "right");
        }
      } else {
        ctx.restore();
        ctx.fillStyle = "#000"; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }
      frameRef.current = requestAnimationFrame(render);
    }

    frameRef.current = requestAnimationFrame(render);
    return () => { running = false; if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [modelReady, selectedLens, settings]);

  const isLive = cameraReady && modelReady;

  return (
    <div className="al-root">
      <video ref={videoRef} muted playsInline autoPlay style={{ display: "none" }} />

      {/* FULLSCREEN CAMERA */}
      <div
        className="al-camera"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="al-canvas"
        />

        {/* Flash capture effect */}
        <div className={`al-flash ${captured ? "flash-active" : ""}`} />

        {/* Ripple on capture */}
        {ripple && <div className="al-ripple" />}

        {/* ── TOP BAR ── */}
        <div className="al-top">
          <div className="al-brand">
            <span className="al-brand-icon">👁</span>
            <div>
              <div className="al-brand-name">AURALENS</div>
              <div className="al-brand-sub">virtual try-on</div>
            </div>
          </div>
          <div className="al-top-right">
            <div className={`al-live-pill ${isLive ? "live" : "loading"}`}>
              <span className="al-live-dot" />
              {isLive ? "LIVE" : "•••"}
            </div>
          </div>
        </div>

        {/* ── CURRENT LENS NAME badge ── */}
        <div className="al-lens-badge">
          <span className="al-badge-emoji">{selectedLens.emoji}</span>
          <span className="al-badge-name">{selectedLens.name}</span>
          <span className="al-badge-price">{selectedLens.price}</span>
        </div>

        {/* ── SWIPE HINT ── */}
        <div className="al-swipe-hint">← swipe to switch →</div>

        {/* ── LENS CAROUSEL ── */}
        <div className="al-carousel-wrap">
          <div className="al-carousel">
            {LENS_OPTIONS.map((lens, i) => {
              const isActive = lens.id === selectedLensId;
              const dist = Math.abs(i - selectedIdx);
              return (
                <button
                  key={lens.id}
                  className={`al-lens-chip ${isActive ? "chip-active" : ""}`}
                  onClick={() => setSelectedLensId(lens.id)}
                  style={{
                    transform: isActive ? "scale(1.18)" : dist === 1 ? "scale(0.92)" : "scale(0.82)",
                    opacity: isActive ? 1 : dist === 1 ? 0.75 : 0.5,
                  }}
                >
                  <div
                    className="al-chip-swatch"
                    style={{
                      background: `radial-gradient(circle at 35% 35%, ${lens.color}dd, ${lens.ring})`,
                      boxShadow: isActive ? `0 0 0 2.5px white, 0 0 18px ${lens.color}99` : "none",
                    }}
                  />
                  {isActive && <span className="al-chip-label">{lens.name.split(" ")[0]}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── BOTTOM ACTIONS ── */}
        <div className="al-actions">
          {/* Adjust btn */}
          <button className="al-action-btn" onClick={() => setSheetOpen(true)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
            </svg>
          </button>

          {/* Capture */}
          <button className="al-capture" onClick={capturePhoto}>
            <div className="al-capture-ring" style={{ borderColor: selectedLens.color }} />
            <div className="al-capture-inner" />
          </button>

          {/* Arrow right */}
          <button className="al-action-btn" onClick={() => cycleLens(1)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>

        {/* Loading overlay */}
        {(!isLive || cameraError) && (
          <div className="al-loading">
            <div className="al-loading-card">
              {cameraError ? (
                <>
                  <div className="al-load-icon">⚠️</div>
                  <div className="al-load-title">Setup issue</div>
                  <div className="al-load-text">{cameraError}</div>
                </>
              ) : (
                <>
                  <div className="al-spinner" />
                  <div className="al-load-title">Starting try-on</div>
                  <div className="al-load-text">Allow camera access &amp; keep face centered</div>
                  <div className="al-load-steps">
                    <div className={`al-step ${cameraReady ? "done" : "active"}`}>📷 Camera {cameraReady ? "✓" : "…"}</div>
                    <div className={`al-step ${modelReady ? "done" : cameraReady ? "active" : ""}`}>🧠 AI model {modelReady ? "✓" : "…"}</div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── BOTTOM SHEET ── */}
      <div className={`al-sheet-backdrop ${sheetOpen ? "open" : ""}`} onClick={() => setSheetOpen(false)} />
      <div className={`al-sheet ${sheetOpen ? "sheet-open" : ""}`} ref={sheetRef}>
        <div className="al-sheet-handle" />
        <div className="al-sheet-header">
          <div className="al-sheet-title">
            <span style={{ color: selectedLens.color }}>{selectedLens.emoji}</span> {selectedLens.name}
          </div>
          <div className="al-sheet-price">{selectedLens.price}</div>
        </div>

        <div className="al-sheet-body">
          <p className="al-sheet-section">Image Filters</p>

          <SheetSlider label="Brightness" value={settings.brightness} min={50} max={170} step={1}
            display={`${settings.brightness}%`} onChange={v => updateSetting("brightness", v)} color={selectedLens.color} />
          <SheetSlider label="Contrast" value={settings.contrast} min={50} max={180} step={1}
            display={`${settings.contrast}%`} onChange={v => updateSetting("contrast", v)} color={selectedLens.color} />
          <SheetSlider label="Saturation" value={settings.saturation} min={40} max={200} step={1}
            display={`${settings.saturation}%`} onChange={v => updateSetting("saturation", v)} color={selectedLens.color} />

          <p className="al-sheet-section" style={{ marginTop: 20 }}>Lens Fine-Tuning</p>

          <SheetSlider label="Opacity" value={Math.round(settings.opacity * 100)} min={5} max={100} step={1}
            display={`${Math.round(settings.opacity * 100)}%`} onChange={v => updateSetting("opacity", v / 100)} color={selectedLens.color} />
          <SheetSlider label="Pupil Size" value={Math.round(settings.pupil * 100)} min={10} max={65} step={1}
            display={`${Math.round(settings.pupil * 100)}%`} onChange={v => updateSetting("pupil", v / 100)} color={selectedLens.color} />
          <SheetSlider label="Ring Thickness" value={Math.round(settings.ringThickness * 100)} min={0} max={28} step={1}
            display={`${Math.round(settings.ringThickness * 100)}%`} onChange={v => updateSetting("ringThickness", v / 100)} color={selectedLens.color} />

          <div className="al-blend-row">
            <span className="al-blend-label">Blend Mode</span>
            <select className="al-blend-select" value={settings.blendMode} onChange={e => updateSetting("blendMode", e.target.value)}
              style={{ borderColor: `${selectedLens.color}66` }}>
              <option value="soft-light">Soft Light</option>
              <option value="multiply">Multiply</option>
              <option value="overlay">Overlay</option>
              <option value="color">Color</option>
              <option value="source-over">Normal</option>
            </select>
          </div>

          <button className="al-reset-btn" onClick={() => { resetSettings(); setSheetOpen(false); }}
            style={{ background: `${selectedLens.color}22`, color: selectedLens.color, borderColor: `${selectedLens.color}44` }}>
            Reset to defaults
          </button>
        </div>
      </div>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&display=swap');

        body { margin: 0; background: #000; overflow: hidden; }

        .al-root {
          position: fixed;
          inset: 0;
          font-family: 'Syne', -apple-system, sans-serif;
          background: #000;
          overflow: hidden;
        }

        /* ── FULLSCREEN CAMERA ── */
        .al-camera {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          user-select: none;
        }

        .al-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Flash */
        .al-flash {
          position: absolute;
          inset: 0;
          background: white;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.05s;
          z-index: 50;
        }
        .al-flash.flash-active { opacity: 0.7; transition: opacity 0s; }

        /* Ripple */
        .al-ripple {
          position: absolute;
          bottom: 80px;
          left: 50%;
          transform: translateX(-50%);
          width: 76px;
          height: 76px;
          border-radius: 50%;
          border: 2px solid white;
          animation: ripple-out 0.6s ease-out forwards;
          pointer-events: none;
          z-index: 20;
        }
        @keyframes ripple-out {
          from { transform: translateX(-50%) scale(1); opacity: 0.8; }
          to   { transform: translateX(-50%) scale(2.5); opacity: 0; }
        }

        /* ── TOP BAR ── */
        .al-top {
          position: absolute;
          top: 0; left: 0; right: 0;
          padding: env(safe-area-inset-top, 12px) 20px 16px;
          padding-top: max(env(safe-area-inset-top, 12px), 12px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(180deg, rgba(0,0,0,0.65) 0%, transparent 100%);
          z-index: 10;
        }
        .al-brand { display: flex; align-items: center; gap: 10px; }
        .al-brand-icon { font-size: 26px; filter: drop-shadow(0 0 8px rgba(255,255,255,0.5)); }
        .al-brand-name { font-size: 18px; font-weight: 800; letter-spacing: 1px; line-height: 1; }
        .al-brand-sub { font-size: 10px; opacity: 0.6; margin-top: 2px; letter-spacing: 2px; text-transform: uppercase; }

        .al-top-right { display: flex; align-items: center; gap: 10px; }
        .al-live-pill {
          display: flex; align-items: center; gap: 6px;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(12px);
          padding: 5px 12px;
          border-radius: 40px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          border: 1px solid rgba(255,255,255,0.15);
        }
        .al-live-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          display: block;
        }
        .al-live-pill.live .al-live-dot { background: #36d67a; box-shadow: 0 0 6px #36d67a; animation: pulse-dot 1.8s ease infinite; }
        .al-live-pill.loading .al-live-dot { background: #f4b942; }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        /* Lens name badge */
        .al-lens-badge {
          position: absolute;
          top: 72px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0,0,0,0.45);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 40px;
          padding: 6px 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          z-index: 10;
          animation: badge-in 0.3s ease;
        }
        @keyframes badge-in {
          from { opacity: 0; transform: translateX(-50%) translateY(-6px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .al-badge-emoji { font-size: 16px; }
        .al-badge-name { font-size: 13px; font-weight: 700; }
        .al-badge-price { font-size: 12px; opacity: 0.65; }

        /* Swipe hint */
        .al-swipe-hint {
          position: absolute;
          top: 115px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 1.5px;
          color: rgba(255,255,255,0.4);
          z-index: 10;
          text-transform: uppercase;
        }

        /* ── LENS CAROUSEL ── */
        .al-carousel-wrap {
          position: absolute;
          bottom: 110px;
          left: 0; right: 0;
          z-index: 10;
        }
        .al-carousel {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 14px;
          padding: 12px 20px;
        }
        .al-lens-chip {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          background: none;
          border: none;
          cursor: pointer;
          transition: transform 0.22s cubic-bezier(.34,1.56,.64,1), opacity 0.22s ease;
          padding: 4px;
        }
        .al-chip-swatch {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          transition: box-shadow 0.2s ease;
        }
        .al-chip-label {
          font-size: 10px;
          font-weight: 700;
          color: white;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          animation: label-in 0.2s ease;
        }
        @keyframes label-in {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── BOTTOM ACTIONS ── */
        .al-actions {
          position: absolute;
          bottom: 0;
          left: 0; right: 0;
          padding-bottom: max(env(safe-area-inset-bottom, 20px), 20px);
          padding-top: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 36px;
          background: linear-gradient(0deg, rgba(0,0,0,0.6) 0%, transparent 100%);
          z-index: 10;
        }

        .al-action-btn {
          width: 50px; height: 50px;
          border-radius: 50%;
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.25);
          display: flex; align-items: center; justify-content: center;
          color: white;
          transition: all 0.1s ease;
          cursor: pointer;
        }
        .al-action-btn:active { transform: scale(0.88); background: rgba(255,255,255,0.22); }

        /* Capture button */
        .al-capture {
          position: relative;
          width: 76px; height: 76px;
          background: none;
          border: none;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.1s ease;
        }
        .al-capture:active { transform: scale(0.93); }
        .al-capture-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2.5px solid white;
          transition: border-color 0.3s ease;
        }
        .al-capture-inner {
          width: 62px; height: 62px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 0 20px rgba(255,255,255,0.4);
          transition: transform 0.1s ease, box-shadow 0.3s ease;
        }
        .al-capture:active .al-capture-inner { transform: scale(0.88); }

        /* ── LOADING OVERLAY ── */
        .al-loading {
          position: absolute; inset: 0;
          background: rgba(0,0,0,0.88);
          backdrop-filter: blur(16px);
          display: flex; align-items: center; justify-content: center;
          z-index: 40;
        }
        .al-loading-card {
          text-align: center;
          padding: 32px 28px;
          background: rgba(20,20,28,0.9);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 32px;
          width: min(300px, 85vw);
        }
        .al-load-icon { font-size: 40px; margin-bottom: 12px; }
        .al-load-title { font-size: 20px; font-weight: 800; margin-bottom: 8px; }
        .al-load-text { font-size: 13px; opacity: 0.6; line-height: 1.5; margin-bottom: 20px; }
        .al-load-steps { display: flex; flex-direction: column; gap: 8px; }
        .al-step { font-size: 13px; font-weight: 600; opacity: 0.35; transition: opacity 0.3s; }
        .al-step.active { opacity: 0.9; }
        .al-step.done { opacity: 1; color: #36d67a; }

        .al-spinner {
          width: 44px; height: 44px;
          border: 3px solid rgba(255,255,255,0.15);
          border-top-color: white;
          border-radius: 50%;
          margin: 0 auto 20px;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── BOTTOM SHEET ── */
        .al-sheet-backdrop {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0);
          z-index: 60;
          pointer-events: none;
          transition: background 0.3s ease;
        }
        .al-sheet-backdrop.open {
          background: rgba(0,0,0,0.5);
          pointer-events: auto;
          backdrop-filter: blur(4px);
        }

        .al-sheet {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          background: #111116;
          border-radius: 28px 28px 0 0;
          border-top: 1px solid rgba(255,255,255,0.1);
          transform: translateY(100%);
          transition: transform 0.38s cubic-bezier(.32,.72,0,1);
          z-index: 70;
          max-height: 85vh;
          overflow-y: auto;
          padding-bottom: max(env(safe-area-inset-bottom, 20px), 20px);
        }
        .al-sheet.sheet-open { transform: translateY(0); }

        .al-sheet-handle {
          width: 36px; height: 4px;
          background: rgba(255,255,255,0.25);
          border-radius: 2px;
          margin: 12px auto 0;
        }

        .al-sheet-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 22px 8px;
        }
        .al-sheet-title { font-size: 20px; font-weight: 800; display: flex; align-items: center; gap: 8px; }
        .al-sheet-price { font-size: 14px; font-weight: 700; opacity: 0.6; }

        .al-sheet-body { padding: 8px 22px 16px; display: flex; flex-direction: column; gap: 16px; }

        .al-sheet-section {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
        }

        .al-slider-wrap { display: flex; flex-direction: column; gap: 8px; }
        .al-slider-row { display: flex; justify-content: space-between; align-items: center; }
        .al-slider-name { font-size: 14px; font-weight: 600; }
        .al-slider-val { font-size: 14px; font-weight: 800; }
        .al-range { width: 100%; height: 4px; appearance: none; border-radius: 2px; cursor: pointer; }
        .al-range::-webkit-slider-thumb {
          appearance: none;
          width: 20px; height: 20px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        }

        .al-blend-row {
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 12px 16px;
        }
        .al-blend-label { font-size: 14px; font-weight: 600; }
        .al-blend-select {
          background: rgba(255,255,255,0.1);
          border: 1px solid;
          border-radius: 10px;
          padding: 6px 12px;
          color: white;
          font-weight: 700;
          font-size: 13px;
          outline: none;
          font-family: inherit;
        }

        .al-reset-btn {
          width: 100%;
          padding: 14px;
          border-radius: 14px;
          border: 1px solid;
          font-family: inherit;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          margin-top: 4px;
          letter-spacing: 0.5px;
        }

        button { font-family: inherit; cursor: pointer; border: none; background: none; color: white; }
        input[type="range"] { cursor: pointer; }
      `}</style>
    </div>
  );
}

function SheetSlider({ label, value, min, max, step, display, onChange, color }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="al-slider-wrap">
      <div className="al-slider-row">
        <span className="al-slider-name">{label}</span>
        <span className="al-slider-val" style={{ color }}>{display}</span>
      </div>
      <input
        type="range"
        className="al-range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={e => onChange(e.target.value)}
        style={{
          background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, rgba(255,255,255,0.15) ${pct}%, rgba(255,255,255,0.15) 100%)`
        }}
      />
    </div>
  );
}