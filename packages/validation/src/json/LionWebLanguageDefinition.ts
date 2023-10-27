import {
    LION_CORE_BUILTINS_INAMED_NAME,
    LionWebJsonMetaPointer,
    LionWebJsonNode,
} from "./LionWebJson";
import { LionWebJsonChunkWrapper } from "./LionWebJsonChunkWrapper";
import { NodeUtils } from "./NodeUtils";

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
//     setLanguage(lionWebLanguage: LionwebLanguageDefinition) {
//         // Assume LwNode is a concept of type "Language"
//         let language = this.languageMap.get(lionWebLanguage.languageId.name);
//         if (language === undefined) {
//             language = new Map<string, Map<string, LionwebLanguageDefinition>>();
//             this.languageMap.set(lionWebLanguage.languageId.name, language);
//         }
//         let version = language.get(lionWebLanguage.languageId.version);
//         if (version === undefined) {
//             version = new Map<string, LionwebLanguageDefinition>();
//             language.set(lionWebLanguage.languageId.version, version);
//         }
//         let key = version.get(lionWebLanguage.languageId.key);
//         if (key === undefined) {
//             version.set(lionWebLanguage.languageId.key, lionWebLanguage);
//         }
//     }
//
//     getLanguage(pointer: LionWebJsonMetaPointer): LionwebLanguageDefinition {
//         return this.languageMap.get(pointer.language)?.get(pointer.version)?.get(pointer.key);
//     }
// }

/**
 * Represents a LionWeb serialiation chunk which represents a language definition / metamodel
 */
export class LionWebLanguageDefinition {
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
        // console.log("CHUNK " + JSON.stringify(chunk))
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
        const nameProp = languageNode.properties.find(prop => prop.property.key === LION_CORE_BUILTINS_INAMED_NAME);
        const versionProp = languageNode.properties.find(prop => prop.property.key === "Language-version");
        const keyProp = languageNode.properties.find(prop => prop.property.key === "IKeyed-key");
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
        const result = this.languageChunkWrapper.jsonChunk.nodes.find(node => {
            const keyProp = NodeUtils.findLwProperty(node, "IKeyed-key");
            // const versionProp = NodeUtils.findLwProperty(node, "Language-version");
            // return ((!!keyProp) && (keyProp.value === metaPointer.key) && (!!versionProp) && (versionProp.value === metaPointer.version));

            // console.log("   getNodeByMetaPointer.looking into " + node.id + " found " + JSON.stringify(keyProp));
            return ((!!keyProp) && (keyProp.value === metaPointer.key) );
        });
        return result;
    }

    getPropertyByKey(key: string) {
        // console.log("get property by key " + key)
        const propertyNode = this.languageChunkWrapper.findNodesOfConcept("Property").find(n => {
            // console.log("   getPropertyByKey.looking into " + n.id);
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
