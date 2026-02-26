import { Classifier, Concept } from "./types.js"
import { LionWebVersion } from "./version.js"
import { LionWebVersions } from "./versions.js"

/**
 * @return whether the given {@link Classifier} is the built-in `Node` {@link Concept}
 * of *any* version of the LionCore builtins language,
 * or of the version belonging to the designated {@link LionWebVersion}.
 */
export const isBuiltinNodeConcept = (classifier: Classifier, lionWebVersion?: LionWebVersion): boolean => {
    const { builtinsFacade } = lionWebVersion ?? LionWebVersions.v2023_1
    return classifier instanceof Concept
        && (classifier as Concept).abstract
        && classifier.language.key === builtinsFacade.language.key
        && (lionWebVersion === undefined || classifier.language.version === builtinsFacade.language.version)
        && classifier.key === builtinsFacade.classifiers.node.key
}

/*
 * NOTE: this function has to be defined in a separate file to avoid circular loading dependencies!
 */

