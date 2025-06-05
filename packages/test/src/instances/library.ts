import { InstantiationFacade, nameBasedClassifierDeducerFor, Reader, updateSettingsNameBased } from "@lionweb/core"
import { hasher } from "@lionweb/utilities"
import { libraryLanguage } from "../languages/library.js"
import { BaseNode } from "./base.js"

export enum BookType {
    Normal,
    Special
}
// Note: don't want to (have to) adjust this definition to "fit" with [de-]serialization ==> leave as-is!

// all enumerations in a lookup table, making use of the fact that at runtime a TS enum is also a value (an object):
const rtEnums: { [enumKey: string]: unknown } = {
    BookType: BookType
}

export type Book = BaseNode & {
    classifier: "Book"
    title: string
    pages: number
    author: Writer
    type?: BookType
}

export type Library = BaseNode & {
    classifier: "Library"
    name: string
    books: Book[]
}

export type Writer = {
    // abstract
    name: string
}

export type GuideBookWriter = Writer &
    BaseNode & {
        classifier: "GuideBookWriter"
        countries: string
    }

export type SpecialistBookWriter = Writer &
    BaseNode & {
        classifier: "SpecialistBookWriter"
        subject: string
    }

export const libraryReader: Reader<BaseNode> = {
    classifierOf: node => nameBasedClassifierDeducerFor(libraryLanguage)(node.classifier),
    getFeatureValue: (node, feature) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (node as any)[feature.name], // (mirrors name-based updating of settings)
    enumerationLiteralFrom: (value, enumeration) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rtEnum = rtEnums[enumeration.key] as any
        const targetKey = rtEnum[value as number]
        return enumeration.literals.find(({ key }) => key === targetKey) ?? null // (undefined -> null)
    }
}

export const libraryInstantiationFacade: InstantiationFacade<BaseNode> = {
    nodeFor: (_parent, classifier, id, _propertySettings) => ({
        id,
        classifier: classifier.key,
        annotations: []
    }),
    setFeatureValue: updateSettingsNameBased,
    encodingOf: literal => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rtEnum = rtEnums[literal.enumeration.key] as any
        return rtEnum[literal.key as unknown as number]
    }
    /*
     * This is a trick that uses TypeScript's reverse mappings for enumerations
     * (@see https://www.typescriptlang.org/docs/handbook/enums.html#reverse-mappings).
     * Unfortunately, it requires some "fugly" type casting to compile:
     *  'key' really is a string containing the enumeration literal's _name_
     *  (so this relies on the TypeScript's literal _name_ and the M3 enumeration literal's _key_ being identical).
     */
}

/*
 * These facade implementation show the problems that enumerations cause with TypeScript (or even: in general).
 * A TS enum is a type and not an object as far as TS is concerned, which means that reflecting on it requires some jury-rigging through type-casting.
 */

const hash = hasher()

export const jackLondon: GuideBookWriter = {
    id: hash("Jack London"),
    classifier: "GuideBookWriter",
    name: "Jack London",
    countries: "Alaska", // (not a country...)
    annotations: []
}

const explorerBook: Book = {
    id: hash("Explorer Book"),
    classifier: "Book",
    title: "Explorer Book",
    author: jackLondon,
    pages: 1337,
    type: BookType.Special,
    annotations: []
}

export const bobLibrary: Library = {
    id: hash("Bob's Library"),
    classifier: "Library",
    name: "Bob's Library",
    books: [explorerBook],
    annotations: []
}

export const libraryModel: BaseNode[] = [bobLibrary, jackLondon]
