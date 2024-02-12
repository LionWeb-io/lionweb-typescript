export type LanguageAwarePaths = {
    chunkPaths: string[]
    languagePaths: string[]
}

export const separate = (args: string[]): LanguageAwarePaths => {
    const indexLanguageArg = args.findIndex((arg) => arg === "--language" || arg === "--languages")
    return indexLanguageArg > -1
        ? { chunkPaths: args.slice(0, indexLanguageArg), languagePaths: args.slice(indexLanguageArg + 1) }
        : { chunkPaths: args, languagePaths: [] }
}

