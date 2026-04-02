import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VariablePanel({ step, prevStep }) {
  if (!step || !step.memory) return <div className="p-4 text-gray-500 text-sm">No variables in scope.</div>;

  const currentVars = step.memory;
  const prevVars = prevStep?.memory || {};

  // Detect out of scope
  const allKeys = new Set([...Object.keys(currentVars), ...Object.keys(prevVars)]);
  
  const getTypeIcon = (val) => {
    if (Array.isArray(val)) return '📋';
    if (typeof val === 'number') return '🔢';
    if (typeof val === 'boolean') return '✅';
    if (typeof val === 'string') return '🔤';
    return '📦';
  };

  const formatValue = (val) => {
    if (Array.isArray(val)) return `[\${val.join(', ')}]`;
    return String(val);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      <div className="bg-gray-800/50 px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-800">
        Variables
      </div>
      <div className="flex-1 overflow-y-auto p-2 line-height-tight">
        <table className="w-full text-left text-sm">
          <thead className="text-gray-500 text-xs">
             <tr>
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium w-8">Type</th>
                <th className="pb-2 font-medium">Value</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {Array.from(allKeys).map(key => {
               const val = currentVars[key];
               const prevVal = prevVars[key];
               
               const isOutOfScope = val === undefined;
               const isNew = prevVal === undefined && val !== undefined;
               const isChanged = !isNew && !isOutOfScope && JSON.stringify(val) !== JSON.stringify(prevVal);

               return (
                  <motion.tr 
                     key={key}
                     initial={{ opacity: 0, x: 10 }}
                     animate={{ opacity: 1, x: 0 }}
                     className={`
                        \${isOutOfScope ? 'opacity-30 text-red-400' : 'text-gray-300'}
                        \${isChanged ? 'bg-yellow-500/20 text-yellow-100' : ''}
                        \${isNew ? 'bg-blue-500/10' : ''}
                        transition-colors duration-300
                     `}
                  >
                     <td className="py-2 pr-2 font-mono">{key}</td>
                     <td className="py-2 text-center opacity-80" title={typeof val}>{!isOutOfScope && getTypeIcon(val)}</td>
                     <td className="py-2 pl-2 font-mono truncate max-w-[120px]">
                        {!isOutOfScope ? formatValue(val) : 'out of scope'}
                     </td>
                  </motion.tr>
               )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
