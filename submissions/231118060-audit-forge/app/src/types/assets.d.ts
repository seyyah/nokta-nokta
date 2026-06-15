declare const require: (path: string) => number;

declare module "*.glb" {
  const asset: number;
  export default asset;
}
