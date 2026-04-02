import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Search, Activity } from 'lucide-react';

export default function StatsPanel({ step, totalSteps }) {
  const stats = step?.stats || { comparisons: 0, swaps: 0 };
  
  // Animation triggers on change
  const [prevComps, setPrevComps] = useState(0);
  const [prevSwaps, setPrevSwaps] = useState(0);

  useEffect(() => {
     if (stats.comparisons > prevComps) setPrevComps(stats.comparisons);
     if (stats.swaps > prevSwaps) setPrevSwaps(stats.swaps);
  }, [stats]);

  const StatBox = ({ icon, label, value, bgClass, textClass, trigger }) => (
    <div className={`flex-1 rounded-md p-2 border border-gray-800 flex items-center justify-between \${bgClass}`}>
       <div className="flex items-center gap-2 text-gray-400">
          {icon} <span className="text-xs uppercase font-bold tracking-wide">{label}</span>
       </div>
       <motion.div 
         key={trigger} 
         initial={{ scale: 1.5, color: '#fff' }} 
         animate={{ scale: 1, color: '' }} 
         className={`text-xl font-mono font-bold \${textClass}`}
       >
          {value}
       </motion.div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-gray-900 border border-gray-800 rounded-lg p-3">
       <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Activity size={14} /> Execution Stats
       </div>
       <div className="flex gap-3 h-full">
          <StatBox 
             icon={<Search size={16} />} 
             label="Comparisons" 
             value={stats.comparisons} 
             trigger={stats.comparisons}
             bgClass="bg-blue-900/10" 
             textClass="text-blue-400"
          />
          <StatBox 
             icon={<Zap size={16} />} 
             label="Swaps" 
             value={stats.swaps} 
             trigger={stats.swaps}
             bgClass="bg-green-900/10" 
             textClass="text-green-400"
          />
          <StatBox 
             icon={<Activity size={16} />} 
             label="Step" 
             value={(step ? step.line : 0) + " / " + totalSteps} 
             trigger={totalSteps} // Less poppy
             bgClass="bg-gray-800/30" 
             textClass="text-gray-300"
          />
       </div>
    </div>
  );
}
