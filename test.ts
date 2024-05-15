import traverse, { Node } from "@babel/traverse";
import * as parser from "@babel/parser";
import * as fs from "fs";

interface NodeInfo {
    name: string|undefined;
    type: string;
    children: NodeInfo[];
}

// Read the JavaScript code from a file
const code: string = fs.readFileSync("D:/Project/github/climateVis/vue/src/main.js", "utf-8");

// Parse the code into an AST
const ast: Node = parser.parse(code, {
    sourceType: "module", // or "script" if your code is in a script
});

// Object to store the hierarchical structure
let variableHierarchy: NodeInfo[] = [];

// Function to traverse and build the variable hierarchy
const buildVariableHierarchy = (node: Node, parentFunction: string | null): void => {
    if (node.type === "VariableDeclaration") {
        node.declarations.forEach((declaration: any) => {
            // Add the variable to the hierarchy under the current function
            if (parentFunction) {
                // Find the parent function in the hierarchy
                const parentFunctionNode = variableHierarchy.find((item) => item.name === parentFunction);
                // If the parent function node exists, add the variable as its child
                if (parentFunctionNode) {
                    parentFunctionNode.children.push({
                        name: declaration.id.name,
                        type: "variable",
                        children: [],
                    });
                }
            } else {
                // If there's no parent function, add the variable to the top level
                variableHierarchy.push({
                    name: declaration.id.name,
                    type: "variable",
                    children: [],
                });
            }
        });
    }

    if (node.type === "FunctionDeclaration") {
        const functionName: string = (node.id as any).name;
        const functionNode: NodeInfo = {
            name: functionName,
            type: "function",
            children: [],
        };
        // Recursively traverse the function's body
        traverse(node.body, {
            enter(path: any) {
                buildVariableHierarchy(path.node, functionName);
            },
        });
        // Add the function to the hierarchy
        if (!parentFunction) {
            variableHierarchy.push(functionNode);
        } else {
            // Find the parent function in the hierarchy
            const parentFunctionNode = variableHierarchy.find((item) => item.name === parentFunction);
            // If the parent function node exists, add the current function as its child
            if (parentFunctionNode) {
                parentFunctionNode.children.push(functionNode);
            }
        }
    }

    if (node.type === "BlockStatement") {
        // Recursively traverse child nodes in block statements
        (node.body as Node[]).forEach((childNode) => {
            buildVariableHierarchy(childNode, parentFunction);
        });
    }
};

// Start building the variable hierarchy from the root node
buildVariableHierarchy(ast, null);

console.log(JSON.stringify(variableHierarchy, null, 2));
