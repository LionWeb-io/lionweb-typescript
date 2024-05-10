/**
 * TypeScript type definitions for the `LionCore` M3 (=meta-meta) model.
 * A LionWeb language (at the M2 meta level) can be represented as an instance of the {@link M3Language} type.
 */
import { LION_CORE_BUILTINS_KEY, LionWebId, LionWebJsonMetaPointer } from "../../json/index.js"
import { Node } from "../m1nodes/m1.js"
import { allContainmentDefinitions, allPropertyDefinitions, allReferenceDefinitions, allSuperClassifiers, superClassifiers } from "./m3features.js"

/**
 * A type definition for a reference value that can be null.
 */
export type SingleRef<T> = T | null

/**
 * A type alias for a multi-valued reference, to make it look consistent with {@link SingleRef}.
 */
export type MultiRef<T> = T[]

export interface INamed {
    name: string
}

export interface M3IKeyed extends INamed {
    key: LionWebId
}

/**
 * Abstract base class for nodes in an LionCore instance,
 * providing an ID, a key, and the containment hierarchy.
 */
export abstract class M3Node implements M3IKeyed {
    id: LionWebId
    annotations: Node[] = []

    name: string
    key: LionWebId
    parent?: M3Node
    
    protected constructor(id: LionWebId, data?: Partial<M3Node>) {
        this.id = id
        this.name = data?.name ?? ""
        this.key = data?.key ?? ""
        this.parent = data?.parent
    }
}

export abstract class M3Feature extends M3Node {
    optional: boolean

    protected constructor(id: LionWebId, data?: Partial<M3Feature>) {
        super(id, data)
        this.optional = data?.optional ?? false
    }

    get owningClassifier(): M3Classifier {
        return this.parent! as M3Classifier
    }
}

export class M3Property extends M3Feature {
    metaType(): string {
        return "Property"
    }

    constructor(id: LionWebId, data?: Partial<M3Property>) {
        super(id, data)
        this.type = data?.type ?? null
    }

    type: SingleRef<M3Datatype>
    
}

export abstract class M3Link extends M3Feature {
    multiple: boolean
    type: SingleRef<M3Classifier>

    constructor(id: LionWebId, data?: Partial<M3Link>) {
        super(id, data)
        this.multiple = data?.multiple ?? false
        this.type = data?.type ?? null
    }

    isMultiple() {
        this.multiple = true
        return this
    }

    ofType(type: M3Classifier) {
        this.type = type
        return this
    }
}

export class M3Containment extends M3Link {
    metaType(): string {
        return "Containment"
    }

    constructor(id: LionWebId, data?: Partial<M3Containment>) {
        super(id, data)
    }
}

export class M3Reference extends M3Link {
    metaType(): string {
        return "Reference"
    }

    constructor(id: LionWebId, data?: Partial<M3Reference>) {
        super(id, data)
    }
}

export abstract class M3LanguageEntity extends M3Node {
    get language(): M3Language {
        return this.parent! as M3Language
    }
}

export abstract class M3Classifier extends M3LanguageEntity {
    m3properties: M3Property[] = []
    m3containments: M3Containment[] = []
    m3references: M3Reference[] = []
    
    abstract get m3features(): M3Feature[]

    /**
     * Returns all direct super concepts and implemented interfaces of `classifier`
     * @param classifier
     */
    superClassifiers = (): M3Classifier[] => {
        return superClassifiers(this)
    }
    allSuperClassifiers = (): M3Classifier[] => {
        return allSuperClassifiers(this)
    }
    allProperties = (): M3Property[] => {
        return allPropertyDefinitions(this)
    }
    allReferences = (): M3Reference[] => {
        return allReferenceDefinitions(this)
    }
    allContainments = (): M3Containment[] => {
        return allContainmentDefinitions(this)
    }
    
    metaPointer(): LionWebJsonMetaPointer {
        const language = this.language
        return {
            language: language.key,
            version: language.version,
            key: this.key
        }
    }

    toString(): string {
        let result = `Classifier name: ${this.name} key: ${this.key} id: ${this.id}\n`
        if (this.m3properties.length > 0) {
            result += `${this.m3properties.map(p => `    Property ${p.name} (${p.key}): ${p.type?.name}`).join(',\n')}\n`
        }
        if (this.m3containments.length > 0) {
            result += `${this.m3containments.map(c => `    Containment ${c.name} ${c.key}: ${c.type?.name}`).join(',\n')}\n`
        }
        if (this.m3references.length > 0) {
            result += `${this.m3references.map(r => `    Reference ${r.name} ${r.key}`).join(',\n')}`
        }
        return result
    }

}

export class M3Concept extends M3Classifier {
    metaType(): string {
        return "Concept"
    }

    abstract: boolean
    partition: boolean
    extends?: SingleRef<M3Concept> // (reference)
    implements: MultiRef<M3Interface> // (reference)

    public constructor(id: LionWebId,data?: Partial<M3Concept>) {
        super(id, data)
        this.abstract = data?.abstract ?? false
        this.extends = data?.extends
        this.implements = data?.implements || []
        this.partition = data?.partition ?? false
    }

    get m3features(): M3Feature[] {
        return [...this.m3properties, ...this.m3containments, ...this.m3references]
    }

    implementing(...interfaces: M3Interface[]): M3Concept {
        this.implements.push(...interfaces)
        return this
    }
}

export class M3Annotation extends M3Classifier {
    metaType(): string {
        return "M3Annotation"
    }

    extends?: SingleRef<M3Annotation>  // (reference)
    implements: MultiRef<M3Interface>  // (reference)
    annotates: SingleRef<M3Classifier> // (reference)
    
    constructor(id: LionWebId,data?: Partial<M3Annotation>) {
        super(id, data)
        this.extends = data?.extends
        this.implements = data?.implements ?? []
        this.annotates = data?.annotates ?? null
    }

    get m3features(): M3Feature[] {
        return [...this.m3properties, ...this.m3containments, ...this.m3references]
    }
}

export class M3Interface extends M3Classifier {
    metaType(): string {
        return "M3Interface"
    }

    extends: MultiRef<M3Interface> // (reference)

    public constructor(id: LionWebId, data?: Partial<M3Interface>) {
        super(id, data)
        this.extends = data?.extends ?? []
    }

    get m3features(): M3Feature[] {
        return [...this.m3properties, ...this.m3containments, ...this.m3references]
    }
}

export abstract class M3Datatype extends M3LanguageEntity {}

export class M3PrimitiveType extends M3Datatype {
    metaType(): string {
        return "M3PrimitiveType"
    }

    public constructor(id: LionWebId, data?: Partial<M3PrimitiveType>) {
        super(id, data)
    }

    toString(): string {
        return "PrimitiveType " + this.name
    }
}

export class M3Enumeration extends M3Datatype {
    metaType(): string {
        return "M3Enumeration"
    }

    literals: M3EnumerationLiteral[] // (containment)

    public constructor(id: LionWebId, data?: Partial<M3Enumeration>) {
        super(id, data)
        this.literals = data?.literals ?? []
    }
    
    havingLiterals(...literals: M3EnumerationLiteral[]) {
        this.literals.push(...literals)
        return this
    }
    
    toString(): string {
        let result = `=Enumeration ${this.name} [${this.key}]\n`
        this.literals.forEach(d => {
            result += `    literal ${d.name} (${d.key})\n`
        })
        return result
    }
}

export class M3EnumerationLiteral extends M3Node {
    metaType(): string {
        return "M3EnumerationLiteral"
    }

    constructor(id: LionWebId, data?: Partial<M3EnumerationLiteral>) {
        super(id, data)
    }

    get enumeration(): M3Enumeration {
        return this.parent! as M3Enumeration
    }
    
    toString(): string {
        return `+EnumerationLiteral ${this.name}`
    }
}

export class M3Language extends M3Node {
    metaType(): string {
        return "M3Language"
    }

    version: string
    entities: M3LanguageEntity[] = [] // (containment)
    dependsOn: MultiRef<M3Language> = [] // special (!) reference

    // (!) special because deserializer needs to be aware of where to get the instance from
    constructor(id: LionWebId, data?: Partial<M3Language>) {
        super(id, data)
        this.version = data?.version ?? ""
        this.entities = data?.entities ?? []
        // OR
        this.entities.push(...data?.entities ?? [])
        this.dependsOn = data?.dependsOn ?? []
    }

    dependingOn(...metamodels: M3Language[]): M3Language {
        this.dependsOn.push(...metamodels.filter(language => language.key !== LION_CORE_BUILTINS_KEY))
        return this
    }

    equals(that: M3Language): boolean {
        return this.key === that.key && this.version === that.version
    }
    
    toString(): string {
        let result = `Language Definition ${this.name} ${this.version} ${this.key}\n`
        this.dependsOn.forEach(d => {
            result += `    dependsOn ${d.name} (${d.key}) ${d.version}\n`
        })
        if (this.entities.length > 0) {
            result += `!${this.entities.filter(e => e instanceof M3Classifier).map(cl =>
                (cl as M3Classifier).toString()).join(',C\n '
            )}`
            result += `!${this.entities.filter(e => e instanceof M3Enumeration).map(cl =>
                (cl as M3Enumeration).toString()).join(',E\n '
            )}`
            result += `&${this.entities.filter(e => e instanceof M3PrimitiveType).map(cl =>
                (cl as M3PrimitiveType).toString()).join(',E\n '
            )}`
        }
        return result
    }
}

/**
 * Sum type of all LionCore type definitions whose meta-type is a concrete (thus: instantiable) Concept.
 * All the classes in this sum type extend (from) {@link M3Node},
 * so they also implement {@link INamed} and {@link M3IKeyed}.
 */
export type M3Thing =
    | M3Annotation
    | M3Concept
    | M3Containment
    | M3Enumeration
    | M3EnumerationLiteral
    | M3Interface
    | M3Language
    | M3PrimitiveType
    | M3Property
    | M3Reference
