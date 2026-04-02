import { parse } from 'acorn';
import * as walk from 'acorn-walk';
import { generate } from 'astring';

export function executeCode(code) {
  let steps = [];
  try {
    const ast = parse(code, { ecmaVersion: 'latest', locations: true });

    // 1. Find all defined variable names
    const variables = new Set();
    walk.simple(ast, {
      VariableDeclarator(node) {
        if (node.id.type === 'Identifier') variables.add(node.id.name);
      },
      FunctionDeclaration(node) {
        if (node.id && node.id.type === 'Identifier') variables.add(node.id.name);
        for (let param of node.params) {
          if (param.type === 'Identifier') variables.add(param.name);
        }
      }
    });

    const varsArray = Array.from(variables);

    // Creates: __snap(line, { x: __safeGet(() => __clone(x)) }, type, expressionObj)
    function createSnapNode(line, type = 'update', expressionObj = null) {
      const properties = varsArray.map(v => ({
        type: "Property",
        key: { type: "Identifier", name: v },
        value: {
          type: "CallExpression",
          callee: { type: "Identifier", name: "__safeGet" },
          arguments: [{
            type: "ArrowFunctionExpression",
            id: null, params: [], generator: false, async: false, expression: true,
            body: {
               type: "CallExpression",
               callee: { type: "Identifier", name: "__clone" },
               arguments: [{ type: "Identifier", name: v }]
            }
          }]
        },
        kind: "init", method: false, shorthand: false, computed: false
      }));

      const args = [
        { type: "Literal", value: line },
        { type: "ObjectExpression", properties },
        { type: "Literal", value: type }
      ];

      if (expressionObj) {
        args.push(expressionObj);
      }

      return {
        type: "ExpressionStatement",
        expression: {
          type: "CallExpression",
          callee: { type: "Identifier", name: "__snap" },
          arguments: args
        }
      };
    }

    function createCallStr(funcName, ...args) {
      return {
        type: "ExpressionStatement",
        expression: {
          type: "CallExpression",
          callee: { type: "Identifier", name: funcName },
          arguments: args.map(a => ({ type: "Literal", value: a }))
        }
      };
    }

    const blockify = (node) => {
      if (node.type !== 'BlockStatement') {
        return { type: 'BlockStatement', body: [node] };
      }
      return node;
    };

    // 2. Inject __snap calls after statements
    function injectWalk(node) {
      if (!node) return;

      if (node.type === 'FunctionDeclaration' && node.body.type === 'BlockStatement') {
         const fnName = node.id ? node.id.name : 'anonymous';
         const enterFn = createCallStr('__enterFn', fnName, node.loc.start.line);
         const exitFn = createCallStr('__exitFn', fnName);
         
         // inject enter at top of block
         let newBlock = [enterFn];
         for (let i = 0; i < node.body.body.length; i++) {
            let child = node.body.body[i];
            if (child.type === 'ReturnStatement') {
               newBlock.push(createCallStr('__exitFn', fnName));
            }
            injectWalk(child);
            newBlock.push(child);
         }
         // ensure exit at end even if no return
         if (newBlock[newBlock.length - 1].type !== 'ReturnStatement') {
            newBlock.push(exitFn);
         }
         node.body.body = newBlock;
         return; // already traversed children
      }

      if (Array.isArray(node.body)) {
        let newBody = [];
        for (let i = 0; i < node.body.length; i++) {
          let child = node.body[i];

          if (child && child.type === 'ExpressionStatement' && child.expression.type === 'CallExpression' && 
             ['__snap', '__enterFn', '__exitFn', '__enterLoop', '__exitLoop'].includes(child.expression.callee.name)) {
            newBody.push(child);
            continue;
          }

          if (!child) continue;

          // Track Loops
          if (child.type === 'ForStatement' || child.type === 'WhileStatement') {
             const line = child.loc.start.line;
             const loopCode = code.substring(child.start, child.type === 'ForStatement' ? child.body.start : child.test.end).replace(/{$/, '').trim();
             newBody.push(createCallStr('__enterLoop', line, child.type, loopCode));
             
             // Extract test expression for evaluator
             if (child.test) {
                const exprCode = code.substring(child.test.start, child.test.end);
                // snapExpr(line, locals, 'eval', { code: exprCode, val: testEval })
                const evalObj = {
                   type: "ObjectExpression",
                   properties: [
                      { type: "Property", key: { type: "Identifier", name: "raw" }, value: { type: "Literal", value: exprCode }, kind: "init" },
                      { type: "Property", key: { type: "Identifier", name: "val" }, value: { type: "CallExpression", callee: { type: "Identifier", name: "__safeGet" }, arguments: [{ type: "ArrowFunctionExpression", params: [], body: child.test, expression: true }] }, kind: "init" }
                   ]
                };
                newBody.push(createSnapNode(line, 'eval', evalObj));
             }

             // Make sure loop body is a block
             child.body = blockify(child.body);
             injectWalk(child);
             newBody.push(child);
             newBody.push(createCallStr('__exitLoop', line));
             continue;
          }

          // Expressions: IfStatement test
          if (child.type === 'IfStatement') {
             const line = child.loc.start.line;
             const exprCode = code.substring(child.test.start, child.test.end);
             const evalObj = {
                type: "ObjectExpression",
                properties: [
                   { type: "Property", key: { type: "Identifier", name: "raw" }, value: { type: "Literal", value: exprCode }, kind: "init" },
                   { type: "Property", key: { type: "Identifier", name: "val" }, value: { type: "CallExpression", callee: { type: "Identifier", name: "__safeGet" }, arguments: [{ type: "ArrowFunctionExpression", params: [], body: child.test, expression: true }] }, kind: "init" }
                ]
             };
             newBody.push(createSnapNode(line, 'eval', evalObj));
             child.consequent = blockify(child.consequent);
             if (child.alternate) child.alternate = blockify(child.alternate);
          }

          injectWalk(child);
          newBody.push(child);
          
          // Insert snap after standard statements
          if (child.type !== 'FunctionDeclaration' && child.type !== 'ReturnStatement') {
             const line = child.loc ? child.loc.end.line : 1;
             newBody.push(createSnapNode(line));
          }
        }
        node.body = newBody;
      }

      for (let key in node) {
        if (node[key] && typeof node[key] === 'object' && key !== 'loc') {
          if (Array.isArray(node[key]) && key !== 'body') {
            node[key].forEach(injectWalk);
          } else if (!Array.isArray(node[key])) {
            injectWalk(node[key]);
          }
        }
      }
    }

    injectWalk(ast);

    // 3. Generate instrumented code
    const instrumentedCode = generate(ast);

    // 4. Execution Sandbox
    const callStack = [];
    const activeLoops = [];
    const logs = [];
    
    // Track stats
    let totalComparisons = 0;
    let totalSwaps = 0;
    let previousArrayStates = {}; // used to detect swaps

    const __enterFn = (name, line) => { callStack.push({ name, line }); };
    const __exitFn = () => { callStack.pop(); };
    const __enterLoop = (line, type, rawCode) => { activeLoops.push({ id: Math.random(), line, type, rawCode, iterations: 0 }); };
    const __exitLoop = () => { activeLoops.pop(); };

    const __snap = (line, locals, type, expr) => {
      // Memory payload
      const payload = {};
      for (const [k, v] of Object.entries(locals)) {
        if (v !== undefined) {
           payload[k] = v;
        }
      }

      // Detect Comparisons from Expr Eval
      if (type === 'eval' && expr && expr.raw) {
         if (expr.raw.match(/(===|!==|==|!=|<|>|<=|>=)/)) {
             totalComparisons++;
         }
         // update loops iterations
         if (activeLoops.length > 0) activeLoops[activeLoops.length - 1].iterations++;
      }

      // Detect Swaps via naive array diff checking
      let swapped = false;
      for (const [k, v] of Object.entries(payload)) {
         if (Array.isArray(v) && previousArrayStates[k]) {
            let diffCount = 0;
            for (let i = 0; i < v.length; i++) {
               if (v[i] !== previousArrayStates[k][i]) diffCount++;
            }
            // A simultaneous change of exactly 2 elements = 1 swap.
            // Usually step size will catch it as 2 diffs or consecutive captures.
            if (diffCount >= 1) swapped = true;
         }
         if (Array.isArray(v)) previousArrayStates[k] = [...v];
      }
      if (swapped && type === 'update') totalSwaps++;

      steps.push({ 
         line, 
         memory: payload,
         type, 
         expr, 
         callStack: [...callStack], 
         activeLoops: activeLoops.map(l => ({...l})),
         stats: { comparisons: totalComparisons, swaps: totalSwaps },
         logs: [...logs]
      });
    };

    const __clone = (v) => {
        if (Array.isArray(v)) return [...v];
        if (typeof v === 'object' && v !== null) return {...v};
        return v;
    };

    const __safeGet = (getter) => {
      try { return getter(); } catch (e) { return undefined; }
    };

    const mockConsole = { 
       log: (...args) => {
          logs.push({ text: args.join(' '), stepIdx: steps.length });
       }
    };

    const runFunc = new Function('console', '__snap', '__clone', '__safeGet', '__enterFn', '__exitFn', '__enterLoop', '__exitLoop', instrumentedCode);
    
    // Set execution limits
    const t0 = Date.now();
    
    runFunc(mockConsole, __snap, __clone, __safeGet, __enterFn, __exitFn, __enterLoop, __exitLoop);

    return { success: true, steps };
  } catch (err) {
    console.error("Execution error:", err);
    return { success: false, error: err.toString(), steps: [] };
  }
}
