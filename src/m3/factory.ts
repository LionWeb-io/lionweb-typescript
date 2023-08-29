import {
    Annotation,
    Classifier,
    Concept,
    ConceptInterface,
    Containment,
    Enumeration,
    EnumerationLiteral,
    Language,
    lioncoreQNameSeparator,
    PrimitiveType,
    Property,
    Reference
} from "./types.ts"
import {SingleRef} from "../references.ts"
import {IdGenerator, nanoIdGen} from "../id-generation.ts"
import {qualifiedNameOf} from "./functions.ts"
import {KeyGenerator, nameIsKeyGenerator} from "./key-generation.ts"


const concat = (...names: string[]): string =>
    names.join(lioncoreQNameSeparator)


const unkeyed = "!--no key generated--!"


/**
 * A factory that produces a {@link Language} instance,
 * as well as elements contained by that instance.
 * The {@link https://zelark.github.io/nano-id-cc/ `nanoid`-based} ID generator
 * is used, unless specified otherwise.
 */
export class LanguageFactory {

    readonly id: IdGenerator
    readonly key: KeyGenerator
    readonly language: Language

    constructor(name: string, version: string, id: IdGenerator = nanoIdGen(), key: KeyGenerator = nameIsKeyGenerator) {
        this.id = id
        this.key = key
        const idAndKey = this.id(name)  // need to call this.id just once
        this.language = new Language(name, version, idAndKey, idAndKey)
    }


    // TODO  this pattern (post-re-setting the key) is not nice: improve...

    annotation(name: string, extends_?: SingleRef<Annotation>) {
        return new Annotation(this.language, name, unkeyed, this.id(concat(this.language.name, name)), extends_).keyed(this.key)
    }

    concept(name: string, abstract: boolean, extends_?: SingleRef<Concept>) {
        return new Concept(this.language, name, unkeyed, this.id(concat(this.language.name, name)), abstract, extends_).keyed(this.key)
    }

    conceptInterface(name: string) {
        return new ConceptInterface(this.language, name, unkeyed, this.id(concat(this.language.name, name))).keyed(this.key)
    }

    enumeration(name: string) {
        return new Enumeration(this.language, name, unkeyed, this.id(concat(this.language.name, name))).keyed(this.key)
    }

    primitiveType(name: string) {
        return new PrimitiveType(this.language, name, unkeyed, this.id(concat(this.language.name, name))).keyed(this.key)
    }


    containment(classifier: Classifier, name: string) {
        return new Containment(classifier, name, unkeyed, this.id(concat(qualifiedNameOf(classifier, lioncoreQNameSeparator), name))).keyed(this.key)
    }

    property(classifier: Classifier, name: string) {
        return new Property(classifier, name, unkeyed, this.id(concat(qualifiedNameOf(classifier, lioncoreQNameSeparator), name))).keyed(this.key)
    }

    reference(classifier: Classifier, name: string) {
        return new Reference(classifier, name, unkeyed, this.id(concat(qualifiedNameOf(classifier, lioncoreQNameSeparator), name))).keyed(this.key)
    }


    enumerationLiteral(enumeration: Enumeration, name: string) {
        return new EnumerationLiteral(enumeration, name, unkeyed, this.id(concat(qualifiedNameOf(enumeration, lioncoreQNameSeparator), name))).keyed(this.key)
    }

}

