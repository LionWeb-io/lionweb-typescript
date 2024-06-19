import {BaseNode} from "./base.js"
import {
    Classifier, Containment,
    Enumeration,
    EnumerationLiteral,
    ExtractionFacade,
    Feature,
    Id,
    Language,
    Property
} from "@lionweb/core"


export class SimpleNode implements BaseNode {
    public properties: Record<string, unknown> = {}
    public containments: Record<string, SimpleNode[]> = {}
    public annotations: BaseNode[] = []

    constructor(public readonly id: Id, public readonly classifier: string) {
    }
}


export class SimpleNodeReader implements ExtractionFacade<SimpleNode> {

    constructor(public readonly knownLanguages: Language[] = []) {
    }

    classifierOf(node: SimpleNode): Classifier {
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

    getFeatureValue(node: SimpleNode, feature: Feature): unknown {
        if (feature instanceof Property) {
            const value = node.properties[feature.name]
            return value
        }
        if (feature instanceof Containment) {
            const value = node.containments[feature.name]
            return feature.multiple
                ? (
                    value === undefined
                        ? []
                        : value as SimpleNode[]
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
