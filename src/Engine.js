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
        if (node.id.type === 'Identifier') {
          variables.add(node.id.name);
        }
      },
      FunctionDeclaration(node) {
        if (node.id && node.id.type === 'Identifier') {
          // variables.add(node.id.name); // Usually we don't need to track function definitions themselves
        }
        for (let param of node.params) {
          if (param.type === 'Identifier') {
            variables.add(param.name);
          }
        }
      }
    });

    const varsArray = Array.from(variables);

    // Creates the AST node for: 
    // __snap(line, { "x": typeof x !== "undefined" ? JSON.parse(JSON.stringify(x)) : undefined })
    function createSnapNode(line) {
      const properties = varsArray.map(v => {
        return {
          type: "Property",
          key: { type: "Identifier", name: v },
          value: {
            type: "CallExpression",
            callee: { type: "Identifier", name: "__safeGet" },
            arguments: [{
              type: "ArrowFunctionExpression",
              id: null,
              params: [],
              body: {
                 type: "CallExpression",
                 callee: { type: "Identifier", name: "__clone" },
                 arguments: [{ type: "Identifier", name: v }]
              },
              generator: false,
              async: false,
              expression: true
            }]
          },
          kind: "init",
          method: false,
          shorthand: false,
          computed: false
        };
      });

      return {
        type: "ExpressionStatement",
        expression: {
          type: "CallExpression",
          callee: { type: "Identifier", name: "__snap" },
          arguments: [
            { type: "Literal", value: line },
            { type: "ObjectExpression", properties }
          ]
        }
      };
    }

    // 2. Inject __snap calls after statements
    function injectWalk(node) {
      if (!node) return;

      if (Array.isArray(node.body)) {
        let newBody = [];
        for (let i = 0; i < node.body.length; i++) {
          let child = node.body[i];
          injectWalk(child);
          newBody.push(child);
          
          if (child && child.type === 'ExpressionStatement' && child.expression.type === 'CallExpression' && child.expression.callee.name === '__snap') {
            continue;
          }

          // Insert snap after standard statements (Assignment, expression)
          if (child && child.type !== 'FunctionDeclaration' && child.type !== 'ReturnStatement') {
             const line = child.loc ? child.loc.end.line : 1;
             newBody.push(createSnapNode(line));
          }
        }
        // Also if it's a loop body and single statement we should ideally blockify it,
        // but AST parser blockifies it if it's already a block.
        // Let's assume standard formatting or at least it works for block bodies.
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

    // 4. Execute the code safely collecting snapshots
    const __snap = (line, locals) => {
      // Filter locals to only arrays or simple values we care about to visualize arrays/stacks/queues
      // For MVP we can keep arrays specifically
      const arraysOnly = {};
      for (const [k, v] of Object.entries(locals)) {
        if (Array.isArray(v)) {
          arraysOnly[k] = v;
        } else if (typeof v === 'number' || typeof v === 'string') {
          // Could track scalars for highlighting loop indices
          arraysOnly[k] = v;
        }
      }
      steps.push({ line, memory: arraysOnly });
    };

    const __clone = (v) => {
        if (Array.isArray(v)) return [...v];
        if (typeof v === 'object' && v !== null) return {...v};
        return v;
    };

    const __safeGet = (getter) => {
      try {
        return getter();
      } catch (e) {
        return undefined;
      }
    };

    const runFunc = new Function('console', '__snap', '__clone', '__safeGet', instrumentedCode);
    
    // Catch console.logs to avoid polluting actual console or track them
    const mockConsole = { log: () => {} };

    // timeout to prevent infinite loops (naive)
    const startTime = Date.now();
    // wait, to do precise timeout we'd need to inject time checks. For an MVP, we trust the code doesn't hard-freeze, 
    // or we're relying on fast typical user inputs.

    runFunc(mockConsole, __snap, __clone, __safeGet);

    return { success: true, steps };
  } catch (err) {
    console.error("Execution error:", err);
    return { success: false, error: err.toString(), steps: [] };
  }
}
