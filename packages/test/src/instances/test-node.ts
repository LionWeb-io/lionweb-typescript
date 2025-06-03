import {
    Classifier,
    Containment,
    Enumeration,
    EnumerationLiteral,
    ExtractionFacade,
    Feature,
    Language,
    Link,
    Property,
    Reference,
    unresolved
} from "@lionweb/core"
import { LionWebId } from "@lionweb/json"
import { BaseNode } from "./base.js"


/**
 * Simplistic implementation of {@link BaseNode} that's a little bit more convenient than {@link DynamicNode}.
 */
export class TestNode implements BaseNode {
    public readonly properties: Record<string, unknown> = {}
    public readonly containments: Record<string, (BaseNode | typeof unresolved)[]> = {}
    public readonly references: Record<string, (BaseNode | typeof unresolved)[]> = {}
    public readonly annotations: BaseNode[] = []

    constructor(public readonly id: LionWebId, public readonly classifier: string) {
    }
}


export class TestNodeReader implements ExtractionFacade<TestNode> {

    constructor(public readonly knownLanguages: Language[] = []) {
    }

    classifierOf(node: TestNode): Classifier {
        const classifier = this.knownLanguages
            .map((language) =>
                language.entities.find(entity => entity instanceof Classifier && entity.name == node.classifier) as Classifier
            )
            .find((c) => c != null)
        if (classifier == null) {
            throw new Error(`Cannot find Classifier with given name ${node.classifier}`)
        }
        return classifier as Classifier
    }

    enumerationLiteralFrom(_encoding: unknown, _enumeration: Enumeration): EnumerationLiteral | null {
        throw new Error("Not supported")
    }

    getFeatureValue(node: TestNode, feature: Feature): unknown {
        if (feature instanceof Property) {
            return node.properties[feature.name]
        }
        if (feature instanceof Link) {
            const value = (() => {
                if (feature instanceof Containment) {
                    return node.containments
                }
                if (feature instanceof Reference) {
                    return node.references
                }
                throw new Error(`Not supported: feature ${feature.name}`)
            })()[feature.name];
            return feature.multiple
                ? (
                    value === undefined
                        ? []
                        : value
                )
                : (
                    (value === undefined || value.length == 0)
                        ? undefined
                        : value[0]
                )
        }
        throw new Error(`Not supported: feature ${feature.name}`)
    }

}
