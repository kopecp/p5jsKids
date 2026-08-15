"use client";

import { useEffect, useRef, useState } from "react";
import type p5Type from "p5";
import { PRIME_NUMBERS } from "./primeNumbers";

type LabId = "sunflower" | "mandelbrot" | "fibonacci" | "orbit" | "primes" | "formulas" | "mobiusDrive";
type CoordinateSystem = "cartesian" | "cylindrical" | "elliptic";
type FormulaId = "heart" | "butterfly" | "rose" | "trefoil" | "torus" | "mobius";
type ViewMode = "xy" | "3d";
type MotionControlStatus = "desktop" | "idle" | "requesting" | "listening" | "active" | "denied" | "unsupported" | "insecure";
type MotionInput = { mobile: boolean; enabled: boolean; throttle: number; steering: number };
type DriveGameOverReason = "edge" | "tree";

type Settings = {
  sunflower: { seeds: number; angle: number; size: number; speed: number; guides: boolean };
  mandelbrot: { depth: number; centerX: number; centerY: number; iterations: number; palette: number; buildSpeed: number };
  fibonacci: { turns: number; speed: number; thickness: number; guides: boolean };
  orbit: { points: number; twist: number; speed: number; opacity: number; connections: boolean; system: CoordinateSystem };
  primes: { count: number; spread: number; speed: number; opacity: number; connections: boolean; system: CoordinateSystem };
  formulas: { shape: FormulaId; view: ViewMode; speed: number; thickness: number; opacity: number };
  mobiusDrive: { maxSpeed: number; trackWidth: number; motionSensitivity: number; carColor: "coral" | "blue" | "lime"; throttle: -1 | 0 | 1; steering: -1 | 0 | 1; camera: "orbit" | "thirdPerson"; guides: boolean };
};

const FORMULAS: Array<{ id: FormulaId; name: string; dimension: "2D" | "3D"; equation: string; description: string }> = [
  { id: "heart", name: "Serce", dimension: "2D", equation: "x=16sin³t,  y=13cost−5cos2t−2cos3t−cos4t", description: "Suma kilku prostych drgań układa się w znajomy kształt serca." },
  { id: "butterfly", name: "Motyl", dimension: "2D", equation: "B=eᶜᵒˢᵗ−2cos4t+sin⁵(t/12);  x=sin(t)B, y=cos(t)B", description: "Wykładnik, sinus i cosinus wspólnie rysują skrzydła motyla." },
  { id: "rose", name: "Róża pięciopłatkowa", dimension: "2D", equation: "r=cos(5θ)", description: "Jedno równanie biegunowe tworzy dokładnie pięć płatków." },
  { id: "trefoil", name: "Węzeł trójlistny", dimension: "3D", equation: "x=sin t+2sin2t,  y=cos t−2cos2t,  z=−sin3t", description: "Najprostszy prawdziwy węzeł — zamknięta pętla z trzema skrzyżowaniami." },
  { id: "torus", name: "Węzeł torusowy (5,2)", dimension: "3D", equation: "x=(R+r cos5t)cos2t,  y=(R+r cos5t)sin2t,  z=r sin5t", description: "Krzywa oplata niewidzialny obwarzanek w dwóch kierunkach naraz." },
  { id: "mobius", name: "Wstęga Möbiusa", dimension: "3D", equation: "x=(R+s cos(t/2))cos t,  y=(R+s cos(t/2))sin t,  z=s sin(t/2)", description: "Powierzchnia, która ma tylko jedną stronę i jedną krawędź." },
];

const LABS: Array<{
  id: LabId;
  number: string;
  short: string;
  title: string;
  italic: string;
  eyebrow: string;
  description: string;
  color: string;
}> = [
  {
    id: "sunflower",
    number: "01",
    short: "Słonecznik",
    title: "Zakręć",
    italic: "słonecznikiem!",
    eyebrow: "MATEMATYKA, KTÓRA ROŚNIE",
    description: "Jedna prosta reguła układa nasiona tak, jak robi to natura. Zmień kąt i wypatrz nowe ramiona spirali.",
    color: "#ff6a3d",
  },
  {
    id: "mandelbrot",
    number: "02",
    short: "Mandelbrot",
    title: "Zajrzyj w",
    italic: "nieskończoność!",
    eyebrow: "FRAKTAL BEZ KOŃCA",
    description: "Powtarzamy maleńkie działanie na liczbach zespolonych. Z prostego przepisu wyrasta świat pełen zatok i wysp.",
    color: "#6c5ce7",
  },
  {
    id: "fibonacci",
    number: "03",
    short: "Fibonacci",
    title: "Policz rytm",
    italic: "spirali!",
    eyebrow: "CIĄG, KTÓRY BUDUJE",
    description: "Każda liczba powstaje z dwóch poprzednich. Ten rytm można zobaczyć w muszlach, liściach i wirach.",
    color: "#00a884",
  },
  {
    id: "orbit",
    number: "04",
    short: "Orbity 3D",
    title: "Wpraw kosmos",
    italic: "w ruch!",
    eyebrow: "GEOMETRIA W PRZESTRZENI",
    description: "Punkty krążą po kuli, a złoty kąt rozstawia je równomiernie. Obrót zmienia płaski ekran w przestrzeń.",
    color: "#2774e8",
  },
  {
    id: "primes",
    number: "05",
    short: "Liczby pierwsze",
    title: "Odkryj",
    italic: "galaktykę liczb!",
    eyebrow: "PIERWSZE W TRZECH WYMIARACH",
    description: "Gotową listę liczb pierwszych nawijamy na przestrzenną helisę. Ich nieregularne odstępy tworzą zaskakujący kosmiczny rytm.",
    color: "#e84393",
  },
  {
    id: "formulas",
    number: "06",
    short: "Piękne wzory",
    title: "Narysuj",
    italic: "równanie!",
    eyebrow: "ATLAS PIĘKNYCH KSZTAŁTÓW",
    description: "Wybierz równanie i zobacz, jak symbole zamieniają się w serce, kwiat, motyla, węzeł albo niezwykłą powierzchnię.",
    color: "#9b51e0",
  },
  {
    id: "mobiusDrive",
    number: "07",
    short: "Möbius Drive",
    title: "Przejedź",
    italic: "na drugą stronę!",
    eyebrow: "TOR Z TYLKO JEDNĄ STRONĄ",
    description: "Utrzymaj samochodzik na nieruchomej wstędze Möbiusa. Skręcaj, omijaj drzewa, pilnuj krawędzi i spróbuj przejechać na pozornie drugą stronę toru.",
    color: "#f05252",
  },
];

const INITIAL_SETTINGS: Settings = {
  sunflower: { seeds: 620, angle: 137.5, size: 7, speed: 1.2, guides: false },
  mandelbrot: { depth: 0, centerX: -0.55, centerY: 0, iterations: 110, palette: 0.12, buildSpeed: 1 },
  fibonacci: { turns: 10, speed: 1, thickness: 5, guides: true },
  orbit: { points: 680, twist: 1, speed: 1, opacity: 0.9, connections: true, system: "cartesian" },
  primes: { count: 420, spread: 1, speed: 0.8, opacity: 0.9, connections: true, system: "cylindrical" },
  formulas: { shape: "heart", view: "xy", speed: 0.8, thickness: 5, opacity: 0.95 },
  mobiusDrive: { maxSpeed: 1, trackWidth: 1, motionSensitivity: 1.3, carColor: "coral", throttle: 0, steering: 0, camera: "thirdPerson", guides: true },
};

function Slider({ label, value, min, max, step = 1, unit = "", displayValue, onChange }: {
  label: string; value: number; min: number; max: number; step?: number; unit?: string; displayValue?: string; onChange: (value: number) => void;
}) {
  return (
    <label className="slider-row">
      <span className="slider-label"><span>{label}</span><output>{displayValue ?? `${value}${unit}`}</output></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function LabCanvas({ lab, settingsRef, playingRef, motionInputRef, restartKey, onDriveGameOver, onDriveLap }: {
  lab: LabId;
  settingsRef: React.MutableRefObject<Settings>;
  playingRef: React.MutableRefObject<boolean>;
  motionInputRef: React.MutableRefObject<MotionInput>;
  restartKey: number;
  onDriveGameOver: (reason: DriveGameOverReason) => void;
  onDriveLap: (status: { lap: number; twist: number }) => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let instance: p5Type | undefined;
    let cancelled = false;

    async function mount() {
      const { default: p5 } = await import("p5");
      if (cancelled || !hostRef.current) return;

      instance = new p5((sketch) => {
        let visibleSeeds = 0;
        let phase = 0;
        let lastTime = 0;
        let fractalKey = "";
        let mandelbrotGeometryKey = "";
        let visibleFractalIterations = 0;
        let fractalStartDelay = 450;
        let carPosition = 0;
        let carVelocity = 0;
        let carLateral = 0;
        let carHeading = 0;
        let driveGameOver = false;
        let fallDistance = 0;
        let fallVelocity = 0;
        let trackTwist = 1;
        let driveLapMarker = 0;
        let completedDriveLaps = 0;
        let fractalImage: p5Type.Graphics | null = null;
        let driveObstacles: Array<{ angle: number; lateralRatio: number; scale: number; shade: number }> = [];
        const randomizeDriveObstacles = () => {
          driveObstacles = [];
          const angularDistance = (a: number, b: number) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
          let attempts = 0;
          while (driveObstacles.length < 10 && attempts < 300) {
            attempts += 1;
            const angle = Math.random() * Math.PI * 2;
            if (angularDistance(angle, 0) < 0.62 || driveObstacles.some((tree) => angularDistance(angle, tree.angle) < 0.32)) continue;
            driveObstacles.push({
              angle,
              lateralRatio: Math.random() * 1.38 - 0.69,
              scale: 0.82 + Math.random() * 0.42,
              shade: Math.floor(Math.random() * 3),
            });
          }
        };
        if (lab === "mobiusDrive") randomizeDriveObstacles();

        const hostSize = () => {
          const rect = hostRef.current!.getBoundingClientRect();
          return { width: Math.max(320, rect.width), height: Math.max(440, rect.height) };
        };

        sketch.setup = () => {
          const size = hostSize();
          const canvas = lab === "orbit" || lab === "primes" || lab === "formulas" || lab === "mobiusDrive"
            ? sketch.createCanvas(size.width, size.height, sketch.WEBGL)
            : sketch.createCanvas(size.width, size.height);
          canvas.parent(hostRef.current!);
          canvas.attribute("aria-label", `Interaktywna wizualizacja: ${LABS.find((item) => item.id === lab)?.short}`);
          sketch.pixelDensity(Math.min(window.devicePixelRatio, 2));
          sketch.frameRate(60);
        };

        sketch.windowResized = () => {
          const size = hostSize();
          sketch.resizeCanvas(size.width, size.height);
          fractalKey = "";
        };

        const drawSunflower = (delta: number) => {
          const current = settingsRef.current.sunflower;
          if (playingRef.current) visibleSeeds = Math.min(current.seeds, visibleSeeds + delta * current.speed * 0.1);
          visibleSeeds = Math.min(visibleSeeds, current.seeds);
          sketch.background("#121a2a");
          sketch.translate(sketch.width / 2, sketch.height / 2);
          const maxRadius = Math.min(sketch.width, sketch.height) * 0.43;
          const spacing = maxRadius / Math.sqrt(current.seeds);

          if (current.guides) {
            sketch.noFill(); sketch.stroke(255, 255, 255, 28); sketch.strokeWeight(1);
            for (let ring = 1; ring <= 5; ring++) sketch.circle(0, 0, maxRadius * 2 * ring / 5);
            sketch.line(-maxRadius, 0, maxRadius, 0); sketch.line(0, -maxRadius, 0, maxRadius);
          }

          sketch.noStroke();
          const colors = ["#ffd23f", "#ff9548", "#ff5f68", "#fff0c7"];
          for (let n = Math.floor(visibleSeeds) - 1; n >= 0; n--) {
            const theta = sketch.radians(n * current.angle - 90);
            const radius = spacing * Math.sqrt(n);
            const pulse = 1 + Math.sin(sketch.millis() * 0.002 + n * 0.1) * 0.07;
            sketch.fill(colors[n % colors.length]);
            sketch.circle(Math.cos(theta) * radius, Math.sin(theta) * radius, current.size * pulse);
          }
        };

        const drawMandelbrot = (delta: number) => {
          const current = settingsRef.current.mandelbrot;
          const zoom = Math.pow(2, current.depth);
          const geometryKey = `${sketch.width}|${sketch.height}|${current.depth}|${current.centerX}|${current.centerY}`;
          if (geometryKey !== mandelbrotGeometryKey) {
            mandelbrotGeometryKey = geometryKey;
            visibleFractalIterations = 0;
            fractalStartDelay = 450;
            fractalKey = "";
          }
          if (playingRef.current && fractalStartDelay > 0) fractalStartDelay = Math.max(0, fractalStartDelay - delta);
          else if (playingRef.current) visibleFractalIterations = Math.min(current.iterations, visibleFractalIterations + delta * current.buildSpeed * 0.035);
          const renderedIterations = Math.floor(visibleFractalIterations);
          sketch.background("#fffaf0");
          if (renderedIterations < 2) return;
          const key = `${geometryKey}|${renderedIterations}|${current.palette}`;
          if (key !== fractalKey) {
            fractalKey = key;
            const renderWidth = Math.min(520, Math.max(260, Math.floor(sketch.width / 1.7)));
            const renderHeight = Math.min(440, Math.max(220, Math.floor(sketch.height / 1.7)));
            fractalImage = sketch.createGraphics(renderWidth, renderHeight);
            fractalImage.pixelDensity(1);
            fractalImage.loadPixels();
            const aspect = renderWidth / renderHeight;
            const spanY = 2.65 / zoom;
            const spanX = spanY * aspect;

            for (let py = 0; py < renderHeight; py++) {
              const cy = current.centerY + (py / renderHeight - 0.5) * spanY;
              for (let px = 0; px < renderWidth; px++) {
                const cx = current.centerX + (px / renderWidth - 0.5) * spanX;
                let x = 0; let y = 0; let iteration = 0;
                while (x * x + y * y <= 4 && iteration < renderedIterations) {
                  const nextX = x * x - y * y + cx;
                  y = 2 * x * y + cy;
                  x = nextX;
                  iteration++;
                }
                const index = 4 * (px + py * renderWidth);
                if (iteration === renderedIterations) {
                  fractalImage.pixels[index] = 10; fractalImage.pixels[index + 1] = 15; fractalImage.pixels[index + 2] = 29;
                } else {
                  const smooth = iteration + 1 - Math.log2(Math.max(1, Math.log2(Math.sqrt(x * x + y * y))));
                  const t = smooth / renderedIterations * 5 + current.palette;
                  fractalImage.pixels[index] = Math.floor(128 + 127 * Math.cos(6.283 * t));
                  fractalImage.pixels[index + 1] = Math.floor(128 + 127 * Math.cos(6.283 * (t + 0.34)));
                  fractalImage.pixels[index + 2] = Math.floor(128 + 127 * Math.cos(6.283 * (t + 0.67)));
                }
                fractalImage.pixels[index + 3] = 255;
              }
            }
            fractalImage.updatePixels();
          }
          if (fractalImage) sketch.image(fractalImage, 0, 0, sketch.width, sketch.height);
        };

        const drawFibonacci = (delta: number) => {
          const current = settingsRef.current.fibonacci;
          if (playingRef.current) phase = (phase + delta * current.speed * 0.00012) % 1;
          sketch.background("#101c27");
          sketch.translate(sketch.width / 2, sketch.height / 2);
          const phi = (1 + Math.sqrt(5)) / 2;
          const maxTheta = current.turns * Math.PI / 2;
          const maxRadius = Math.min(sketch.width, sketch.height) * 0.44;
          const startRadius = maxRadius / Math.pow(phi, current.turns);

          if (current.guides) {
            sketch.noFill(); sketch.stroke(92, 231, 186, 35); sketch.strokeWeight(1);
            for (let n = 0; n <= current.turns; n++) {
              const theta = n * Math.PI / 2 - maxTheta;
              const radius = startRadius * Math.pow(phi, n);
              sketch.circle(0, 0, radius * 2);
              if (n > 1) {
                sketch.noStroke(); sketch.fill(181, 255, 229, 150); sketch.textAlign(sketch.CENTER, sketch.CENTER); sketch.textSize(11);
                sketch.text(Math.round(Math.pow(phi, n) / Math.sqrt(5)), Math.cos(theta) * radius, Math.sin(theta) * radius);
                sketch.noFill(); sketch.stroke(92, 231, 186, 35);
              }
            }
          }

          const visible = 0.18 + phase * 0.82;
          sketch.noFill(); sketch.strokeWeight(current.thickness); sketch.strokeCap(sketch.ROUND);
          sketch.beginShape();
          const samples = 720;
          for (let i = 0; i <= samples * visible; i++) {
            const progress = i / samples;
            const theta = -maxTheta + maxTheta * progress;
            const radius = startRadius * Math.pow(phi, current.turns * progress);
            const glow = 130 + progress * 125;
            sketch.stroke(50 + progress * 180, glow, 170 + progress * 70, 235);
            sketch.vertex(Math.cos(theta) * radius, Math.sin(theta) * radius);
          }
          sketch.endShape();

          const endTheta = -maxTheta + maxTheta * visible;
          const endRadius = startRadius * Math.pow(phi, current.turns * visible);
          sketch.noStroke(); sketch.fill("#fff08a");
          sketch.circle(Math.cos(endTheta) * endRadius, Math.sin(endTheta) * endRadius, 18);
          sketch.fill(255, 240, 138, 55); sketch.circle(Math.cos(endTheta) * endRadius, Math.sin(endTheta) * endRadius, 42);
        };

        const drawOrbit = (delta: number) => {
          const current = settingsRef.current.orbit;
          if (playingRef.current) phase += delta * current.speed * 0.00035;
          sketch.background("#080e1c");
          sketch.orbitControl(1, 1, 0.08);
          sketch.rotateX(-0.38 + Math.sin(phase * 0.7) * 0.09);
          sketch.rotateY(phase);
          const radius = Math.min(sketch.width, sketch.height) * 0.31;

          sketch.noFill(); sketch.strokeWeight(1);
          sketch.stroke(86, 135, 255, 55 * current.opacity); sketch.circle(0, 0, radius * 2.05);
          sketch.rotateX(Math.PI / 2); sketch.stroke(255, 116, 167, 45 * current.opacity); sketch.circle(0, 0, radius * 2.05); sketch.rotateX(-Math.PI / 2);

          const golden = Math.PI * (3 - Math.sqrt(5));
          const position = (i: number) => {
            const progress = i / Math.max(1, current.points - 1);
            const vertical = 1 - 2 * progress;
            const ring = Math.sqrt(1 - vertical * vertical);
            const theta = golden * i * current.twist + phase * 0.4;
            if (current.system === "cylindrical") return [Math.cos(theta) * radius, (0.5 - progress) * radius * 1.75, Math.sin(theta) * radius] as const;
            if (current.system === "elliptic") return [Math.cos(theta) * ring * radius * 1.38, vertical * radius * 0.82, Math.sin(theta) * ring * radius * 0.62] as const;
            return [Math.cos(theta) * ring * radius, vertical * radius, Math.sin(theta) * ring * radius] as const;
          };
          if (current.connections) {
            sketch.noFill(); sketch.stroke(86, 208, 255, 42 * current.opacity); sketch.strokeWeight(1);
            sketch.beginShape();
            for (let i = 0; i < current.points; i += 3) {
              const [x, y, z] = position(i);
              sketch.vertex(x, y, z);
            }
            sketch.endShape();
          }

          sketch.strokeWeight(Math.max(2, 6 - current.points / 220));
          sketch.beginShape(sketch.POINTS);
          for (let i = 0; i < current.points; i++) {
            const mix = i / current.points;
            const [x, y, z] = position(i);
            sketch.stroke(80 + 160 * mix, 210 - 75 * mix, 255 - 40 * mix, 230 * current.opacity);
            sketch.vertex(x, y, z);
          }
          sketch.endShape();
        };

        const drawPrimes = (delta: number) => {
          const current = settingsRef.current.primes;
          if (playingRef.current) phase += delta * current.speed * 0.00028;
          sketch.background("#090d1b");
          sketch.orbitControl(1, 1, 0.08);
          sketch.rotateX(-0.22 + Math.sin(phase * 0.55) * 0.08);
          sketch.rotateY(phase);

          const count = Math.min(current.count, PRIME_NUMBERS.length);
          const lastPrime = PRIME_NUMBERS[count - 1];
          const radius = Math.min(sketch.width, sketch.height) * 0.24 * current.spread;
          const height = Math.min(sketch.height * 0.7, 560);
          const position = (number: number, progress: number) => {
            const angle = number * 0.16;
            if (current.system === "cartesian") return [(progress - 0.5) * height, Math.sin(number * 0.11) * radius * 0.82, Math.cos(number * 0.073) * radius * 0.82] as const;
            if (current.system === "elliptic") return [Math.cos(angle) * radius * 1.42, (number / lastPrime - 0.5) * height, Math.sin(angle) * radius * 0.58] as const;
            return [Math.cos(angle) * radius, (number / lastPrime - 0.5) * height, Math.sin(angle) * radius] as const;
          };

          sketch.noFill(); sketch.stroke(255, 255, 255, 24 * current.opacity); sketch.strokeWeight(1);
          sketch.beginShape();
          for (let sample = 0; sample <= 360; sample++) {
            const number = 2 + (lastPrime - 2) * sample / 360;
            const [x, y, z] = position(number, sample / 360);
            sketch.vertex(x, y, z);
          }
          sketch.endShape();

          if (current.connections) {
            sketch.noFill(); sketch.stroke(255, 104, 178, 62 * current.opacity); sketch.strokeWeight(1.2);
            sketch.beginShape();
            for (let i = 0; i < count; i++) {
              const prime = PRIME_NUMBERS[i];
              const [x, y, z] = position(prime, i / count);
              sketch.vertex(x, y, z);
            }
            sketch.endShape();
          }

          sketch.strokeWeight(Math.max(2.2, 7 - count / 210));
          sketch.beginShape(sketch.POINTS);
          for (let i = 0; i < count; i++) {
            const prime = PRIME_NUMBERS[i];
            const mix = i / count;
            const [x, y, z] = position(prime, i / count);
            sketch.stroke(255 - mix * 45, 88 + mix * 110, 176 + mix * 70, 240 * current.opacity);
            sketch.vertex(x, y, z);
          }
          sketch.endShape();
        };

        const drawFormulas = (delta: number) => {
          const current = settingsRef.current.formulas;
          if (playingRef.current) phase += delta * current.speed * 0.0003;
          sketch.background("#0b1020");
          const scale = Math.min(sketch.width, sketch.height) * 0.32;

          if (current.view === "3d") {
            sketch.orbitControl(1, 1, 0.08);
            sketch.rotateX(-0.18);
            sketch.rotateY(phase * 0.55);
          }

          sketch.strokeWeight(1);
          sketch.stroke(255, 105, 156, 55); sketch.line(-scale * 1.35, 0, 0, scale * 1.35, 0, 0);
          sketch.stroke(92, 222, 190, 55); sketch.line(0, -scale * 1.15, 0, 0, scale * 1.15, 0);
          if (current.view === "3d") { sketch.stroke(91, 135, 255, 55); sketch.line(0, 0, -scale, 0, 0, scale); }

          const alpha = 255 * current.opacity;
          const shape = current.shape;
          if (shape === "mobius") {
            sketch.fill(151, 86, 230, alpha * 0.58);
            sketch.stroke(223, 194, 255, alpha * 0.72);
            sketch.strokeWeight(0.8);
            sketch.beginShape(sketch.TRIANGLE_STRIP);
            const steps = 180;
            for (let i = 0; i <= steps; i++) {
              const t = i / steps * Math.PI * 2;
              for (const s of [-0.48, 0.48]) {
                const x = (1.45 + s * Math.cos(t / 2)) * Math.cos(t);
                const y = (1.45 + s * Math.cos(t / 2)) * Math.sin(t);
                const z = s * Math.sin(t / 2);
                sketch.vertex(x * scale * 0.55, y * scale * 0.55, current.view === "xy" ? 0 : z * scale * 0.8);
              }
            }
            sketch.endShape();
            return;
          }

          sketch.noFill();
          sketch.strokeWeight(current.thickness);
          sketch.strokeCap(sketch.ROUND);
          sketch.beginShape();
          const samples = shape === "butterfly" ? 1100 : 620;
          for (let i = 0; i <= samples; i++) {
            const progress = i / samples;
            const pulse = 0.78 + 0.22 * Math.sin(progress * Math.PI + phase * 4);
            sketch.stroke(176 + 70 * progress, 77 + 125 * progress, 245, alpha * pulse);
            let x = 0; let y = 0; let z = 0;
            if (shape === "heart") {
              const t = progress * Math.PI * 2;
              x = Math.pow(Math.sin(t), 3) * 0.94;
              y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 17;
            } else if (shape === "butterfly") {
              const t = progress * Math.PI * 12;
              const b = Math.exp(Math.cos(t)) - 2 * Math.cos(4 * t) + Math.pow(Math.sin(t / 12), 5);
              x = Math.sin(t) * b / 4.1;
              y = -Math.cos(t) * b / 4.1;
            } else if (shape === "rose") {
              const t = progress * Math.PI * 2;
              const r = Math.cos(5 * t);
              x = r * Math.cos(t);
              y = -r * Math.sin(t);
            } else if (shape === "trefoil") {
              const t = progress * Math.PI * 2;
              x = (Math.sin(t) + 2 * Math.sin(2 * t)) / 3;
              y = -(Math.cos(t) - 2 * Math.cos(2 * t)) / 3;
              z = -Math.sin(3 * t) / 3;
            } else {
              const t = progress * Math.PI * 2;
              const ring = 1.55 + 0.55 * Math.cos(5 * t);
              x = ring * Math.cos(2 * t) / 2.1;
              y = -ring * Math.sin(2 * t) / 2.1;
              z = 0.55 * Math.sin(5 * t) / 2.1;
            }
            sketch.vertex(x * scale, y * scale, current.view === "xy" ? 0 : z * scale);
          }
          sketch.endShape(sketch.CLOSE);

        };

        const drawMobiusDrive = (delta: number) => {
          const current = settingsRef.current.mobiusDrive;
          sketch.background("#09101c");
          const radius = Math.min(sketch.width, sketch.height) * 0.26;
          const halfWidth = radius * 0.34 * current.trackWidth;
          const steps = 220;

          const motion = motionInputRef.current;
          const keyboardThrottle = motion.mobile ? 0 : (sketch.keyIsDown(sketch.UP_ARROW) ? 1 : 0) + (sketch.keyIsDown(sketch.DOWN_ARROW) ? -1 : 0);
          const keyboardSteering = motion.mobile ? 0 : (sketch.keyIsDown(sketch.RIGHT_ARROW) ? 1 : 0) + (sketch.keyIsDown(sketch.LEFT_ARROW) ? -1 : 0);
          const throttle = motion.mobile
            ? (motion.enabled ? Math.max(0, motion.throttle) : 0)
            : Math.max(-1, Math.min(1, keyboardThrottle + current.throttle));
          const brake = motion.mobile && motion.enabled ? Math.max(0, -motion.throttle) : 0;
          const steering = motion.mobile
            ? (motion.enabled ? motion.steering : 0)
            : Math.max(-1, Math.min(1, keyboardSteering + current.steering));

          if (!driveGameOver) {
            if (throttle !== 0) carVelocity += throttle * delta * 0.00042 * current.maxSpeed;
            carVelocity *= Math.pow(brake > 0 ? 1 - brake * 0.075 : throttle === 0 ? 0.982 : 0.993, delta / 16.67);
            if (brake > 0.9 && Math.abs(carVelocity) < 0.0015) carVelocity = 0;
            const speedLimit = 0.31 * current.maxSpeed;
            carVelocity = Math.max(-speedLimit * 0.55, Math.min(speedLimit, carVelocity));
            const steerStrength = 0.00075 + Math.abs(carVelocity) / Math.max(speedLimit, 0.01) * 0.00145;
            carHeading += steering * delta * steerStrength * (carVelocity < 0 ? -1 : 1);
            carHeading = Math.max(-1.05, Math.min(1.05, carHeading));
            const longitudinalStep = carVelocity * Math.cos(carHeading) / radius * delta;
            carPosition += longitudinalStep;
            carLateral += carVelocity * Math.sin(carHeading) * delta;
            // Zachowaj kierunek auta w globalnym układzie: zakręt toru nie skręca
            // automatycznie samochodem. Gracz musi sam skontrować zmianę stycznej.
            carHeading += Math.cos(trackTwist * carPosition / 2) * longitudinalStep;

            const nextLapMarker = Math.trunc(carPosition / (Math.PI * 2));
            if (nextLapMarker !== driveLapMarker) {
              completedDriveLaps += Math.abs(nextLapMarker - driveLapMarker);
              driveLapMarker = nextLapMarker;
              const twists = [-3, -1, 1, 3].filter((twist) => twist !== trackTwist);
              trackTwist = twists[Math.floor(Math.random() * twists.length)];
              randomizeDriveObstacles();
              onDriveLap({ lap: completedDriveLaps, twist: trackTwist });
            }

            if (Math.abs(carLateral) > halfWidth - 3) {
              driveGameOver = true;
              fallVelocity = Math.max(0.03, Math.abs(carVelocity) * 0.18);
              onDriveGameOver("edge");
            }
          } else {
            fallVelocity += delta * 0.0007;
            fallDistance += fallVelocity * delta;
          }

          const u = carPosition;
          const cosU = Math.cos(u); const sinU = Math.sin(u);
          const cosHalf = Math.cos(trackTwist * u / 2); const sinHalf = Math.sin(trackTwist * u / 2);
          const carX = (radius + carLateral * cosHalf) * cosU;
          const carY = (radius + carLateral * cosHalf) * sinU;
          const carZ = carLateral * sinHalf;
          const tangent = { x: -sinU, y: cosU, z: 0 };
          const across = { x: cosHalf * cosU, y: cosHalf * sinU, z: sinHalf };
          const normal = { x: sinHalf * cosU, y: sinHalf * sinU, z: -cosHalf };
          const forward = {
            x: tangent.x * Math.cos(carHeading) + across.x * Math.sin(carHeading),
            y: tangent.y * Math.cos(carHeading) + across.y * Math.sin(carHeading),
            z: tangent.z * Math.cos(carHeading) + across.z * Math.sin(carHeading),
          };

          if (!driveGameOver) {
            const hitTree = driveObstacles.some((tree) => {
              const treeLateral = tree.lateralRatio * halfWidth;
              const treeCos = Math.cos(tree.angle); const treeSin = Math.sin(tree.angle);
              const treeCosHalf = Math.cos(trackTwist * tree.angle / 2); const treeSinHalf = Math.sin(trackTwist * tree.angle / 2);
              const treeX = (radius + treeLateral * treeCosHalf) * treeCos;
              const treeY = (radius + treeLateral * treeCosHalf) * treeSin;
              const treeZ = treeLateral * treeSinHalf;
              const distance = Math.hypot(carX - treeX, carY - treeY, carZ - treeZ);
              return distance < 17 + tree.scale * 7;
            });
            if (hitTree) {
              driveGameOver = true;
              carVelocity *= 0.18;
              fallVelocity = 0.018;
              onDriveGameOver("tree");
            }
          }

          if (current.camera === "thirdPerson") {
            const lift = 65 + fallDistance * 0.15;
            sketch.camera(
              carX - forward.x * 115 + normal.x * lift,
              carY - forward.y * 115 + normal.y * lift,
              carZ - forward.z * 115 + normal.z * lift,
              carX + forward.x * 60,
              carY + forward.y * 60,
              carZ + forward.z * 60,
              -normal.x, -normal.y, -normal.z,
            );
          } else {
            sketch.orbitControl(1, 1, 0.08);
            sketch.rotateX(-0.78);
            sketch.rotateZ(-0.18);
          }

          sketch.ambientLight(105);
          sketch.directionalLight(255, 244, 225, -0.35, 0.45, -1);

          sketch.fill(65, 78, 111);
          sketch.stroke(133, 152, 196, 90);
          sketch.strokeWeight(0.7);
          sketch.beginShape(sketch.TRIANGLE_STRIP);
          for (let i = 0; i <= steps; i++) {
            const t = i / steps * Math.PI * 2;
            for (const s of [-halfWidth, halfWidth]) {
              const x = (radius + s * Math.cos(trackTwist * t / 2)) * Math.cos(t);
              const y = (radius + s * Math.cos(trackTwist * t / 2)) * Math.sin(t);
              const z = s * Math.sin(trackTwist * t / 2);
              sketch.vertex(x, y, z);
            }
          }
          sketch.endShape();

          sketch.stroke(255, 214, 92, 235); sketch.strokeWeight(5);
          sketch.line(radius - halfWidth, 0, 1, radius + halfWidth, 0, 1);

          if (current.guides) {
            sketch.noFill(); sketch.stroke(255, 214, 92, 150); sketch.strokeWeight(2);
            sketch.beginShape();
            for (let i = 0; i <= steps; i++) {
              const t = i / steps * Math.PI * 2;
              sketch.vertex(radius * Math.cos(t), radius * Math.sin(t), 0);
            }
            sketch.endShape();
            for (const side of [-1, 1]) {
              sketch.stroke(121, 224, 255, 82); sketch.strokeWeight(1);
              sketch.beginShape();
              for (let i = 0; i <= steps; i++) {
                const t = i / steps * Math.PI * 2;
                const s = halfWidth * side;
                sketch.vertex((radius + s * Math.cos(trackTwist * t / 2)) * Math.cos(t), (radius + s * Math.cos(trackTwist * t / 2)) * Math.sin(t), s * Math.sin(trackTwist * t / 2));
              }
              sketch.endShape();
            }
          }

          const treeColors = [[48, 132, 90], [60, 151, 104], [76, 166, 105]] as const;
          for (const tree of driveObstacles) {
            const t = tree.angle;
            const s = tree.lateralRatio * halfWidth;
            const treeCosHalf = Math.cos(trackTwist * t / 2);
            const x = (radius + s * treeCosHalf) * Math.cos(t);
            const y = (radius + s * treeCosHalf) * Math.sin(t);
            const z = s * Math.sin(trackTwist * t / 2);
            const crownColor = treeColors[tree.shade];

            sketch.push();
            sketch.translate(x, y, z);
            sketch.rotateZ(t + Math.PI / 2);
            sketch.rotateX(Math.PI - trackTwist * t / 2);
            sketch.noStroke();
            sketch.fill(126, 82, 52);
            sketch.push(); sketch.translate(0, 0, 7 * tree.scale); sketch.box(5 * tree.scale, 5 * tree.scale, 14 * tree.scale); sketch.pop();
            sketch.fill(...crownColor);
            sketch.push(); sketch.translate(0, 0, 21 * tree.scale); sketch.rotateX(-Math.PI / 2); sketch.cone(13 * tree.scale, 25 * tree.scale, 6, 1, true); sketch.pop();
            sketch.fill(crownColor[0] + 10, crownColor[1] + 12, crownColor[2] + 8);
            sketch.push(); sketch.translate(0, 0, 31 * tree.scale); sketch.rotateX(-Math.PI / 2); sketch.cone(9 * tree.scale, 19 * tree.scale, 6, 1, true); sketch.pop();
            sketch.pop();
          }

          sketch.push();
          sketch.translate(carX, carY, carZ);
          sketch.rotateZ(u + Math.PI / 2);
          sketch.rotateX(Math.PI - trackTwist * u / 2);
          sketch.rotateZ(carHeading);
          sketch.translate(0, 0, 14 + fallDistance);
          if (driveGameOver) { sketch.rotateX(fallDistance * 0.018); sketch.rotateY(fallDistance * 0.026); }

          const carColors = { coral: [246, 91, 91], blue: [74, 145, 255], lime: [125, 219, 112] } as const;
          const color = carColors[current.carColor];
          sketch.noStroke(); sketch.fill(...color); sketch.box(46, 23, 10, 4, 2);
          sketch.push(); sketch.translate(-4, 0, 9); sketch.fill(color[0] * 0.82, color[1] * 0.82, color[2] * 0.82); sketch.box(21, 19, 9, 3, 2); sketch.pop();
          sketch.push(); sketch.translate(15, 0, 3); sketch.fill(255, 243, 176); sketch.box(4, 20, 4); sketch.pop();

          for (const x of [-14, 14]) for (const y of [-13, 13]) {
            sketch.push(); sketch.translate(x, y, -4); sketch.fill(21, 25, 35); sketch.cylinder(5.5, 4, 12, 1); sketch.pop();
          }
          sketch.pop();
        };

        sketch.draw = () => {
          const now = sketch.millis();
          const delta = Math.min(40, now - lastTime);
          lastTime = now;
          if (lab === "sunflower") drawSunflower(delta);
          if (lab === "mandelbrot") drawMandelbrot(delta);
          if (lab === "fibonacci") drawFibonacci(delta);
          if (lab === "orbit") drawOrbit(delta);
          if (lab === "primes") drawPrimes(delta);
          if (lab === "formulas") drawFormulas(delta);
          if (lab === "mobiusDrive") drawMobiusDrive(delta);
        };
      });
    }

    mount();
    return () => { cancelled = true; instance?.remove(); };
  }, [lab, restartKey, playingRef, settingsRef, motionInputRef, onDriveGameOver, onDriveLap]);

  return <div className={`canvas-wrap canvas-${lab}`} ref={hostRef} />;
}

export function MathGarden() {
  const [activeLab, setActiveLab] = useState<LabId>("sunflower");
  const [settings, setSettings] = useState<Settings>(INITIAL_SETTINGS);
  const [isPlaying, setIsPlaying] = useState(true);
  const [restartKey, setRestartKey] = useState(0);
  const [driveGameOver, setDriveGameOver] = useState<DriveGameOverReason | null>(null);
  const [driveLapStatus, setDriveLapStatus] = useState({ lap: 0, twist: 1 });
  const [mobileDevice, setMobileDevice] = useState(false);
  const [motionEnabled, setMotionEnabled] = useState(false);
  const [motionStatus, setMotionStatus] = useState<MotionControlStatus>("desktop");
  const settingsRef = useRef(settings);
  const playingRef = useRef(isPlaying);
  const motionInputRef = useRef<MotionInput>({ mobile: false, enabled: false, throttle: 0, steering: 0 });
  const motionBaselineRef = useRef<{ pitch: number; roll: number } | null>(null);
  const latestMotionTiltRef = useRef<{ pitch: number; roll: number } | null>(null);
  const receivedMotionSampleRef = useRef(false);
  settingsRef.current = settings;
  playingRef.current = isPlaying;
  const lab = LABS.find((item) => item.id === activeLab)!;

  useEffect(() => {
    const mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
      || (/Macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1)
      || (navigator.maxTouchPoints > 1 && window.matchMedia("(max-width: 900px)").matches);
    const supported = "DeviceOrientationEvent" in window;
    motionInputRef.current = { mobile, enabled: false, throttle: 0, steering: 0 };
    const frame = window.requestAnimationFrame(() => {
      setMobileDevice(mobile);
      if (!mobile) setMotionStatus("desktop");
      else if (!window.isSecureContext) setMotionStatus("insecure");
      else setMotionStatus(supported ? "idle" : "unsupported");
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!mobileDevice || !motionEnabled || activeLab !== "mobiusDrive") {
      motionInputRef.current = { mobile: mobileDevice, enabled: false, throttle: 0, steering: 0 };
      return;
    }

    const clampTilt = (value: number) => {
      const deadZone = 3;
      const fullTilt = 22;
      const magnitude = Math.abs(value);
      if (magnitude <= deadZone) return 0;
      return Math.sign(value) * Math.min(1, (magnitude - deadZone) / (fullTilt - deadZone));
    };
    const shortestAngle = (value: number) => ((value + 180) % 360 + 360) % 360 - 180;
    const resetMotionBaseline = () => {
      motionBaselineRef.current = null;
      latestMotionTiltRef.current = null;
      receivedMotionSampleRef.current = false;
      motionInputRef.current = { mobile: true, enabled: true, throttle: 0, steering: 0 };
      setMotionStatus("listening");
    };
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.beta === null || event.gamma === null) return;
      const legacyAngle = (window as Window & { orientation?: number }).orientation ?? 0;
      const screenAngle = window.screen.orientation?.angle ?? legacyAngle;
      const angle = screenAngle * Math.PI / 180;
      const pitch = event.beta * Math.cos(angle) - event.gamma * Math.sin(angle);
      const roll = event.gamma * Math.cos(angle) + event.beta * Math.sin(angle);
      const sample = { pitch, roll };
      latestMotionTiltRef.current = sample;

      if (!motionBaselineRef.current) {
        motionBaselineRef.current = sample;
        motionInputRef.current = { mobile: true, enabled: true, throttle: 0, steering: 0 };
        if (!receivedMotionSampleRef.current) {
          receivedMotionSampleRef.current = true;
          setMotionStatus("active");
        }
        return;
      }

      const pitchDelta = shortestAngle(pitch - motionBaselineRef.current.pitch);
      const rollDelta = shortestAngle(roll - motionBaselineRef.current.roll);
      const sensitivity = settingsRef.current.mobiusDrive.motionSensitivity;
      const targetThrottle = Math.max(-1, Math.min(1, clampTilt(-pitchDelta) * sensitivity));
      const targetSteering = Math.max(-1, Math.min(1, clampTilt(rollDelta) * sensitivity));
      const previous = motionInputRef.current;
      motionInputRef.current = {
        mobile: true,
        enabled: true,
        throttle: previous.throttle * 0.7 + targetThrottle * 0.3,
        steering: previous.steering * 0.7 + targetSteering * 0.3,
      };
    };

    resetMotionBaseline();
    window.addEventListener("deviceorientation", handleOrientation, true);
    window.addEventListener("orientationchange", resetMotionBaseline);
    return () => {
      window.removeEventListener("deviceorientation", handleOrientation, true);
      window.removeEventListener("orientationchange", resetMotionBaseline);
      motionInputRef.current = { mobile: mobileDevice, enabled: false, throttle: 0, steering: 0 };
    };
  }, [activeLab, mobileDevice, motionEnabled]);

  useEffect(() => {
    if (activeLab !== "mobiusDrive") return;
    const stopPageScroll = (event: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) event.preventDefault();
    };
    window.addEventListener("keydown", stopPageScroll, { passive: false });
    return () => window.removeEventListener("keydown", stopPageScroll);
  }, [activeLab]);

  const enableMotionControls = async () => {
    if (!mobileDevice || !("DeviceOrientationEvent" in window)) {
      setMotionStatus("unsupported");
      return;
    }
    if (!window.isSecureContext) {
      setMotionStatus("insecure");
      return;
    }

    setMotionStatus("requesting");
    try {
      const orientationEvent = window.DeviceOrientationEvent as typeof DeviceOrientationEvent & {
        requestPermission?: () => Promise<"granted" | "denied">;
      };
      if (typeof orientationEvent.requestPermission === "function") {
        const permission = await orientationEvent.requestPermission();
        if (permission !== "granted") {
          setMotionStatus("denied");
          return;
        }
      }
      motionBaselineRef.current = null;
      latestMotionTiltRef.current = null;
      receivedMotionSampleRef.current = false;
      setMotionEnabled(true);
      setMotionStatus("listening");
    } catch {
      setMotionStatus("denied");
    }
  };

  const calibrateMotionControls = () => {
    motionBaselineRef.current = latestMotionTiltRef.current;
    motionInputRef.current = { mobile: true, enabled: true, throttle: 0, steering: 0 };
  };

  const update = <L extends LabId, K extends keyof Settings[L]>(labId: L, key: K, value: Settings[L][K]) => {
    setSettings((current) => ({ ...current, [labId]: { ...current[labId], [key]: value } }));
  };

  const resetActive = () => {
    setSettings((current) => ({ ...current, [activeLab]: { ...INITIAL_SETTINGS[activeLab] } }));
    if (activeLab === "mobiusDrive") { setDriveGameOver(null); setDriveLapStatus({ lap: 0, twist: 1 }); }
    setRestartKey((key) => key + 1);
    setIsPlaying(true);
  };

  const switchLab = (id: LabId) => {
    setActiveLab(id);
    if (id === "mobiusDrive") { setDriveGameOver(null); setDriveLapStatus({ lap: 0, twist: 1 }); }
    setIsPlaying(true);
    setRestartKey((key) => key + 1);
  };

  const restartDrive = () => {
    setDriveGameOver(null);
    setDriveLapStatus({ lap: 0, twist: 1 });
    setSettings((current) => ({ ...current, mobiusDrive: { ...current.mobiusDrive, throttle: 0, steering: 0 } }));
    setRestartKey((key) => key + 1);
  };

  const selectFormula = (shape: FormulaId) => {
    const formula = FORMULAS.find((item) => item.id === shape)!;
    setSettings((current) => ({ ...current, formulas: { ...current.formulas, shape, view: formula.dimension === "2D" ? "xy" : "3d" } }));
    setRestartKey((key) => key + 1);
    setIsPlaying(true);
  };

  const setFormulaView = (view: ViewMode) => {
    update("formulas", "view", view);
    setRestartKey((key) => key + 1);
  };

  const renderControls = () => {
    if (activeLab === "sunflower") {
      const value = settings.sunflower;
      return <>
        <Slider label="Liczba nasion" value={value.seeds} min={100} max={1000} step={20} onChange={(next) => update("sunflower", "seeds", next)} />
        <Slider label="Kąt obrotu" value={value.angle} min={130} max={145} step={0.1} unit="°" onChange={(next) => update("sunflower", "angle", next)} />
        <Slider label="Wielkość nasion" value={value.size} min={3} max={13} onChange={(next) => update("sunflower", "size", next)} />
        <Slider label="Tempo wzrostu" value={value.speed} min={0.2} max={2.5} step={0.1} unit="×" onChange={(next) => update("sunflower", "speed", next)} />
        <Toggle checked={value.guides} label="Pokaż linie pomocnicze" onChange={(next) => update("sunflower", "guides", next)} />
      </>;
    }
    if (activeLab === "mandelbrot") {
      const value = settings.mandelbrot;
      return <>
        <Slider label="Poziom wejścia" value={value.depth} min={0} max={13} step={0.05} displayValue={`${Math.pow(2, value.depth).toFixed(value.depth < 4 ? 1 : 0)}×`} onChange={(next) => update("mandelbrot", "depth", next)} />
        <Slider label="Przesunięcie X" value={value.centerX} min={-1.4} max={0.4} step={0.01} onChange={(next) => update("mandelbrot", "centerX", next)} />
        <Slider label="Przesunięcie Y" value={value.centerY} min={-0.8} max={0.8} step={0.01} onChange={(next) => update("mandelbrot", "centerY", next)} />
        <Slider label="Liczba warstw" value={value.iterations} min={10} max={220} step={5} onChange={(next) => update("mandelbrot", "iterations", next)} />
        <Slider label="Tempo budowania" value={value.buildSpeed} min={0.1} max={3} step={0.1} unit="×" onChange={(next) => update("mandelbrot", "buildSpeed", next)} />
        <Slider label="Przesuń kolory" value={value.palette} min={0} max={1} step={0.01} onChange={(next) => update("mandelbrot", "palette", next)} />
        <p className="control-hint">Zmiana wejścia albo punktu X/Y czyści płótno i rozpoczyna budowę od nowa.</p>
      </>;
    }
    if (activeLab === "fibonacci") {
      const value = settings.fibonacci;
      return <>
        <Slider label="Ćwiartki spirali" value={value.turns} min={6} max={14} onChange={(next) => update("fibonacci", "turns", next)} />
        <Slider label="Tempo rysowania" value={value.speed} min={0.2} max={2.5} step={0.1} unit="×" onChange={(next) => update("fibonacci", "speed", next)} />
        <Slider label="Grubość linii" value={value.thickness} min={2} max={12} onChange={(next) => update("fibonacci", "thickness", next)} />
        <Toggle checked={value.guides} label="Pokaż kolejne liczby" onChange={(next) => update("fibonacci", "guides", next)} />
        <div className="sequence-strip" aria-label="Początek ciągu Fibonacciego">1 <span>1</span> 2 <span>3</span> 5 <span>8</span> 13 <span>21</span></div>
      </>;
    }
    if (activeLab === "formulas") {
      const value = settings.formulas;
      return <>
        <FormulaPicker value={value.shape} onChange={selectFormula} />
        <fieldset className="view-picker">
          <legend>Widok przestrzeni</legend>
          <div>
            <button type="button" className={value.view === "xy" ? "active" : ""} onClick={() => setFormulaView("xy")} aria-pressed={value.view === "xy"}>Płaszczyzna X, Y</button>
            <button type="button" className={value.view === "3d" ? "active" : ""} onClick={() => setFormulaView("3d")} aria-pressed={value.view === "3d"}>Przestrzeń 3D</button>
          </div>
        </fieldset>
        <Slider label="Tempo ruchu" value={value.speed} min={0.1} max={2.5} step={0.1} unit="×" onChange={(next) => update("formulas", "speed", next)} />
        <Slider label="Grubość wzoru" value={value.thickness} min={1} max={12} onChange={(next) => update("formulas", "thickness", next)} />
        <Slider label="Widoczność" value={value.opacity} min={0.2} max={1} step={0.05} displayValue={`${Math.round(value.opacity * 100)}%`} onChange={(next) => update("formulas", "opacity", next)} />
      </>;
    }
    if (activeLab === "mobiusDrive") {
      const value = settings.mobiusDrive;
      return <>
        {mobileDevice
          ? <MotionDriveCard
              status={motionStatus}
              sensitivity={value.motionSensitivity}
              onEnable={enableMotionControls}
              onCalibrate={calibrateMotionControls}
              onSensitivityChange={(next) => update("mobiusDrive", "motionSensitivity", next)}
            />
          : <>
              <div className="keyboard-card"><span aria-hidden="true">⌨</span><p><strong>Sterowanie klawiaturą</strong><br />↑ gaz · ↓ wsteczny<br />← skręt w lewo · → skręt w prawo</p></div>
              <DrivePad onThrottle={(direction) => update("mobiusDrive", "throttle", direction)} onSteering={(direction) => update("mobiusDrive", "steering", direction)} />
            </>}
        <fieldset className="view-picker drive-camera-picker">
          <legend>Tryb kamery</legend>
          <div>
            <button type="button" className={value.camera === "thirdPerson" ? "active" : ""} onClick={() => { update("mobiusDrive", "camera", "thirdPerson"); restartDrive(); }} aria-pressed={value.camera === "thirdPerson"}>Trzecia osoba</button>
            <button type="button" className={value.camera === "orbit" ? "active" : ""} onClick={() => { update("mobiusDrive", "camera", "orbit"); restartDrive(); }} aria-pressed={value.camera === "orbit"}>Swobodna</button>
          </div>
        </fieldset>
        <p className="control-hint">Żółta linia wyznacza start. Po każdym pełnym okrążeniu wstęga losuje nowy kierunek i liczbę półskrętów.</p>
        <Slider label="Prędkość maksymalna" value={value.maxSpeed} min={0.35} max={2} step={0.05} unit="×" onChange={(next) => update("mobiusDrive", "maxSpeed", next)} />
        <Slider label="Szerokość toru" value={value.trackWidth} min={0.65} max={1.35} step={0.05} unit="×" onChange={(next) => update("mobiusDrive", "trackWidth", next)} />
        <div className="car-colors"><span>Kolor samochodu</span><div>
          {(["coral", "blue", "lime"] as const).map((color) => <button key={color} type="button" className={`${color} ${value.carColor === color ? "active" : ""}`} onClick={() => update("mobiusDrive", "carColor", color)} aria-label={`Kolor samochodu: ${color}`} aria-pressed={value.carColor === color} />)}
        </div></div>
        <Toggle checked={value.guides} label="Pokaż środek i krawędzie toru" onChange={(next) => update("mobiusDrive", "guides", next)} />
      </>;
    }
    if (activeLab === "orbit") {
      const value = settings.orbit;
      return <>
        <Slider label="Liczba punktów" value={value.points} min={120} max={1200} step={40} onChange={(next) => update("orbit", "points", next)} />
        <Slider label="Skręt przestrzeni" value={value.twist} min={0.3} max={2.5} step={0.05} unit="×" onChange={(next) => update("orbit", "twist", next)} />
        <Slider label="Prędkość obrotu" value={value.speed} min={0.1} max={2.8} step={0.1} unit="×" onChange={(next) => update("orbit", "speed", next)} />
        <Slider label="Widoczność" value={value.opacity} min={0.15} max={1} step={0.05} displayValue={`${Math.round(value.opacity * 100)}%`} onChange={(next) => update("orbit", "opacity", next)} />
        <ProjectionPicker value={value.system} onChange={(next) => update("orbit", "system", next)} />
        <Toggle checked={value.connections} label="Połącz punkty wstęgą" onChange={(next) => update("orbit", "connections", next)} />
      </>;
    }
    const value = settings.primes;
    return <>
      <Slider label="Ile liczb pokazać" value={value.count} min={40} max={1000} step={20} onChange={(next) => update("primes", "count", next)} />
      <Slider label="Szerokość galaktyki" value={value.spread} min={0.5} max={1.55} step={0.05} unit="×" onChange={(next) => update("primes", "spread", next)} />
      <Slider label="Prędkość obrotu" value={value.speed} min={0.1} max={2.8} step={0.1} unit="×" onChange={(next) => update("primes", "speed", next)} />
      <Slider label="Widoczność" value={value.opacity} min={0.15} max={1} step={0.05} displayValue={`${Math.round(value.opacity * 100)}%`} onChange={(next) => update("primes", "opacity", next)} />
      <ProjectionPicker value={value.system} onChange={(next) => update("primes", "system", next)} />
      <Toggle checked={value.connections} label="Połącz kolejne pierwsze" onChange={(next) => update("primes", "connections", next)} />
      <div className="prime-readout"><small>NAJWIĘKSZA WIDOCZNA</small><strong>{PRIME_NUMBERS[value.count - 1]}</strong></div>
    </>;
  };

  return (
    <main className="app-shell" style={{ "--accent": lab.color } as React.CSSProperties}>
      <header className="topbar">
        <a className="brand" href="#laboratorium"><span className="brand-mark" aria-hidden="true">✦</span><span>Matematyczny ogród</span></a>
        <div className="lesson-pill"><span /> 7 eksperymentów</div>
      </header>

      <section className="lab-page" id="laboratorium">
        <div className="lab-intro">
          <div>
            <p className="eyebrow">{lab.eyebrow}</p>
            <h1>{lab.title} <em>{lab.italic}</em></h1>
          </div>
          <p>{lab.description}</p>
        </div>

        <nav className="lab-tabs" role="tablist" aria-label="Wybierz eksperyment matematyczny">
          {LABS.map((item) => (
            <button key={item.id} type="button" role="tab" aria-selected={activeLab === item.id} className={activeLab === item.id ? "active" : ""} onClick={() => switchLab(item.id)}>
              <span>{item.number}</span>{item.short}
            </button>
          ))}
        </nav>

        <div className={`experiment-card ${activeLab === "formulas" ? "formula-lab" : ""}`} role="tabpanel" aria-label={lab.short}>
          <div className="stage">
            <LabCanvas lab={activeLab} settingsRef={settingsRef} playingRef={playingRef} motionInputRef={motionInputRef} restartKey={restartKey} onDriveGameOver={setDriveGameOver} onDriveLap={setDriveLapStatus} />
            <div className="live-badge"><span /> P5.JS · NA ŻYWO</div>
            {activeLab === "mobiusDrive" && <div className="lap-status"><span>OKRĄŻENIA <strong>{driveLapStatus.lap}</strong></span><span>SKRĘT <strong>{driveLapStatus.twist > 0 ? "↻" : "↺"} {Math.abs(driveLapStatus.twist)}×</strong></span></div>}
            <div className="stage-label"><small>EKSPERYMENT {lab.number}</small><strong>{lab.short}</strong></div>
            {(activeLab === "orbit" || activeLab === "primes" || activeLab === "formulas" || activeLab === "mobiusDrive") && (
              <div className="camera-tools">
                <span>{activeLab === "mobiusDrive" && settings.mobiusDrive.camera === "thirdPerson" ? "Kamera podąża za samochodem" : activeLab === "formulas" && settings.formulas.view === "xy" ? "Widok prostopadły do płaszczyzny X, Y" : "Przeciągnij, aby obrócić · kółko przybliża"}</span>
                <button type="button" onClick={activeLab === "mobiusDrive" ? restartDrive : () => setRestartKey((key) => key + 1)}>{activeLab === "mobiusDrive" ? "↺ Start" : "↺ Ustaw widok"}</button>
              </div>
            )}
            {activeLab === "mobiusDrive" && driveGameOver && <div className="game-over" role="alert">
              <small>{driveGameOver === "tree" ? "ZDERZENIE Z PRZESZKODĄ" : "WYPADŁEŚ Z TORU"}</small>
              <strong>Game Over</strong>
              <p>{driveGameOver === "tree" ? "Drzewka są małe, ale na wstędze nie ma pobocza." : "Wstęga ma jedną stronę, ale dwie krawędzie."}</p>
              <button type="button" onClick={restartDrive}>↺ Nowa trasa</button>
            </div>}
          </div>

          <aside className="controls" aria-label={`Sterowanie: ${lab.short}`}>
            <div className="controls-heading">
              <div><p>LABORATORIUM</p><h2>Twoje pokrętła</h2></div>
              <button className="icon-button" type="button" onClick={resetActive} aria-label="Przywróć ustawienia początkowe" title="Od początku">↻</button>
            </div>
            <div className="controls-body">{renderControls()}</div>
            {activeLab !== "mobiusDrive" && <button className="play-button" type="button" onClick={() => setIsPlaying((value) => !value)}>
              <span aria-hidden="true">{isPlaying ? "Ⅱ" : "▶"}</span>
              {activeLab === "mandelbrot" ? (isPlaying ? "Zatrzymaj budowę" : "Buduj dalej") : (isPlaying ? "Zatrzymaj animację" : "Uruchom animację")}
            </button>}
          </aside>
        </div>

        <LearningCards lab={activeLab} settings={settings} />
      </section>

      <footer><p>Zrobione z matematyką + p5.js</p><p>Najlepszy wynik nie istnieje — eksperymentuj!</p></footer>
    </main>
  );
}

function Toggle({ checked, label, onChange }: { checked: boolean; label: string; onChange: (value: boolean) => void }) {
  return <label className="toggle-row"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><span className="toggle-switch" /><span>{label}</span></label>;
}

function ProjectionPicker({ value, onChange }: { value: CoordinateSystem; onChange: (value: CoordinateSystem) => void }) {
  const options: Array<[CoordinateSystem, string]> = [["cartesian", "Kartez."], ["cylindrical", "Cylinder"], ["elliptic", "Elipsa"]];
  return (
    <fieldset className="projection-picker">
      <legend>Układ współrzędnych</legend>
      <div>
        {options.map(([id, label]) => <button key={id} type="button" className={value === id ? "active" : ""} aria-pressed={value === id} onClick={() => onChange(id)}>{label}</button>)}
      </div>
    </fieldset>
  );
}

function FormulaPicker({ value, onChange }: { value: FormulaId; onChange: (value: FormulaId) => void }) {
  return (
    <fieldset className="formula-picker">
      <legend>Wybierz wzór</legend>
      <div>
        {FORMULAS.map((formula) => (
          <label key={formula.id} className={value === formula.id ? "active" : ""}>
            <input type="radio" name="formula" checked={value === formula.id} onChange={() => onChange(formula.id)} />
            <span className="formula-check" aria-hidden="true">✓</span>
            <span className="formula-copy"><strong>{formula.name}<small>{formula.dimension}</small></strong><code>{formula.equation}</code><em>{formula.description}</em></span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function MotionDriveCard({ status, sensitivity, onEnable, onCalibrate, onSensitivityChange }: {
  status: MotionControlStatus;
  sensitivity: number;
  onEnable: () => void;
  onCalibrate: () => void;
  onSensitivityChange: (value: number) => void;
}) {
  const active = status === "active";
  const message = {
    idle: "Włącz czujniki i trzymaj telefon wygodnie — ta pozycja stanie się neutralna.",
    requesting: "Czekam na zgodę przeglądarki…",
    listening: "Czekam na pierwszy odczyt czujników…",
    active: "Do przodu: gaz · do siebie: hamulec · przechylenie na boki: skręt.",
    denied: "Brak dostępu do czujników. Zezwól na ruch i orientację w ustawieniach przeglądarki.",
    unsupported: "Ta przeglądarka nie udostępnia czujników orientacji.",
    insecure: "Czujniki wymagają bezpiecznego adresu HTTPS.",
    desktop: "",
  }[status];

  return <div className={`keyboard-card motion-card ${active ? "active" : ""}`} aria-live="polite">
    <span aria-hidden="true">{active ? "◉" : "⌁"}</span>
    <div>
      <p><strong>{active ? "Sterowanie ruchem aktywne" : "Sterowanie ruchem telefonu"}</strong><br />{message}</p>
      {(status === "idle" || status === "denied") && <button type="button" onClick={onEnable}>Włącz czujniki</button>}
      {active && <div className="motion-actions">
        <button type="button" onClick={onCalibrate}>Ustaw pozycję neutralną</button>
        <label className="motion-sensitivity">
          <span>Czułość <output>{sensitivity.toFixed(1)}×</output></span>
          <input type="range" min={0.6} max={2.5} step={0.1} value={sensitivity} onChange={(event) => onSensitivityChange(Number(event.target.value))} />
        </label>
      </div>}
    </div>
  </div>;
}

function DrivePad({ onThrottle, onSteering }: { onThrottle: (direction: -1 | 0 | 1) => void; onSteering: (direction: -1 | 0 | 1) => void }) {
  const handlers = (action: (direction: -1 | 0 | 1) => void, direction: -1 | 1) => ({
    onPointerDown: () => action(direction),
    onPointerUp: () => action(0),
    onPointerCancel: () => action(0),
    onPointerLeave: () => action(0),
  });
  return <div className="drive-pad" aria-label="Sterowanie samochodem">
    <button type="button" {...handlers(onSteering, -1)}><span>←</span> Lewo</button>
    <button type="button" {...handlers(onThrottle, 1)}><span>↑</span> Gaz</button>
    <button type="button" {...handlers(onThrottle, -1)}><span>↓</span> Wstecz</button>
    <button type="button" {...handlers(onSteering, 1)}><span>→</span> Prawo</button>
  </div>;
}

function LearningCards({ lab, settings }: { lab: LabId; settings: Settings }) {
  const content = {
    sunflower: { formula: `kąt = n × ${settings.sunflower.angle.toFixed(1)}°`, title: "Każde nasiono ma numer", text: "Pierwiastek z numeru mówi, jak daleko od środka je położyć.", clue: Math.abs(settings.sunflower.angle - 137.5) < 0.1 ? "To złoty kąt — przestrzeń wypełnia się prawie bez luk." : "Odejdź od 137,5° i obserwuj pojawiające się ramiona." },
    mandelbrot: { formula: "z ← z² + c", title: "Jedno działanie, wiele razy", text: "Każda nowa warstwa powtarza wzór dokładniej. Dlatego obraz wyłania się stopniowo z pustego płótna.", clue: "Zwiększ poziom wejścia, a potem przesuń X i Y. Każda zmiana rozpocznie budowę nowego widoku." },
    fibonacci: { formula: "Fₙ = Fₙ₋₁ + Fₙ₋₂", title: "Dodaj dwa poprzednie", text: "1, 1, 2, 3, 5, 8… Każdy krok powiększa spiralę w stałym rytmie.", clue: "Włącz liczby i sprawdź, jak szybko rośnie odległość od środka." },
    orbit: { formula: "θ = n × 137,5°", title: "Złoty kąt w trzech wymiarach", text: "Ten sam pomysł ze słonecznika potrafi równomiernie rozłożyć punkty na kuli.", clue: "Zmień skręt przestrzeni. Dla 1× punkty są najbardziej równomierne." },
    primes: { formula: "p ∈ {2, 3, 5, 7, 11…}", title: "Dzielą się tylko przez 1 i siebie", text: "Nie obliczamy ich podczas animacji — odkrywamy w przestrzeni gotową listę tysiąca liczb pierwszych.", clue: "Dodawaj punkty suwakiem i wypatruj miejsc, w których helisa robi większe przerwy." },
    formulas: { formula: FORMULAS.find((item) => item.id === settings.formulas.shape)!.equation, title: FORMULAS.find((item) => item.id === settings.formulas.shape)!.name, text: FORMULAS.find((item) => item.id === settings.formulas.shape)!.description, clue: "Przełącz widok XY i 3D. Dla wzorów przestrzennych obróć scenę myszką i obejrzyj ją z każdej strony." },
    mobiusDrive: { formula: "M(t,s)=((R+s cos(t/2))cos t, (R+s cos(t/2))sin t, s sin(t/2))", title: "Tor ma tylko jedną stronę", text: "Parametr s opisuje pozycję auta w poprzek toru. Gdy przekroczy szerokość wstęgi, samochód traci podłoże i spada.", clue: "Omijaj losowo rozstawione drzewa i spróbuj przejechać dwa okrążenia bez wypadnięcia." },
  }[lab];

  return (
    <section className="learning-grid" aria-label="Jak to działa">
      <article className="formula-card"><p>PRZEPIS</p><strong>{content.formula}</strong></article>
      <article className="explain-card"><span>01</span><div><h2>{content.title}</h2><p>{content.text}</p></div></article>
      <article className="discovery-card"><span aria-hidden="true">💡</span><p><strong>Spróbuj teraz</strong><br />{content.clue}</p></article>
    </section>
  );
}
