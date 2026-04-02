import React, { useRef, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';

export default function Editor({ code, onChange, activeLine, heatmap = {} }) {
  const monacoRef = useRef(null);
  const editorRef = useRef(null);
  const decorationsCollection = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    decorationsCollection.current = editor.createDecorationsCollection();
    
    // Add custom active line highlight style
    // Wait, global css is better for monaco custom decorations
  };

  useEffect(() => {
    if (editorRef.current && monacoRef.current && decorationsCollection.current) {
      const decs = [];
      
      // Calculate max frequency for Heatmap gradients
      const freqs = Object.values(heatmap);
      const maxFreq = freqs.length > 0 ? Math.max(...freqs) : 1;

      // Add heatmap decorations
      Object.entries(heatmap).forEach(([line, count]) => {
         const numLine = Number(line);
         if (!numLine || numLine === activeLine) return; // Active line overwrites heatmap
         
         const ratio = count / maxFreq;
         let colorClass = 'bg-yellow-500/10';
         if (ratio > 0.3) colorClass = 'bg-orange-500/20';
         if (ratio > 0.6) colorClass = 'bg-red-500/30';

         decs.push({
            range: new monacoRef.current.Range(numLine, 1, numLine, 1),
            options: {
               isWholeLine: true,
               className: colorClass,
               hoverMessage: { value: `**Executed \${count} times**` }
            }
         });
      });

      if (activeLine) {
        decs.push({
          range: new monacoRef.current.Range(activeLine, 1, activeLine, 1),
          options: {
            isWholeLine: true,
            className: 'bg-blue-500/30 border-l-4 border-blue-400 z-50',
          }
        });
        // Scroll to the line
        editorRef.current.revealLineInCenterIfOutsideViewport(activeLine);
      }
      
      decorationsCollection.current.set(decs);
    }
  }, [activeLine, heatmap]);

  return (
    <div className="w-full h-full relative">
      <MonacoEditor
        height="100%"
        language="javascript"
        theme="vs-dark"
        value={code}
        onChange={(val) => onChange(val || '')}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          padding: { top: 16 },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on"
        }}
      />
    </div>
  );
}
