/**
 * @return a “stringification” of the values of the given `keys` of the given `object`, in the following format:
 * `key1=value1, key2=value2`, etc.
 * (Usage is primarily intended for verbosity/debugging.)
 *
 * @param object A object having properties.
 * @param keys The keys of the properties to stringify (variadic argument).
 */
export const stringifyPropertiesOf = <T>(object: T, ...keys: (keyof T)[]) =>
    keys.filter((key) => object[key] !== undefined)
        .map((key) => `${key.toString()}=${object[key]}`)
        .join(", ")

