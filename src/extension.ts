// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { INodeInfo } from './types';
import { astToTree, buildVariableHierarchy, getAst } from './utils';

// This method is called when your extension is activated
// 插件激活时执行的函数
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "variable-finding" is now active!',
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    'variable-finding.mytest',
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      // vscode.window.showInformationMessage(
      //   'Hello VS Code!',
      // );

      // 获取当前激活的文本编辑器
      let editor = vscode.window.activeTextEditor;
      let targetFileExtension = {
        'js': 'jsx',
        'jsx': 'jsx',
        'ts': 'typescript',
        'tsx': 'typescript'
      } as { [key: string]: string };

      if(editor){
        let uri = editor.document.uri; // 获取当前打开文件的uri
        let filePath = uri.fsPath; // 当前文件的路径
        let fileName = filePath.split('\\').reverse()[0]; // 当前文件的文件名
        let extension: string | undefined = fileName.indexOf('.') !== -1 ? fileName.split('.').pop() : '';
        // 只有符合的文件才会被进一步处理
        if (extension && Object.keys(targetFileExtension).includes(extension)){
          // 解析文件
          let document = editor.document;
          let text = document.getText(); // 获取当前文件的文本内容
          let ast = getAst(text, targetFileExtension[extension]); // 解析得到的ast

          let variableHierarchy: any[] = [];
          if(ast){
            let rootNodes = ast.program.body;
            rootNodes.forEach(rootNode => {
              let tree = buildVariableHierarchy(rootNode, null, []);
              variableHierarchy.push(...tree);
            });
          }
        } else {
          console.log('不需要解析');
        }


        vscode.window.showInformationMessage('current file: ' + fileName); 
      } else {
        vscode.window.showInformationMessage('No file');
        return;
      }
      
    },
  );

  context.subscriptions.push(disposable);
}

// 插件被销毁时调用的方法
export function deactivate() {}
