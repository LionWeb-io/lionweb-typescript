import { LionWebJsonMetaPointer, LionWebJsonNode } from "@lionweb/json"
import { MetaPointers } from "../json/M3definitions.js"
import { NodeUtils } from "../json/NodeUtils.js"

export class MetaPointerMap {
    /**
     * Map from languageKey => languageVersion => key => LionWebJsonNode
     */
    map: Map<string, Map<string, Map<string, LionWebJsonNode>>> = new Map<string, Map<string, Map<string, LionWebJsonNode>>>()

    add(languageKey: string, languageVersion: string, node: LionWebJsonNode): void {
        const keyProperty = NodeUtils.findProperty(node, MetaPointers.IKeyedKey)
        if (keyProperty === undefined) {
            console.log("MetaPointerMap.add: trying to add node without key property.")
            return
        }
        const key = keyProperty.value
        if (key === undefined || key == null || key === "") {
            console.log("MetaPointerMap.add: trying to add node without key property being empty or null.")
            return
        }
        this.set({ language: languageKey, version: languageVersion, key: key }, node)
    }

    set(mp: LionWebJsonMetaPointer, node: LionWebJsonNode): void {
        let language = this.map.get(mp.language)
        if (language === undefined) {
            language = new Map<string, Map<string, LionWebJsonNode>>()
            this.map.set(mp.language, language)
        }
        let version = language.get(mp.version)
        if (version === undefined) {
            version = new Map<string, LionWebJsonNode>()
            language.set(mp.version, version)
        }
        version.set(mp.key, node)
    }

    get(mp: LionWebJsonMetaPointer): LionWebJsonNode | undefined {
        return this.map.get(mp.language)?.get(mp.version)?.get(mp.key)
    }
}
