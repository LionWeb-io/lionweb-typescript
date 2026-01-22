import { deserializeLanguages, lioncoreBuiltinsFacade, metaFeatures, serializeLanguages } from "@lionweb/core"
import { defaultTrumpfOriginatingApache2_0LicensedHeader, generateLanguage } from "@lionweb/class-core-generator"
import { LionWebId, LionWebJsonChunk, LionWebJsonNode, LionWebJsonProperty, LionWebKey } from "@lionweb/json"
import { languageAsText, readFileAsJson, writeJsonAsFile } from "@lionweb/utilities"
import { writeFileSync } from "fs"
import { join } from "path"


/*
 * artifacts/csharp/shapes_2023_1.json is a copy of this file:
 *
 *  https://raw.githubusercontent.com/LionWeb-io/lionweb-csharp/refs/heads/main/test/LionWeb.Core.Test/Languages/defChunks/shapes_2023_1.json
 *
 * This script is ran as follows:
 *
 *  $ npm run build && node dist/generate-shapes-language-from-csharp.js
 *
 * It checks the following in this JSON:
 *
 *  - whether IDs and keys are unique across all nodes;
 *  - whether the key and ID of a node are aligned: id="id-<name>" and key="key-<name>".
 *
 * Then, serialized reference targets are fixed – if necessary – as follows:
 *
 *  - if reference is null and resolveInfo equals "LionWeb.LionCore_builtins.<X>",
 *      then resolveInfo -> <X> and reference -> "LionCore-builtins-<X>"
 *
 * Note that this is *only* applies to LionWeb version 2023.1 — for later versions the “unfixed” reference and resolveInfo are correct.
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

let misalignedKeysOrIds = false
const checkNode = (node: LionWebJsonNode) => {
    const id = node.id
    if (ids.indexOf(id) > -1) {
        console.error(`ID ${id} not unique!`)
    }
    ids.push(id)
    const key = lookUpPropertyValueByKey(node, metaFeatures.ikeyed_key.key)
    if (key === null) {
        console.error(`Node with ID ${id} has no key!`)
    } else {
        if (keys.indexOf(key) > -1) {
            console.error(`Key ${key} of node with ID ${id} is not unique!`)
        }
        keys.push(key)
    }
    const name = lookUpPropertyValueByKey(node, lioncoreBuiltinsFacade.features.inamed_name.key)
    if (name === null) {
        console.error(`Node with ID ${id} has no name`)
    }
    if (!(id === `id-${name}` && key === `key-${name}`)) {
        console.log(`${node.classifier.key}: id=${id}, key=${key}, name=${name} — not aligned with name.`)
        misalignedKeysOrIds = true
    }
}

console.log(`**checking nodes**`)
shapesJson.nodes.forEach(checkNode)
console.log()


let fixedReferences = false
const fixNode = (node: LionWebJsonNode) => {
    // LionWeb.LionCore_builtins.<X> -> LionCore-builtins-<X>, e.g. LionWeb.LionCore_builtins.Integer -> LionCore-builtins-Integer
    const builtinsResolveInfoPrefix = "LionWeb.LionCore_builtins."
    node.references.forEach((reference) => {
        reference.targets.forEach((target, index) => {
            if (target.reference === null) {
                if (target.resolveInfo === null) {
                    console.error(`both reference ID and resolveInfo are null on target #${index + 1} of "${reference.reference.key}" reference of node with ID="${node.id}" and of "${node.classifier.key}" concept`)
                } else if (target.resolveInfo.startsWith(builtinsResolveInfoPrefix)) {
                    const originalResolveInfo = target.resolveInfo
                    const typeName = originalResolveInfo.substring(builtinsResolveInfoPrefix.length)
                    target.resolveInfo = typeName
                    target.reference = `LionCore-builtins-${typeName}`
                    console.log(`For target #${index + 1} of "${reference.reference.key}" reference of node of "${node.classifier.key}" concept: set 'reference' -> "${target.reference}", and fixed 'resolveInfo': ${originalResolveInfo} -> ${target.resolveInfo}`)
                    fixedReferences = true
                }
            }
        })
    })
}

console.log(`**fixing nodes**`)
shapesJson.nodes.forEach(fixNode)
if (!fixedReferences) {
    console.log(`Didn’t need to fix any reference (target)!`)
}

if (!misalignedKeysOrIds && !fixedReferences) {
    console.log(`\nDidn’t need to fix anything — might fixing the JSON not be necessary anymore?`)
}

const shapesLanguage = deserializeLanguages(shapesJson, lioncoreBuiltinsFacade.language)[0]
writeJsonAsFile(join(csharpPath, "shapes_2023_1-fixed.json"), serializeLanguages(shapesLanguage))
writeFileSync(join(csharpPath, "shapes_2023_1.txt"), languageAsText(shapesLanguage))
generateLanguage(shapesLanguage, "../delta-protocol-test/src/gen", { header: defaultTrumpfOriginatingApache2_0LicensedHeader })

