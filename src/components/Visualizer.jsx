import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Visualizer({ step, prevStep }) {
  if (!step || !step.memory) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        <p>Run code to see visualizations</p>
      </div>
    );
  }

  // Filter only arrays
  const arraysToRender = Object.entries(step.memory).filter(([k, v]) => Array.isArray(v));

  if (arraysToRender.length === 0) {
    return (
       <div className="w-full h-full flex items-center justify-center text-gray-500">
          <p>No arrays found to visualize.</p>
       </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col p-6 gap-8 pb-20">
      <AnimatePresence>
        {arraysToRender.map(([varName, currArray]) => {
          const prevArray = prevStep?.memory?.[varName] || [];
          
          // Determine the maximum value for scaling logic (avoid dividing by 0)
          const allVals = [...currArray, ...prevArray].filter(v => typeof v === 'number');
          const maxVal = allVals.length > 0 ? Math.max(...allVals) : 10;
          const minVal = allVals.length > 0 ? Math.min(...allVals) : 0;
          
          return (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={varName} 
              className="flex flex-col border border-gray-800 rounded-xl p-4 bg-gray-900/40 relative overflow-hidden"
            >
              <div className="text-sm font-semibold text-gray-400 mb-6 uppercase tracking-wider font-mono">
                {varName} <span className="opacity-50 text-xs normal-case ml-2">length: {currArray.length}</span>
              </div>
              
              <div className="flex items-end gap-2 h-44 overflow-x-auto min-w-min pb-2 custom-scrollbar">
                <AnimatePresence>
                  {currArray.map((val, idx) => {
                     const isNumber = typeof val === 'number';
                     const displayHeight = isNumber 
                        ? Math.max(10, ((val - Math.min(0, minVal)) / (maxVal - Math.min(0, minVal) || 1)) * 140) 
                        : 40;
                     
                     // Highlight changed indices
                     const isChanged = prevStep && prevArray && prevArray[idx] !== val && prevArray.length > 0;
                     const isNew = prevStep && prevArray && idx >= prevArray.length;

                     // Determine color
                     let bgColor = "bg-blue-500";
                     let labelColor = "text-blue-100";
                     if (isChanged) {
                        bgColor = "bg-green-500";
                        labelColor = "text-green-50";
                     } else if (isNew) {
                        bgColor = "bg-yellow-500";
                        labelColor = "text-yellow-900";
                     }

                     return (
                        <motion.div
                          layout
                          key={isNumber ? `${val}-${idx}` : idx} // naive key to animate swaps if values are unique
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          transition={{
                             type: "spring",
                             stiffness: 300,
                             damping: 24,
                          }}
                          className="flex flex-col items-center justify-end group min-w-[2.5rem]"
                        >
                           <div className="text-xs text-gray-500 mb-2 truncate max-w-[3rem] opacity-0 group-hover:opacity-100 transition-opacity">
                              [{idx}]
                           </div>
                           <motion.div 
                              className={`w-10 rounded-t border-b-2 border-black/20 flex items-center justify-center shadow-lg transition-colors ${bgColor}`}
                              style={{ height: `${displayHeight}px` }}
                           >
                              <span className={`font-mono text-sm font-bold ${labelColor}`}>
                                 {typeof val === 'object' ? '{..}' : String(val)}
                              </span>
                           </motion.div>
                        </motion.div>
                     );
                  })}
                </AnimatePresence>
                {currArray.length === 0 && (
                   <div className="text-gray-600 text-sm italic py-4">Empty</div>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
