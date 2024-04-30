import { parse} from '@babel/parser';
import { TreeNode } from './treeNode';

// 将文本解析为ast
export function getAst(text: string, plugin: string){
  let ast = null;
  try {
    ast = parse(text, {
      sourceType: 'module',
      //@ts-ignore
      plugins: [plugin]
    })
  } catch (error) {
    console.error('Error parsing using sourceType "module":', error);
    try {
      ast = parse(text, {
        sourceType: 'script',
        //@ts-ignore
        plugins: [plugin]
      })
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