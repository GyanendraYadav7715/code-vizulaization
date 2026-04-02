import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers } from 'lucide-react';

export default function CallStack({ callStack = [] }) {
  return (
    <div className="flex flex-col h-full bg-gray-900 border border-gray-800 rounded-lg p-2 gap-2 overflow-y-auto">
       <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1 flex items-center gap-2">
          <Layers size={14} /> Call Stack
       </div>
       {callStack.length === 0 ? (
          <div className="p-2 text-gray-500 text-sm">Main Context</div>
       ) : (
          <div className="flex flex-col gap-1 items-center justify-end flex-1 pb-2">
             <AnimatePresence>
                {/* Main script assumed at bottom */}
                <div className="w-11/12 border border-gray-800 bg-black/40 text-gray-500 text-xs py-1 px-2 text-center rounded">
                   main()
                </div>
                {callStack.map((frame, idx) => (
                   <motion.div
                     key={`\${frame.name}-\${idx}`}
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.8 }}
                     className={`w-11/12 border rounded shadow-md flex justify-between items-center px-3 py-1.5 \${idx === callStack.length - 1 ? 'bg-purple-900/40 border-purple-500/50 text-purple-100' : 'bg-gray-800/80 border-gray-700 text-gray-300'}`}
                     style={{ width: `\${90 + (idx * 2)}%` }} // slight stacking width
                   >
                      <span className="font-mono text-sm tracking-tight">{frame.name}()</span>
                      <span className="text-xs opacity-50">L{frame.line}</span>
                   </motion.div>
                ))}
             </AnimatePresence>
          </div>
       )}
    </div>
  );
}
