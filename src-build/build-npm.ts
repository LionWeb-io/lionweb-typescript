import {build} from "https://deno.land/x/dnt@0.38.1/mod.ts"

await Deno.remove("npm", { recursive: true }).catch((_) => {})

const currentVersion = (await Deno.readTextFile("src-build/current-version.txt")).trim()

await build({
    entryPoints: ["./src/mod.ts"],
    outDir: "./npm",
    scriptModule: false,    // when true (=default), testing errors out
    shims: {
        // see JS docs for overview and more options:
        deno: true,
    },
    test: false,
    package: {
        // package.json properties:
        name: "lioncore-typescript",
        version: currentVersion,
        description: "LIonWeb core for {Java|Type}Script",
        license: "MIT",
        repository: {
            type: "git",
            url: "https://github.com/LIonWeb-org/lioncore-typescript.git",
        },
        bugs: {
            url: "https://github.com/LIonWeb-org/lioncore-typescript/issues",
        },
    }
})

Deno.copyFileSync("LICENSE", "npm/LICENSE")
Deno.copyFileSync("README.md", "npm/README.md")

