import { build, emptyDir } from "https://deno.land/x/dnt/mod.ts";
import { copy } from "https://deno.land/std@0.177.0/fs/mod.ts";

// Copy test data
await Deno.remove("npm", { recursive: true }).catch((_) => {});
await emptyDir("./npm/esm/src-test/m3");
await emptyDir("./npm/script/src-test/m3");
await emptyDir("./npm/esm/src-test/m3/ecore");
await emptyDir("./npm/script/src-test/m3/ecore");

await copy("diagrams", "npm/esm/diagrams", { overwrite: true });
await copy("diagrams", "npm/script/diagrams", { overwrite: true });
await copy("models", "npm/esm/models", { overwrite: true });
await copy("models", "npm/script/models", { overwrite: true });
await copy("schemas", "npm/esm/schemas", { overwrite: true });
await copy("schemas", "npm/script/schemas", { overwrite: true });
await copy("src-test/m3/ecore/library.ecore", "npm/esm/src-test/m3/ecore/library.ecore", { overwrite: true });
await copy("src-test/m3/ecore/library.ecore", "npm/script/src-test/m3/ecore/library.ecore", { overwrite: true });
await copy("src-test/m3/json.schema.json", "npm/esm/src-test/m3/json.schema.json", { overwrite: true });
await copy("src-test/m3/json.schema.json", "npm/script/src-test/m3/json.schema.json", { overwrite: true });

await build({
    entryPoints: ["./src/mod.ts"],
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
