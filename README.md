# AlgoViz ⚡

**AlgoViz** is a modern, high-performance Data Structure and Algorithm Visualizer built with React, Vite, and Tailwind CSS. Unlike standard algorithmic visualizers that use hardcoded delays or simple generators, AlgoViz uses a custom **Abstract Syntax Tree (AST)** instrumentation engine to execute your JavaScript in real-time, capturing granular snapshots of variables, call stacks, loop iterations, and execution paths.

## 🚀 Features

- **Split-Screen Interactive UI**: Monaco Editor for coding on the left, and a multi-pane Dashboard on the right.
- **Deep AST Instrumentation**: Utilizing Acorn.js, your raw JavaScript is parsed and wrapped with intelligent hooks that track everything from `for` loops to functional recursion.
- **Live Variable Tracker**: Automatically detects scalar and array variables, tracking their status with visual indicators and type-checking (🔢, 📋, ✅).
- **Execution Timelines**: Scrubber bar allowing you to jump across the algorithm's lifecycle, with color-coded heatmap highlights indicating Swaps and Comparisons.
- **Call Stacks & Loop Trackers**: Visualizing functional depth via popping motion frames, alongside tracking inner/outer loops natively mapped bounds.
- **Execution Frequency Gutter**: A Monaco editor overlay that builds a real-time heatmap mapping how often a specific line of code executed.
- **Smart Pointers**: Numeric variables matching index nomenclature (`i, j, left, mid, right`) automatically generate dynamic sliding arrows underneath visualized arrays.

## 💻 Tech Stack

- **Framework**: React 18 / Vite
- **Styling**: Tailwind CSS v4
- **Editor**: `@monaco-editor/react`
- **Animations**: Framer Motion
- **Parsing**: `acorn`, `acorn-walk`, `astring`
- **Icons**: Lucide React

## 🛠 Installation & Setup

### Local Development

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/GyanendraYadav7715/code-vizulaization.git
   cd code-vizulaization
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Start the Vite development server:
   \`\`\`bash
   npm run dev
   \`\`\`

### Docker

AlgoViz comes with native Docker support out of the box using an Nginx alpine container for lightweight production serving.

1. Build and run using Docker Compose:
   \`\`\`bash
   docker-compose up -d --build
   \`\`\`
   
2. The application will be available at: **http://localhost:8080**

*Alternatively, directly build the docker image:*
\`\`\`bash
docker build -t algoviz .
docker run -p 8080:80 algoviz
\`\`\`

## 🧠 How the Engine Works

The core of AlgoViz lies in `src/Engine.js`. When code is passed to the engine:
1. **Parsing**: `acorn` builds an AST from the provided JavaScript.
2. **Analysis**: Variables, functions, and loop conditions are analyzed.
3. **Instrumentation**: `acorn-walk` modifies the AST, injecting synthetic hooks (like `__snap`, `__enterLoop`, `__enterFn`) at critical execution junctions without disrupting the original lexical scope.
4. **Execution**: The wrapped AST is mapped back to string via `astring` and safely evaluated in a sandboxed `new Function` context, intercepting variables using safe TDZ catchers to visualize the temporal logic.

## 🤝 Contributing
Contributions are always welcome. Please ensure your commits and PRs align with extending visual plugins or tracking additional complex data structures natively via the Engine.

---
*Developed as a premier demonstration of modern web engineering and abstract syntax tree manipulation.*
