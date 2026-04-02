import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Repeat } from 'lucide-react';

export default function LoopTracker({ activeLoops = [] }) {
  if (activeLoops.length === 0) {
     return <div className="p-4 text-gray-500 text-sm">No active loops.</div>;
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 border border-gray-800 rounded-lg p-2 gap-2 overflow-y-auto">
       <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Active Loops</div>
       <AnimatePresence>
          {activeLoops.map((loop, idx) => (
             <motion.div
               key={loop.id}
               initial={{ opacity: 0, scale: 0.95, y: -10 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className={`relative border rounded-md p-3 \${idx === activeLoops.length - 1 ? 'bg-blue-900/20 border-blue-500/50' : 'bg-gray-800/40 border-gray-700/50'}`}
               style={{ marginLeft: `\${idx * 8}px` }}
             >
                <div className="flex items-center gap-2 mb-2 text-sm">
                   <Repeat size={14} className={idx === activeLoops.length - 1 ? 'text-blue-400' : 'text-gray-400'} />
                   <span className="font-semibold text-gray-300">
                      {idx === 0 ? 'Outer Loop' : 'Inner Loop'} (line {loop.line})
                   </span>
                </div>
                <div className="font-mono text-xs text-gray-400 bg-black/30 p-1.5 rounded truncate mb-2">
                   {loop.rawCode}
                </div>
                <div className="flex items-center gap-2">
                   <div className="text-xs text-gray-300 min-w-[70px]">
                      Iter: {loop.iterations}
                   </div>
                   <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden relative">
                      {/* For indefinite progress, use an indeterminate animation */}
                      <motion.div 
                        className="absolute inset-y-0 left-0 bg-blue-500 w-1/3"
                        animate={{ x: ['-100%', '300%'] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                      />
                   </div>
                </div>
             </motion.div>
          ))}
       </AnimatePresence>
    </div>
  );
}
