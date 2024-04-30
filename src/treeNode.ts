export class TreeNode{
    constructor(public value: any){
        this.children = [];
    }

    children: TreeNode[];

    addChild(node: TreeNode){
        this.children.push(node);
    }
}