import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator } from 'lucide-react';

export default function ExpressionEvaluator({ step }) {
  const expr = step?.expr;
  if (!expr || !expr.raw) {
    return (
      <div className="flex flex-col h-full bg-gray-900 border border-gray-800 rounded-lg p-3">
         <div className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-2">
            <Calculator size={14} /> Evaluator
         </div>
         <div className="text-gray-600 text-sm italic py-2">No active expression evaluation...</div>
      </div>
    );
  }

  // Attempt raw substitution of known scalar variables
  let subbed = expr.raw;
  if (step.memory) {
     const sortedKeys = Object.keys(step.memory).sort((a,b) => b.length - a.length);
     sortedKeys.forEach(k => {
        const v = step.memory[k];
        if (typeof v === 'number' || typeof v === 'boolean' || typeof v === 'string') {
             // Replaces whole words bounded by syntax
             const regex = new RegExp(`\\\\b\${k}\\\\b`, 'g');
             subbed = subbed.replace(regex, typeof v === 'string' ? `"\${v}"` : String(v));
        }
     });
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 border border-gray-800 rounded-lg p-3 overflow-hidden text-sm">
         <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-3">
            <Calculator size={14} /> Evaluator
         </div>
         
         <div className="font-mono text-gray-300 ml-2 space-y-1.5 flex flex-col justify-center flex-1">
            <AnimatePresence mode="wait">
               <motion.div 
                 key={expr.raw}
                 initial={{ opacity: 0, x: -10 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: 10 }}
                 className="space-y-1.5"
               >
                  <div className="text-blue-300">{expr.raw}</div>
                  {subbed !== expr.raw && (
                     <div className="text-purple-300 ml-2">↳ {subbed}</div>
                  )}
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-800">
                     <span className="text-gray-500">→</span> 
                     <span className={`px-2 py-0.5 rounded text-xs font-bold \${expr.val ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                        {String(expr.val)}
                     </span>
                  </div>
               </motion.div>
            </AnimatePresence>
         </div>
    </div>
  );
}
