import type { Plugin } from "vite";
interface Options {
    creds: string;
}
declare const _default: (options: Options) => Promise<Plugin>;
export default _default;
