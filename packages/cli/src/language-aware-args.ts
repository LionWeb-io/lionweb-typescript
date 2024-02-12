export type LanguageAwarePaths = [chunkPaths: string[], languagePaths: string[]]

export const separate = (args: string[]): LanguageAwarePaths => {
    const indexLanguageArg = args.findIndex((arg) => arg === "--language" || arg === "--languages")
    return indexLanguageArg > -1
        ? [args.slice(0, indexLanguageArg), args.slice(indexLanguageArg + 1)]
        : [args, []]
}
