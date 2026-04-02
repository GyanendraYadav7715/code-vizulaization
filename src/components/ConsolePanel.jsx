import React, { useRef, useEffect } from 'react';
import { Terminal } from 'lucide-react';

export default function ConsolePanel({ logs, currentStepIdx, onLogClick }) {
  const endRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="flex flex-col h-full bg-black border border-gray-800 rounded-lg p-2 font-mono text-sm overflow-hidden">
      <div className="flex items-center gap-2 px-2 py-1 mb-1 border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider font-sans font-bold">
        <Terminal size={14} /> Console Output
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
        {logs.length === 0 ? (
          <div className="text-gray-600 italic mt-2 text-xs">Waiting for console output...</div>
        ) : (
          logs.map((log, idx) => {
             // Only show logs that happened at or before this step
             if (log.stepIdx > currentStepIdx) return null;
             
             return (
               <div 
                  key={idx} 
                  className="flex gap-3 items-start group cursor-pointer hover:bg-gray-900 rounded p-1"
                  onClick={() => onLogClick(log.stepIdx)}
               >
                 <span className="text-gray-600 text-xs mt-0.5 shrink-0 select-none group-hover:text-blue-400">
                    [Step {log.stepIdx}]
                 </span>
                 <span className="text-gray-300 break-all">{log.text}</span>
               </div>
             )
          })
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
