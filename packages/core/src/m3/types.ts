/**
 * TypeScript type definitions for the `LionCore` M3 (=meta-meta) model.
 * A LionWeb language (at the M2 meta level) can be represented as an instance of the {@link Language} type.
 */

import { LionWebId, LionWebJsonMetaPointer, LionWebKey } from "@lionweb/json"
import { ResolveInfoDeducer } from "../reading.js"
import { MultiRef, SingleRef, referenceToSet } from "../references.js"
import { Node } from "../types.js"


/**
 * The key of the LionCore language containing the built-ins.
 * (It's defined here because of instantiation order.)
 */
const lioncoreBuiltinsKey = "LionCore-builtins"


// Types appear roughly in the order of top-to-down+left-to-right in the diagram at:
//      https://lionweb-io.github.io/specification/metametamodel/metametamodel.html#_overview


interface INamed {
    name: string
}

const isINamed = (node: object): node is INamed =>
    "name" in node && typeof node.name === "string"

const simpleNameDeducer: ResolveInfoDeducer<Node> =
    (node: Node) => isINamed(node) ? node.name : undefined


interface IKeyed extends INamed {
    key: LionWebId
}


/**
 * An interface with one method to return a meta type,
 * independent of the class's name obtained through `<node>.constructor.name`,
 * which may be brittle when using bundlers.
 */
interface IMetaTyped {
    metaType(): string
}

/**
 * Abstract base class for nodes in an LionCore instance,
 * providing an ID, a key, and the containment hierarchy.
 */
abstract class M3Node implements IKeyed, IMetaTyped {
    metaType(): string {
        throw new Error("#metaType() not implemented")
    }
    parent?: M3Node
        /*
         * Note: every parent in an M2 (i.e., a Language, Concept, Interface, Enumeration) implements IKeyed.
         * Because that's just an interface and is implemented by {@link M3Node},
         * we can type parent as M3Node?.
         */
    readonly id: LionWebId
    name: string
    key: LionWebId
    protected constructor(id: LionWebId, name: string, key: LionWebId, parent?: M3Node) {
        this.id = id
        this.name = name
        this.key = key
        this.parent = parent
    }
    havingKey(key: LionWebId) {
        this.key = key
        return this
    }
    annotations: Node[] = [] // (containment)
}

abstract class Feature extends M3Node {
    optional /*: boolean */ = false
    // TODO  look at order of constructors' arguments!
    constructor(classifier: Classifier, name: string, key: LionWebKey, id: LionWebId) {
        super(id, name, key, classifier)
    }
    isOptional() {
        this.optional = true
        return this
    }
    get classifier(): Classifier {
        return this.parent! as Classifier
    }
}

class Property extends Feature {
    metaType(): string {
        return "Property"
    }
    type: SingleRef<DataType> = referenceToSet()   // (reference)
    ofType(type: DataType): Property {
        this.type = type
        return this
    }
}

abstract class Link extends Feature {
    multiple /*: boolean */ = false
    type: SingleRef<Classifier> = referenceToSet()   // (reference)
    isMultiple() {
        this.multiple = true
        return this
    }
    ofType(type: Classifier) {
        this.type = type
        return this
    }
}

class Containment extends Link {
    metaType(): string {
        return "Containment"
    }
}

class Reference extends Link {
    metaType(): string {
        return "Reference"
    }
}

abstract class LanguageEntity extends M3Node {
    constructor(language: Language, name: string, key: LionWebId, id: LionWebId) {
        super(id, name, key, language)
    }
    get language(): Language {
        return this.parent! as Language
    }
}

abstract class Classifier extends LanguageEntity {
    features: Feature[] = [] // (containment)
    havingFeatures(...features: Feature[]) {
        this.features.push(...features.filter((feature) => this.features.indexOf(feature) < 0))
        return this
    }
    metaPointer(): LionWebJsonMetaPointer {
        const {language} = this
        return {
            language: language.key,
            version: language.version,
            key: this.key
        }
    }
}

class Concept extends Classifier {
    metaType(): string {
        return "Concept"
    }
    abstract: boolean
    partition: boolean
    extends?: SingleRef<Concept>    // (reference)
    implements: MultiRef<Interface> = []  // (reference)
    constructor(language: Language, name: string, key: LionWebKey, id: LionWebId, abstract: boolean, extends_?: SingleRef<Concept>) {
        super(language, name, key, id)
        this.abstract = abstract
        this.extends = extends_
        this.partition = false
    }
    implementing(...interfaces: Interface[]): Concept {
        // TODO  check actual types of interfaces, or use type shapes/interfaces
        this.implements.push(...interfaces)
        return this
    }
    isPartition(): Concept {
        this.partition = true
        return this
    }
}

class Annotation extends Classifier {
    metaType(): string {
        return "Annotation"
    }
    extends?: SingleRef<Annotation> // (reference)
    implements: MultiRef<Interface> = [] // (reference)
    annotates: SingleRef<Classifier> = referenceToSet()   // (reference)
    constructor(language: Language, name: string, key: LionWebKey, id: LionWebId, extends_?: SingleRef<Annotation>) {
        super(language, name, key, id)
        this.extends = extends_
    }
    implementing(...interfaces: Interface[]): Annotation {
        // TODO  check actual types of interfaces, or use type shapes/interfaces
        this.implements.push(...interfaces)
        return this
    }
    annotating(classifier: Classifier): Annotation {
        this.annotates = classifier
        return this
    }
}

class Interface extends Classifier {
    metaType(): string {
        return "Interface"
    }
    extends: MultiRef<Interface> = []    // (reference)
    extending(...interfaces: Interface[]): Interface {
        // TODO  check actual types of interfaces, or use type shapes/interfaces
        this.extends.push(...interfaces)
        return this
    }
}

abstract class DataType extends LanguageEntity {}

/**
 * Misspelled alias of {@link DataType}, kept for backward compatibility, and to be deprecated and removed later.
 */
abstract class Datatype extends DataType {}

class PrimitiveType extends DataType {
    metaType(): string {
        return "PrimitiveType"
    }
}

class Enumeration extends DataType {
    metaType(): string {
        return "Enumeration"
    }
    literals: EnumerationLiteral[] = [] // (containment)
    havingLiterals(...literals: EnumerationLiteral[]) {
        this.literals.push(...literals.filter((literal) => this.literals.indexOf(literal) < 0))
        return this
    }
}

class EnumerationLiteral extends M3Node {
    metaType(): string {
        return "EnumerationLiteral"
    }
    constructor(enumeration: Enumeration, name: string, key: LionWebKey, id: LionWebId) {
        super(id, name, key, enumeration)
    }
    get enumeration(): Enumeration {
        return this.parent! as Enumeration
    }
}

class Language extends M3Node {
    metaType(): string {
        return "Language"
    }
    version: string
    entities: LanguageEntity[] = []   // (containment)
    dependsOn: MultiRef<Language> = []  // special (!) reference
        // (!) special because deserializer needs to be aware of where to get the instance from
    constructor(name: string, version: string, id: LionWebId, key: LionWebKey) {
        super(id, name, key)
        this.version = version
    }
    havingEntities(...entities: LanguageEntity[]): Language {
        this.entities.push(...entities.filter((entity) => this.entities.indexOf(entity) < 0))
        return this
    }
    dependingOn(...languages: Language[]): Language {
        this.dependsOn.push(
            ...languages
                .filter((language) => language.key !== lioncoreBuiltinsKey)
        )
        return this
    }
    equals(that: Language): boolean {
        return this.key === that.key && this.version === that.version
    }
}


/**
 * Sum type of all LionCore type definitions whose meta-type is a concrete (thus: instantiable) Concept.
 * All the classes in this sum type extend (from) {@link M3Node},
 * so they also implement {@link INamed} and {@link IKeyed}.
 */
type M3Concept =
    | Annotation
    | Concept
    | Containment
    | Enumeration
    | EnumerationLiteral
    | Interface
    | Language
    | PrimitiveType
    | Property
    | Reference


export {
    Annotation,
    Classifier,
    Concept,
    Containment,
    DataType,
    Datatype,
    Enumeration,
    EnumerationLiteral,
    Feature,
    Interface,
    Language,
    LanguageEntity,
    Link,
    PrimitiveType,
    Property,
    Reference,
    isINamed,
    lioncoreBuiltinsKey,
    simpleNameDeducer
}

export type {
    IKeyed,
    IMetaTyped,
    INamed,
    M3Concept,
    M3Node
}

