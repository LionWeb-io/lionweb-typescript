import { build, emptyDir } from "https://deno.land/x/dnt/mod.ts";

await emptyDir("./npm");

await build({
    entryPoints: ["./src/m3/types.ts"],
    outDir: "./npm",
    shims: {
        // see JS docs for overview and more options
        deno: true,
    },
    package: {
        // package.json properties
        name: "lioncore",
        version: Deno.args[0],
        description: "LIonWeb Core for TypeScript.",
        license: "MIT",
        repository: {
            type: "git",
            url: "https://github.com/LIonWeb-org/lioncore-typescript.git",
        },
        bugs: {
            url: "https://github.com/LIonWeb-org/lioncore-typescript/issues",
        },
    },
    mappings: {
        "https://esm.sh/v106/ajv@8.12.0": {
            name: "ajv",
            version: "^8.12.0",
        },
        "https://esm.sh/v106/ajv-formats@2.1.0": {
            name: "ajv-formats",
            version: "^2.1.0",
        },
    },
});

// post build steps
Deno.copyFileSync("LICENSE", "npm/LICENSE");
Deno.copyFileSync("README.md", "npm/README.md");
