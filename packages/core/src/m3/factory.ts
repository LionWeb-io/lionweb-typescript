import {
    Annotation,
    Classifier,
    Concept,
    Containment,
    Enumeration,
    EnumerationLiteral,
    Interface,
    Language,
    PrimitiveType,
    Property,
    Reference
} from "./types.js"
import {SingleRef} from "../references.js"
import {StringsMapper} from "../utils/string-mapping.js"


/**
 * A factory that produces a {@link Language} instance,
 * as well as elements contained by that instance.
 */
export class LanguageFactory {

    readonly id: StringsMapper
    readonly key: StringsMapper
    readonly language: Language

    constructor(name: string, version: string, id: StringsMapper, key: StringsMapper) {
        this.id = id
        this.key = key
        this.language = new Language(name, version, this.id(name), this.key(name))
    }

    annotation(name: string, extends_?: SingleRef<Annotation>) {
        return new Annotation(this.language, name, this.key(this.language.name, name), this.id(this.language.name, name), extends_)
    }

    concept(name: string, abstract: boolean, extends_?: SingleRef<Concept>) {
        return new Concept(this.language, name, this.key(this.language.name, name), this.id(this.language.name, name), abstract, extends_)
    }

    interface(name: string) {
        return new Interface(this.language, name, this.key(this.language.name, name), this.id(this.language.name, name))
    }

    enumeration(name: string) {
        return new Enumeration(this.language, name, this.key(this.language.name, name), this.id(this.language.name, name))
    }

    primitiveType(name: string) {
        return new PrimitiveType(this.language, name, this.key(this.language.name, name), this.id(this.language.name, name))
    }


    containment(classifier: Classifier, name: string) {
        return new Containment(classifier, name, this.key(this.language.name, classifier.name, name), this.id(this.language.name, classifier.name, name))
    }

    property(classifier: Classifier, name: string) {
        return new Property(classifier, name, this.key(this.language.name, classifier.name, name), this.id(this.language.name, classifier.name, name))
    }

    reference(classifier: Classifier, name: string) {
        return new Reference(classifier, name, this.key(this.language.name, classifier.name, name), this.id(this.language.name, classifier.name, name))
    }


    enumerationLiteral(enumeration: Enumeration, name: string) {
        return new EnumerationLiteral(enumeration, name, this.key(this.language.name, enumeration.name, name), this.id(this.language.name, enumeration.name, name))
    }

}

