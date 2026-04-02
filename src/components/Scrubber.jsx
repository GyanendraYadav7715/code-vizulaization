import React from 'react';

export default function Scrubber({ steps = [], currentIdx, onSeek }) {
  
  const getStepColor = (step, prevStep) => {
    if (!prevStep) return 'bg-gray-700 hover:bg-gray-600';
    
    // Swap gets highest priority glow
    if (step.stats?.swaps > (prevStep.stats?.swaps || 0)) {
       return 'bg-green-500 hover:bg-green-400';
    }
    // Compare
    if (step.stats?.comparisons > (prevStep.stats?.comparisons || 0)) {
       return 'bg-yellow-500 hover:bg-yellow-400';
    }
    
    return 'bg-gray-700 hover:bg-gray-600';
  };

  return (
    <div className="w-full flex flex-col gap-1 px-4 select-none">
       <div className="flex justify-between items-end mb-1">
          <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Execution Timeline</span>
          <span className="text-xs font-mono text-gray-400">{currentIdx + 1} / {steps.length}</span>
       </div>
       <div className="flex w-full h-4 gap-[1px] bg-black p-1 rounded border border-gray-800 relative">
          {steps.map((step, idx) => {
             const isPastOrPresent = idx <= currentIdx;
             const isCurrent = idx === currentIdx;
             const color = getStepColor(step, idx > 0 ? steps[idx - 1] : null);
             
             return (
               <div
                  key={idx}
                  onClick={() => onSeek(idx)}
                  className={`flex-1 h-full rounded-sm cursor-pointer transition-colors duration-100 ease-in
                     \${isPastOrPresent ? color : 'bg-gray-900 hover:bg-gray-800'}
                     \${isCurrent ? 'ring-1 ring-white z-10 scale-y-150' : ''}
                  `}
                  title={`Step \${idx + 1}`}
               />
             );
          })}
       </div>
       <div className="flex justify-between text-[10px] text-gray-600 mt-1 uppercase font-bold tracking-wider">
         <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block"/> Swap</span>
         <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block"/> Eval / Compare</span>
         <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-600 inline-block"/> Step</span>
       </div>
    </div>
  );
}
