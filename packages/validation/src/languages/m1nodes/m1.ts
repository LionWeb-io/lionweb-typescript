import { LionWebId, LionWebJsonMetaPointer } from "../../json/index.js"
import { M3Annotation, M3Classifier, M3Concept, M3Containment, M3Interface, M3Property, M3Reference } from "../m3classes/index.js"

export type ClassifierDef = M3Classifier | LionWebJsonMetaPointer | null
export type ConceptDef = M3Concept | LionWebJsonMetaPointer | null
export type AnnotationDef = M3Annotation | LionWebJsonMetaPointer | null
export type InterfaceDef = M3Interface | LionWebJsonMetaPointer | null
export type PropertyDef = M3Property | LionWebJsonMetaPointer | null
export type ReferenceDef = M3Reference | LionWebJsonMetaPointer | null
export type ContainmentDef = M3Containment | LionWebJsonMetaPointer | null
export type Feature = Property | Reference | Containment

export class Property {
    property: PropertyDef = null
    value: string | null = null
}

export class Reference {
    reference: ReferenceDef = null
    targets: ReferenceTarget[] = []
}

export class ReferenceTarget {
    resolveInfo: string | null
    reference: Node | null
    
    constructor(resolveInfo: string | null, reference: Node | null) {
        // Might want to check that at bleast one is not null
        this.resolveInfo = resolveInfo
        this.reference = reference
    }
}

export class Containment {
    containment: ContainmentDef = null
    children: Child[] = []
}

export type Child = Node | LionWebId

export class Node {
    id: LionWebId
    classifier: ClassifierDef
    annotations: Node[] = []
    parent?: Node

    properties: Property[] = []
    references: Reference[] = []
    containments: Containment[] = []
    get features(): Feature[] {
        return [...this.properties, ...this.references, ...this.containments]
    }

    constructor(id: LionWebId, classifier: ClassifierDef) {
        this.id = id
        this.classifier = classifier
    }
}

export class UsedLanguage {
    key: string
    version: string
    
    constructor(key: string, version: string) {
        this.key = key
        this.version = version
    }
}

export class Chunk {
    serializationFormatVersion: string
    usedLanguages: UsedLanguage[] = []
    nodes: Node[] = []
    
    constructor(serializationFormatVersion: string) {
        this.serializationFormatVersion = serializationFormatVersion
    }
}




