import {path} from "../deps.ts"


/**
 * @return a path of the directory that a local file resides in.
 * Usage: `__dirname(import.meta)`.
 */
export const __dirname = (import_: ImportMeta) => path.dirname(path.fromFileUrl(import_.url))

