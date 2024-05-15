"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const traverse_1 = require("@babel/traverse");
const parser = require("@babel/parser");
const fs = require("fs");
// Read the JavaScript code from a file
const code = fs.readFileSync("D:/Project/github/climateVis/vue/src/main.js", "utf-8");
// Parse the code into an AST
const ast = parser.parse(code, {
    sourceType: "module", // or "script" if your code is in a script
});
// Object to store the hierarchical structure
let variableHierarchy = [];
// Function to traverse and build the variable hierarchy
const buildVariableHierarchy = (node, parentFunction) => {
    if (node.type === "VariableDeclaration") {
        node.declarations.forEach((declaration) => {
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
            }
            else {
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
        const functionName = node.id.name;
        const functionNode = {
            name: functionName,
            type: "function",
            children: [],
        };
        // Recursively traverse the function's body
        (0, traverse_1.default)(node.body, {
            enter(path) {
                buildVariableHierarchy(path.node, functionName);
            },
        });
        // Add the function to the hierarchy
        if (!parentFunction) {
            variableHierarchy.push(functionNode);
        }
        else {
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
        node.body.forEach((childNode) => {
            buildVariableHierarchy(childNode, parentFunction);
        });
    }
};
// Start building the variable hierarchy from the root node
buildVariableHierarchy(ast, null);
console.log(JSON.stringify(variableHierarchy, null, 2));
//# sourceMappingURL=test.js.map