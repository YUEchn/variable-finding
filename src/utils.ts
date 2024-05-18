import { parse } from '@babel/parser';
import traverse, { Node } from '@babel/traverse';
import { TreeNode } from './treeNode';
import { INodeInfo } from './types';

// 将文本解析为ast
export function getAst(text: string, plugin: string) {
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
        plugins: [plugin],
      });
    } catch (error) {
      console.error('Error parsing using sourceType "script":', error);
    }
  }

  return ast;
}

// 将ast转化为层次结构树
export function astToTree(ast: any): TreeNode {
  const rootNode = new TreeNode('ast.type');

  if (ast.children && ast.children.length > 0) {
    for (const child of ast.children) {
      const childNode = astToTree(child);
      rootNode.addChild(childNode);
    }
  }
  return rootNode;
}

export function buildVariableHierarchy(
  node: Node,
  parentFunction: string | null | undefined,
  variableHierarchy: INodeInfo[],
) {
  if (node.type === 'VariableDeclaration') {
    console.log('进入了');

    node.declarations.forEach((declaration: any) => {
      // Add the variable to the hierarchy under the current function
      if (parentFunction) {
        // Find the parent function in the hierarchy
        //@ts-ignore
        const parentFunctionNode = variableHierarchy.find(
          (item: any) => item.name === parentFunction,
        );
        // If the parent function node exists, add the variable as its child
        if (parentFunctionNode) {
          parentFunctionNode.children.push({
            name: declaration.id.name,
            type: 'variable',
            children: [],
          });
        }
      } else {
        // If there's no parent function, add the variable to the top level
        //@ts-ignore
        variableHierarchy.push({
          name: declaration.id.name,
          type: 'variable',
          children: [],
        });
      }
    });
  }

  if (node.type === 'FunctionDeclaration') {
    const functionName = node.id?.name;
    const functionNode = {
      name: functionName,
      type: 'function',
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
        (item: any) => item.name === parentFunction,
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
}

export function getWebviewContent(data: any) {
  // Return the HTML content to be displayed in the webview
  return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Tree Chart</title>
          <!-- Include ECharts library -->
          <script src="https://cdn.jsdelivr.net/npm/echarts/dist/echarts.min.js"></script>
      </head>
      <body>
          <div id="chart" style="width: 600px; height: 400px;"></div>
          <script>
              // Initialize ECharts instance
              var myChart = echarts.init(document.getElementById('chart'));

              // Specify chart configuration and data
              var option = {
                  title: {
                      text: 'Tree Chart Example'
                  },
                  tooltip: {},
                  series: [{
                      type: 'tree',

                      // 树状图的数据
                      data: ${JSON.stringify(data)}, // 这样写才生效
                    //   data: [{
                    //     name: 'AA',
                    //     children: [{
                    //         name: 'B',
                    //         children: [{
                    //             name: 'C'
                    //         }, {
                    //             name: 'D'
                    //         }]
                    //     }]
                    // }],

                      // 树状图的布局方式
                      orient: 'vertical',

                      // 树状图的配置
                      symbol: 'emptyCircle',
                      symbolSize: 7,

                      // 树状图节点的标签设置
                      label: {
                          normal: {
                              position: 'top',
                              verticalAlign: 'middle',
                              align: 'right'
                          }
                      }
                  }]
              };

              // Use the specified configuration and data to display the chart
              myChart.setOption(option);
          </script>
      </body>
      </html>
  `;
}
