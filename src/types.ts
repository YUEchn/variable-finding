export interface INodeInfo {
  name: string | undefined;
  type: string;
  children: INodeInfo[];
}
