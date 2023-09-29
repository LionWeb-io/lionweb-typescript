import {
    LION_CORE_BUILTINS_INAMED_NAME,
    LionWebJsonChunk,
    LionWebJsonMetaPointer,
    LionWebJsonNode,
} from "./LionWebJson";
import { LionWebJsonChunkWrapper } from "./LionWebJsonChunkWrapper";
import { NodeUtils } from "./NodeUtils";
import LionCore_M3 from "./std-builtins-copy.json";

type NodeMap = Map<string, Map<string, Map<string, LionWebJsonNode>>>;
type LanguageId = {
    name?: string;
    version?: string;
    key?: string;
};

export const LIONWEB_M3_PROPERTY_KEY = "Property";
export const LIONWEB_M3_CONCEPT_KEY = "Concept";
export const LIONWEB_M3_REFERENCE_KEY = "Reference";
export const LIONWEB_M3_PROPERTY_TYPE_KEY = "Property-type";
/**
 * Collection of language definitions
 */
// export class LionwebLanguages {
//     // The builtin language of LionWeb.
//     static M3 = LionCore_M3 as LionWebJsonChunk;
//
//     languageMap = new Map<string, Map<string, Map<string, LionwebLanguageDefinition>>>();
//
//     setLanguage(lionwebLanguage: LionwebLanguageDefinition) {
//         // Assume LwNode is a concept of type "Language"
//         let language = this.languageMap.get(lionwebLanguage.languageId.name);
//         if (language === undefined) {
//             language = new Map<string, Map<string, LionwebLanguageDefinition>>();
//             this.languageMap.set(lionwebLanguage.languageId.name, language);
//         }
//         let version = language.get(lionwebLanguage.languageId.version);
//         if (version === undefined) {
//             version = new Map<string, LionwebLanguageDefinition>();
//             language.set(lionwebLanguage.languageId.version, version);
//         }
//         let key = version.get(lionwebLanguage.languageId.key);
//         if (key === undefined) {
//             version.set(lionwebLanguage.languageId.key, lionwebLanguage);
//         }
//     }
//
//     getLanguage(pointer: LionWebJsonMetaPointer): LionwebLanguageDefinition {
//         return this.languageMap.get(pointer.language)?.get(pointer.version)?.get(pointer.key);
//     }
// }

/**
 * Represents a lionweb chunk which represents a language definition / metamodel
 */
export class LionwebLanguageDefinition {
    languageId: LanguageId | null = null;
    /**
     * All nodes in the language
     */
    nodeKeymap = new Map<string, LionWebJsonNode>();
    languageChunkWrapper: LionWebJsonChunkWrapper;

    /**
     * Assume chunk represents a language metamodel according to Lionweb M3.
     * @param chunk
     */
    constructor(chunk: LionWebJsonChunkWrapper) {
        const languageNodes = chunk.findNodesOfConcept("Language");
        if (languageNodes.length !== 1) {
            // TODO Better error handling.
            console.error("1 Expected exactly one Language node, found " + languageNodes.length + " => " + JSON.stringify(languageNodes));
        } else {
            const languageNode = languageNodes[0];
            this.setLanguage(languageNode);
        }
        this.languageChunkWrapper = chunk;

    }

    protected setLanguage(languageNode: LionWebJsonNode) {
        // Assume LwNode is a concept of type "Language"
        let nameProp = languageNode.properties.find(prop => prop.property.key === LION_CORE_BUILTINS_INAMED_NAME);
        let versionProp = languageNode.properties.find(prop => prop.property.key === "Language-version");
        let keyProp = languageNode.properties.find(prop => prop.property.key === "IKeyed-key");
        this.languageId = {
            name: nameProp?.value,
            version: versionProp?.value,
            key: keyProp?.value
        }
    }

    /**
     * Store the node `node` under `key`.
     * @param key
     * @param node
     */
    setNodeByKey(key: string, node: LionWebJsonNode): void {
        this.nodeKeymap.set(key, node);
    }

    getNodeByKey(key: string): LionWebJsonNode | undefined {
        return this.nodeKeymap.get(key);
    }

    getNodeByMetaPointer(metaPointer: LionWebJsonMetaPointer): LionWebJsonNode | undefined {
        // console.log("get metapointer " + JSON.stringify(metaPointer))
        const result = this.languageChunkWrapper.jsonChunk.nodes.find(n => {
            // console.log("   looking into " + JSON.stringify(n));
            const keyProp = NodeUtils.findLwProperty(n, "IKeyed-key");
            // const versionProp = NodeUtils.findLwProperty(n, "Language-version");

            // return ((!!keyProp) && (keyProp.value === metaPointer.key) && (!!versionProp) && (versionProp.value === metaPointer.version));
            return ((!!keyProp) && (keyProp.value === metaPointer.key) && (keyProp.property.version === metaPointer.version));
        });
        return result;
    }

    getPropertyByKey(key: string) {
        // console.log("get property by key " + key)
        const propertyNode = this.languageChunkWrapper.findNodesOfConcept("Property").find(n => {
            // console.log("   looking into " + JSON.stringify(n));
            const keyProp = (n as LionWebJsonNode).properties.find(prop => {
                return prop.property.key === "IKeyed-key" && prop.value === key;
            });
            return keyProp;
        });
        return propertyNode;
    }

    getConceptByKey(key: string) {
        // console.log("get property by key " + key)
        const conceptNode = this.languageChunkWrapper.findNodesOfConcept("Concept").find(n => {
            // console.log("   looking into " + JSON.stringify(n));
            const keyProp = (n as LionWebJsonNode).properties.find(prop => {
                return prop.property.key === "IKeyed-key" && prop.value === key;
            });
            return keyProp;
        });
        return conceptNode;
    }
}
