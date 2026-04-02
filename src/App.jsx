import { useState, useRef, useEffect, useCallback } from 'react';
import Editor from './components/Editor';
import Visualizer from './components/Visualizer';
import Topbar from './components/Topbar';
import { presets } from './presets';
import { executeCode } from './Engine';

export default function App() {
  const [code, setCode] = useState(presets.lexicographical.code);
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [error, setError] = useState(null);

  // Speed mapping: 0.5x -> 800ms, 1x -> 400ms, 3x -> ~133ms
  const baseDelay = 400; // default for 1x
  const delay = baseDelay / speedMultiplier;

  const handleRun = useCallback(() => {
    setIsPlaying(false);
    setError(null);
    const result = executeCode(code);
    if (result.success) {
      if (result.steps.length === 0) {
        setError('No state changes captured.');
        setSteps([]);
      } else {
        setSteps(result.steps);
        setCurrentStepIndex(0);
        setIsPlaying(true);
      }
    } else {
      setError(result.error);
    }
  }, [code]);

  useEffect(() => {
    let interval;
    if (isPlaying && steps.length > 0) {
      interval = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, delay);
    }
    return () => clearInterval(interval);
  }, [isPlaying, steps.length, delay]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const stepForward = () => setCurrentStepIndex(p => Math.min(steps.length - 1, p + 1));
  const stepBack = () => setCurrentStepIndex(p => Math.max(0, p - 1));

  const loadPreset = (key) => {
    setCode(presets[key].code);
    setIsPlaying(false);
    setSteps([]);
    setCurrentStepIndex(0);
    setError(null);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[var(--color-bg-dark)] text-white font-sans overflow-hidden">
      <Topbar 
        onRun={handleRun}
        onStepBack={stepBack}
        onStepForward={stepForward}
        isPlaying={isPlaying}
        togglePlay={togglePlay}
        speed={speedMultiplier}
        setSpeed={setSpeedMultiplier}
        onLoadPreset={loadPreset}
        hasSteps={steps.length > 0}
      />
      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/2 border-r border-gray-800 flex flex-col bg-[var(--color-bg-editor)]">
          <Editor 
            code={code} 
            onChange={setCode} 
            activeLine={steps.length > 0 ? steps[currentStepIndex]?.line : null} 
          />
        </div>
        <div className="w-1/2 flex flex-col relative bg-[var(--color-bg-viz)] overflow-y-auto">
          {error ? (
            <div className="p-4 m-4 bg-red-900/50 text-red-200 border border-red-800 rounded">
              <h3 className="font-bold">Execution Error</h3>
              <p className="font-mono text-sm mt-2 whitespace-pre-wrap">{error}</p>
            </div>
          ) : (
            <Visualizer 
              step={steps[currentStepIndex]} 
              prevStep={currentStepIndex > 0 ? steps[currentStepIndex - 1] : null}
            />
          )}

          {steps.length > 0 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
              <div className="bg-black/60 backdrop-blur border border-white/10 px-4 py-2 rounded-full text-sm font-medium tracking-wide">
                Step {currentStepIndex + 1} / {steps.length}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
