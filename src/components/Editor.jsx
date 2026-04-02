import React, { useRef, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';

export default function Editor({ code, onChange, activeLine }) {
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
      if (activeLine) {
        decorationsCollection.current.set([{
          range: new monacoRef.current.Range(activeLine, 1, activeLine, 1),
          options: {
            isWholeLine: true,
            className: 'bg-yellow-500/20 border-l-4 border-yellow-500',
            glyphMarginClassName: 'bg-yellow-500',
          }
        }]);
        // Scroll to the line
        editorRef.current.revealLineInCenterIfOutsideViewport(activeLine);
      } else {
        decorationsCollection.current.set([]);
      }
    }
  }, [activeLine]);

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
