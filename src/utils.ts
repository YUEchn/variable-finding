import { parse} from '@babel/parser';
import traverse, { Node } from "@babel/traverse";
import { TreeNode } from './treeNode';
import { INodeInfo } from './types';

// 将文本解析为ast
export function getAst(text: string, plugin: string){
  let ast = null;
  try {
    ast = parse(text, {
      sourceType: 'module',
      //@ts-ignore
      // plugins: [plugin]
    });
  } catch (error) {
    console.error('Error parsing using sourceType "module":', error);
    try {
      ast = parse(text, {
        sourceType: 'script',
        //@ts-ignore
        plugins: [plugin]
      });
    } catch (error){
      console.error('Error parsing using sourceType "script":', error);
    } 
  }
  
  return ast;
}


// 将ast转化为层次结构树
export function astToTree(ast: any): TreeNode{
    const rootNode = new TreeNode('ast.type');

    if(ast.children && ast.children.length > 0){
        for (const child of ast.children){
            const childNode = astToTree(child);
            rootNode.addChild(childNode);
        }
    }
    return rootNode;
}


export function buildVariableHierarchy (node: Node, parentFunction: string | null| undefined, variableHierarchy: INodeInfo[]){
  if (node.type === "VariableDeclaration") {
    console.log('进入了');
    
    node.declarations.forEach((declaration: any) => {
      // Add the variable to the hierarchy under the current function
      if (parentFunction) {
        // Find the parent function in the hierarchy
        //@ts-ignore
        const parentFunctionNode = variableHierarchy.find(
          (item: any) => item.name === parentFunction
        );
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
        //@ts-ignore
        variableHierarchy.push({
          name: declaration.id.name,
          type: "variable",
          children: [],
        });
      }
    });
  }

  if (node.type === "FunctionDeclaration") {
    const functionName = node.id?.name;
    const functionNode = {
      name: functionName,
      type: "function",
      children: [],
    };

    // Add the function to the hierarchy
    if (!parentFunction) {
      //@ts-ignore
      variableHierarchy.push(functionNode);
    } else {
      // Find the parent function in the hierarchy
        //@ts-ignore
      const parentFunctionNode = variableHierarchy.find(
        (item: any) => item.name === parentFunction
      );
      // If the parent function node exists, add the current function as its child
      if (parentFunctionNode) {
        parentFunctionNode.children.push(functionNode);
      }
    }
    
    let nodes = node.body.body;
    //@ts-ignore
    nodes.forEach(n => {
      //@ts-ignore
      buildVariableHierarchy(n, functionName, variableHierarchy);
    });


  }

  // if (node.type === "BlockStatement") {
  //   // Recursively traverse child nodes in block statements
  //   node.body.forEach((childNode: Node) => {
  //     buildVariableHierarchy(childNode, parentFunction, variableHierarchy);
  //   });
  // }
  return variableHierarchy;
};