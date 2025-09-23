import { writeFileSync } from "fs"
import { join } from "path"
import {
    builtinFeatures,
    deserializeLanguages,
    lioncoreBuiltins,
    metaFeatures,
    serializeLanguages
} from "@lionweb/core"
import { defaultTrumpfOriginatingApache2_0LicensedHeader, generateLanguage } from "@lionweb/class-core-generator"
import { LionWebId, LionWebJsonChunk, LionWebJsonNode, LionWebJsonProperty, LionWebKey } from "@lionweb/json"
import { languageAsText, readFileAsJson, writeJsonAsFile } from "@lionweb/utilities"


/*
 * artifacts/csharp/shapes_2023_1.json is a copy of this file:
 *
 *  https://github.com/LionWeb-io/lionweb-csharp/blob/main/test/LionWeb.Core.Test/Languages/defChunks/shapes_2023_1.json
 *
 * This script is run as follows:
 *
 *  $ npm run build && node dist/generate-shapes-language-from-csharp.js
 *
 * It checks the following in this JSON:
 *
 *  - whether IDs and keys are unique across all nodes;
 *  - whether the key and ID of a node are aligned.
 *
 * Then, serialized reference targets are fixed as follows:
 *
 *  - if reference is null and resolveInfo equals "LionWeb.LionCore_builtins.<X>",
 *      then resolveInfo -> <X> and reference -> "LionCore-builtins-<X>"
 *
 * Finally, the fixed JSON is persisted, deserialized, and the resulting language is textualized.
 */

const csharpPath = "artifacts/csharp"

const shapesJson = readFileAsJson(join(csharpPath, "shapes_2023_1.json")) as LionWebJsonChunk


const lookUpPropertyValueByKey = (node: LionWebJsonNode, key: LionWebKey): string | null =>
    node.properties.reduce((result: (string | null), current: LionWebJsonProperty) =>
        result ?? (current.property.key === key ? current.value : null),
        null
    )

const ids: LionWebId[] = []
const keys: LionWebKey[] = []

const checkNode = (node: LionWebJsonNode) => {
    const id = node.id
    if (ids.indexOf(id) > -1) {
        console.log(`ID ${id} not unique!`)
    }
    ids.push(id)
    const key = lookUpPropertyValueByKey(node, metaFeatures.ikeyed_key.key)
    if (key === null) {
        console.log(`node with ID ${id} has no key!`)
    } else {
        if (keys.indexOf(key) > -1) {
            console.log(`key ${key} not unique!`)
        }
        keys.push(key)
    }
    const name = lookUpPropertyValueByKey(node, builtinFeatures.inamed_name.key)
    if (name === null) {
        console.log(`node with ID ${id} has no name`)
    }
    if (!(id === `id-${name}` && key === `key-${name}`)) {
        console.log(`${node.classifier.key}: id=${id}, key=${key}, name=${name} — not aligned with name!`)
    }
}

shapesJson.nodes.forEach(checkNode)


const fixNode = (node: LionWebJsonNode) => {
    // LionWeb.LionCore_builtins.<X> -> LionCore-builtins-<X>, e.g. LionWeb.LionCore_builtins.Integer -> LionCore-builtins-Integer
    const builtinsResolveInfoPrefix = "LionWeb.LionCore_builtins."
    node.references.forEach((reference) => {
        reference.targets.forEach((target) => {
            if (target.reference === null && target.resolveInfo?.startsWith(builtinsResolveInfoPrefix)) {
                const typeName = target.resolveInfo?.substring(builtinsResolveInfoPrefix.length)
                target.resolveInfo = typeName
                target.reference = `LionCore-builtins-${typeName}`
            }
        })
    })
}

shapesJson.nodes.forEach(fixNode)

const shapesLanguage = deserializeLanguages(shapesJson, lioncoreBuiltins)[0]
writeJsonAsFile(join(csharpPath, "shapes_2023_1-fixed.json"), serializeLanguages(shapesLanguage))
writeFileSync(join(csharpPath, "shapes_2023_1.txt"), languageAsText(shapesLanguage))
generateLanguage(shapesLanguage, "../delta-protocol-test/src/gen", { header: defaultTrumpfOriginatingApache2_0LicensedHeader })

