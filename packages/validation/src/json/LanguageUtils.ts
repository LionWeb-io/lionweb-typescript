import { Annotation, Classifier, Concept, Interface, isRef } from "@lionweb/core";
import { LION_CORE_BUILTINS_INAMED_NAME, LION_CORE_M3_KEY, LionWebJsonChunk, LionWebJsonNode } from "./LionWebJson";
import { LionWebJsonChunkWrapper } from "./LionWebJsonChunkWrapper";

/**
 * Contains methods for getting information from a LionWebJsonChunk representing a language.
 */
export class LanguageWrapper extends LionWebJsonChunkWrapper {
   
    constructor(languageJson: LionWebJsonChunk) {
        super(languageJson);
    }
    
    inheritsFrom = (classifier: LionWebJsonNode): LionWebJsonNode[] => {
        if (isConcept(classifier) || isAnnotation(classifier)) {
            // find the language (have key and version)
            // find concept or annotation
            // find extends/inherits property 
            return [
                ...(
                    isRef(classifier.extends)
                        ? [classifier.extends as Concept]
                        : []
                ),
                ...classifier.implements
            ]
        }
        if (isInterface(classifier)) {
            return classifier.extends
        }
        throw new Error(`concept type ${typeof classifier} not handled`)
    }
}


function isLionCoreLanguage(node: LionWebJsonNode) {
    return node.classifier.language === LION_CORE_M3_KEY
        && node.classifier.version === "2023.1";
}

const isConcept = (node: LionWebJsonNode): boolean => {
    return isLionCoreLanguage(node)
        && node.classifier.key === "Concept";
}

const isAnnotation = (node: LionWebJsonNode): boolean => {
    return isLionCoreLanguage(node)
        && node.classifier.key === "Annotation";
}

const isInterface = (node: LionWebJsonNode): boolean => {
    return isLionCoreLanguage(node)
        && node.classifier.key === "Interface";
}
