import { isEqualMetaPointer, LionWebJsonNode, LionWebJsonChunk } from "../json/LionWebJson.js"
import { LION_CORE_M3_KEY, MetaPointers } from "../json/M3definitions.js"

import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const LionCore_M3 = require('./LionCore-M3.json');
const LionCore_builtins = require('./LionCore-builtins.json');

export const LionCore_M3_Json = LionCore_M3 as LionWebJsonChunk
export const LionCore_builtins_Json = LionCore_builtins as LionWebJsonChunk

export function isLionCoreLanguage(node: LionWebJsonNode) {
    return node.classifier.language === LION_CORE_M3_KEY && node.classifier.version === "2023.1"
}

/**
 * Does _node_ represent a language concept?
 * @param node
 */
export const isConcept = (node: LionWebJsonNode): boolean => {
    return isEqualMetaPointer(node.classifier, MetaPointers.Concept)
}

/**
 * Does _node_ represent a language annotation?
 * @param node
 */
export const isAnnotation = (node: LionWebJsonNode): boolean => {
    return isEqualMetaPointer(node.classifier, MetaPointers.Annotation)
}

/**
 * Does _node_ represent a language interface?
 * @param node
 */
export const isInterface = (node: LionWebJsonNode): boolean => {
    return isEqualMetaPointer(node.classifier, MetaPointers.Interface)
}

/**
 * Does _node_ represent a language property?
 * @param node
 */
export const isProperty = (node: LionWebJsonNode): boolean => {
    return isEqualMetaPointer(node.classifier, MetaPointers.Property)
}

/**
 * Does _node_ represent a language containment?
 * @param node
 */
export const isContainment = (node: LionWebJsonNode): boolean => {
    return isEqualMetaPointer(node.classifier, MetaPointers.Containment)
}

/**
 * Does _node_ represent a language reference?
 * @param node
 */
export const isReference = (node: LionWebJsonNode): boolean => {
    return isEqualMetaPointer(node.classifier, MetaPointers.Reference)
}
