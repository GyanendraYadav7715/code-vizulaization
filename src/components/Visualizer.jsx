import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Visualizer({ step, prevStep }) {
  if (!step || !step.memory) {
     return <div className="flex h-full items-center justify-center text-gray-500">Awaiting execution...</div>
  }

  // Find the primary array to visualize (just take the first one found)
  const arrays = Object.entries(step.memory).filter(([k, v]) => Array.isArray(v));
  if (arrays.length === 0) {
      return <div className="flex h-full items-center justify-center text-gray-500">No array in memory to visualize.</div>
  }

  const [arrName, arr] = arrays[0];
  const prevArr = prevStep?.memory[arrName] || [];

  // Find active pointer indices: i, j, left, mid, right
  const pointerNames = ['i', 'j', 'left', 'right', 'mid', 'low', 'high', 'curr'];
  const pointersByStrIndex = {}; // "0": ["i"], "3": ["j", "right"]
  
  Object.entries(step.memory).forEach(([k, v]) => {
     if (typeof v === 'number' && pointerNames.includes(k) && v >= 0 && v < arr.length) {
         if (!pointersByStrIndex[v]) pointersByStrIndex[v] = [];
         pointersByStrIndex[v].push(k);
     }
  });

  // Calculate max for relative height scaling
  const maxVal = Math.max(...arr, 1); 

  const getPointerColor = (name) => {
     const colors = {
        'i': 'text-blue-400',
        'j': 'text-yellow-400',
        'left': 'text-purple-400',
        'right': 'text-red-400',
        'mid': 'text-green-400'
     };
     return colors[name] || 'text-gray-400';
  };

  return (
    <div className="flex flex-col h-full w-full items-center justify-center relative p-8">
      {/* Title */}
      <h2 className="absolute top-4 left-4 text-gray-400 font-mono text-sm tracking-widest uppercase font-bold">
        {arrName} = [...]
      </h2>

      <div className="flex items-end justify-center gap-2 flex-1 w-full mt-10">
        <AnimatePresence mode="popLayout">
          {arr.map((val, idx) => {
             const prevVal = prevArr[idx];
             const isChanged = prevVal !== undefined && val !== prevVal;
             
             return (
               <div key={idx} className="flex flex-col items-center gap-2">
                 <motion.div
                   layout
                   initial={{ opacity: 0, scaleY: 0 }}
                   animate={{ 
                      opacity: 1, 
                      scaleY: 1,
                      backgroundColor: isChanged ? '#22c55e' : '#3b82f6', // Green if changed, else blue
                   }}
                   exit={{ opacity: 0, scaleY: 0 }}
                   transition={{ 
                      type: "spring", 
                      stiffness: 300, 
                      damping: 20,
                      backgroundColor: { duration: 0.2 } 
                   }}
                   className={`w-10 sm:w-12 md:w-14 rounded-t-md relative flex justify-center \${!isChanged && prevArr.length > 0 ? 'opacity-80' : 'opacity-100 z-10'}`}
                   style={{ 
                     height: `\${Math.max((val / maxVal) * 250, 20)}px`,
                     transformOrigin: "bottom"
                   }}
                 >
                   {/* Float Label for Change */}
                   <AnimatePresence>
                     {isChanged && (
                        <motion.div 
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: -25 }}
                           exit={{ opacity: 0 }}
                           className="absolute -top-4 text-[10px] font-bold text-green-400 whitespace-nowrap bg-green-900/40 px-1.5 rounded"
                        >
                           changed!
                        </motion.div>
                     )}
                   </AnimatePresence>
                   
                   <span className="mt-auto mb-2 text-white font-mono text-sm font-bold">
                     {val}
                   </span>
                 </motion.div>

                 {/* Index Number */}
                 <div className="text-gray-500 font-mono text-xs mb-1 bg-black/40 px-1 rounded">
                   [{idx}]
                 </div>

                 {/* Pointers Below Array Box */}
                 <div className="flex flex-col items-center gap-0.5 justify-start h-16 relative">
                    <AnimatePresence>
                       {(pointersByStrIndex[idx] || []).map((ptr, pIdx) => (
                          <motion.div
                             key={ptr}
                             layoutId={`ptr-\${ptr}`} // Enables smooth move between indices!
                             initial={{ opacity: 0, y: 10 }}
                             animate={{ opacity: 1, y: pIdx * 2 }}
                             exit={{ opacity: 0, scale: 0 }}
                             className={`flex flex-col items-center \${getPointerColor(ptr)} drop-shadow-md absolute`}
                             style={{ top: pIdx * 18 }}
                          >
                             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m18 15-6-6-6 6"/>
                             </svg>
                             <span className="text-[10px] uppercase font-bold mt-[-2px]">{ptr}</span>
                          </motion.div>
                       ))}
                    </AnimatePresence>
                 </div>
               </div>
             );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
