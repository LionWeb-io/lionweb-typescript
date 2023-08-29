const asPrettyString = (json: unknown): string =>
    JSON.stringify(json, null, 2)


export const writeJsonAsFile = (path: string, json: unknown): Promise<void> =>
    Deno.writeTextFile(path, asPrettyString(json))


export const readFileAsJson = async (path: string): Promise<unknown> =>
    JSON.parse(await Deno.readTextFile(path))

