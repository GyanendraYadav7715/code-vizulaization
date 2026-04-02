import { useState, useEffect, useCallback, useMemo } from 'react';
import Editor from './components/Editor';
import Visualizer from './components/Visualizer';
import Topbar from './components/Topbar';

import VariablePanel from './components/VariablePanel';
import LoopTracker from './components/LoopTracker';
import CallStack from './components/CallStack';
import StatsPanel from './components/StatsPanel';
import ExpressionEvaluator from './components/ExpressionEvaluator';
import ConsolePanel from './components/ConsolePanel';
import Scrubber from './components/Scrubber';

import { presets } from './presets';
import { executeCode } from './Engine';

export default function App() {
  const [code, setCode] = useState(presets.lexicographical.code);
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [error, setError] = useState(null);

  // Layout panels toggle
  const [showRightPanels, setShowRightPanels] = useState(true);
  const [showBottomPanels, setShowBottomPanels] = useState(true);

  const baseDelay = 400; // default for 1x
  const delay = baseDelay / Math.max(speedMultiplier, 0.1);

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
  const seekTo = (idx) => {
    setCurrentStepIndex(idx);
    setIsPlaying(false);
  };

  const loadPreset = (key) => {
    setCode(presets[key].code);
    setIsPlaying(false);
    setSteps([]);
    setCurrentStepIndex(0);
    setError(null);
  };

  const currentStep = steps[currentStepIndex];
  const prevStep = currentStepIndex > 0 ? steps[currentStepIndex - 1] : null;

  // Derive execution frequency heatmap
  const executionFrequencies = useMemo(() => {
     if (steps.length === 0) return {};
     const map = {};
     steps.forEach(s => { map[s.line] = (map[s.line] || 0) + 1; });
     return map;
  }, [steps]);

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
      
      {error && (
        <div className="p-4 mx-4 mt-4 bg-red-900/50 text-red-200 border border-red-800 rounded z-50">
          <h3 className="font-bold shrink-0">Execution Error</h3>
          <p className="font-mono text-sm mt-2 whitespace-pre-wrap">{error}</p>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="flex-1 overflow-hidden p-2 flex flex-col min-h-0">
         <div className="grid grid-cols-12 grid-rows-6 flex-1 gap-2 min-h-0">
            
            {/* Top Left: Editor (Col span dependent on right panel) */}
            <div className={`${showRightPanels ? 'col-span-4' : 'col-span-5'} ${showBottomPanels ? 'row-span-4' : 'row-span-6'} rounded-lg overflow-hidden border border-gray-800 bg-[var(--color-bg-editor)] relative shadow-lg`}>
               <Editor 
                  code={code} 
                  onChange={setCode} 
                  activeLine={steps.length > 0 ? currentStep?.line : null} 
                  heatmap={executionFrequencies}
               />
            </div>
            
            {/* Top Center: Visualizer */}
            <div className={`${showRightPanels ? 'col-span-6' : 'col-span-7'} ${showBottomPanels ? 'row-span-4' : 'row-span-6'} rounded-lg border border-gray-800 bg-[var(--color-bg-viz)] overflow-hidden shadow-lg`}>
               <Visualizer step={currentStep} prevStep={prevStep} />
            </div>

            {/* Top Right: Trackers */}
            {showRightPanels && (
               <div className={`col-span-2 ${showBottomPanels ? 'row-span-4' : 'row-span-6'} flex flex-col gap-2 min-h-0`}>
                  <div className="flex-3 min-h-0"><VariablePanel step={currentStep} prevStep={prevStep} /></div>
                  <div className="flex-2 min-h-0"><LoopTracker activeLoops={currentStep?.activeLoops} /></div>
                  <div className="flex-2 min-h-0"><CallStack callStack={currentStep?.callStack} /></div>
               </div>
            )}

            {/* Bottom Row */}
            {showBottomPanels && (
               <div className="col-span-12 row-span-2 grid grid-cols-12 gap-2 mt-1">
                  <div className="col-span-3 min-h-0"><ExpressionEvaluator step={currentStep} /></div>
                  <div className="col-span-5 flex flex-col gap-2 min-h-0">
                     <div className="flex-1 min-h-0"><StatsPanel step={currentStep} totalSteps={steps.length} /></div>
                     <div className="h-14 flex items-center bg-gray-900 border border-gray-800 rounded-lg pt-1 shadow-md shrink-0">
                        <Scrubber steps={steps} currentIdx={currentStepIndex} onSeek={seekTo} />
                     </div>
                  </div>
                  <div className="col-span-4 min-h-0"><ConsolePanel logs={steps.length > 0 ? steps[steps.length - 1].logs : []} currentStepIdx={currentStepIndex} onLogClick={seekTo} /></div>
               </div>
            )}

         </div>
      </div>
      
      {/* Layout Toggles */}
      <div className="absolute right-6 top-[72px] flex gap-2">
          <button 
             onClick={() => setShowRightPanels(!showRightPanels)}
             className={`text-xs px-2 py-1 rounded ${showRightPanels ? 'bg-blue-600/50' : 'bg-gray-800'} border border-gray-700`}
          >
             Toggle Watch
          </button>
          <button 
             onClick={() => setShowBottomPanels(!showBottomPanels)}
             className={`text-xs px-2 py-1 rounded ${showBottomPanels ? 'bg-blue-600/50' : 'bg-gray-800'} border border-gray-700`}
          >
             Toggle Stats
          </button>
      </div>

    </div>
  );
}
