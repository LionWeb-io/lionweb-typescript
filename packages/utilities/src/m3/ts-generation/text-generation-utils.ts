import {indentWith, NestedString} from "littoral-templates"


export const indent = indentWith("    ")(1)


/**
 * Include the given `result` only when the `expr` is `true`.
 */
export const cond = (expr: boolean, result: NestedString) =>
    expr ? [result] : []

