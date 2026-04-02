import { Play, Pause, StepBack, StepForward, Activity, Settings2 } from 'lucide-react';
import { presets } from '../presets';

export default function Topbar({ 
  onRun, 
  onStepBack, 
  onStepForward, 
  isPlaying, 
  togglePlay, 
  speed, 
  setSpeed, 
  onLoadPreset,
  hasSteps
}) {
  return (
    <div className="h-14 border-b border-gray-800 bg-black/40 flex items-center justify-between px-4 sticky top-0 z-10 backdrop-blur-md">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
          <Activity size={18} className="text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          AlgoViz
        </span>
      </div>

      {/* Main Controls */}
      <div className="flex items-center gap-2">
        <button 
          onClick={onRun}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-md font-medium text-sm transition-colors"
        >
          <Play size={16} className="fill-current" /> Run Code
        </button>

        <div className="w-px h-6 bg-gray-700 mx-2" />

        <button 
          onClick={onStepBack} disabled={!hasSteps}
          className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <StepBack size={18} />
        </button>
        
        <button 
          onClick={hasSteps ? togglePlay : undefined} disabled={!hasSteps}
          className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-gray-700 disabled:opacity-30 transition-colors"
        >
          {isPlaying ? <Pause size={18} className="fill-current"/> : <Play size={18} className="fill-current ml-0.5" />}
        </button>

        <button 
          onClick={onStepForward} disabled={!hasSteps}
          className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <StepForward size={18} />
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 group">
          <Settings2 size={16} className="text-gray-400 group-hover:text-gray-300 transition-colors" />
          <span className="text-xs font-medium text-gray-400 whitespace-nowrap">Speed ({speed}x)</span>
          <input 
            type="range" 
            min="0.5" max="3" step="0.5" 
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-24 accent-blue-500 cursor-pointer"
          />
        </div>

        <select 
          onChange={(e) => onLoadPreset(e.target.value)}
          className="bg-gray-800/80 border border-gray-700 text-sm text-gray-200 rounded-md px-3 py-1.5 appearance-none cursor-pointer hover:bg-gray-700 outline-none focus:ring-1 focus:ring-blue-500"
          defaultValue="lexicographical"
        >
          {Object.entries(presets).map(([key, config]) => (
            <option key={key} value={key}>{config.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
