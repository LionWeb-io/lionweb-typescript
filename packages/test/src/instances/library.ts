import {
    Id,
    nameBasedClassifierDeducerFor,
    ReadModelAPI,
    updateSettingsNameBased,
    WriteModelAPI
} from "@lionweb/core"
import {hashingIdGen} from "@lionweb/utilities"
import {libraryLanguage} from "../languages/library.js"


export enum BookType {
    Normal,
    Special,
}
// Note: don't want to (have to) adjust this definition to "fit" with [de-]serialization ==> leave as-is!

// all enumerations in a lookup table, making use of the fact that at runtime a TS enum is also a value (an object):
const rtEnums: { [enumKey: string]: unknown } = {
    "BookType": BookType
}

export type BaseNode = {
    id: Id
    concept: string
}

export type Book = BaseNode & {
    concept: "Book"
    title: string
    pages: number
    author: Writer
    type?: BookType
}

export type Library = BaseNode & {
    concept: "Library"
    name: string
    books: Book[]
}

export type Writer = {   // abstract
    name: string
}

export type GuideBookWriter = Writer & BaseNode & {
    concept: "GuideBookWriter"
    countries: string
}

export type SpecialistBookWriter = Writer & BaseNode & {
    concept: "SpecialistBookWriter"
    subject: string
}


export const libraryReadModelAPI: ReadModelAPI<BaseNode> = {
    classifierOf: (node) => nameBasedClassifierDeducerFor(libraryLanguage)(node.concept),
    getFeatureValue: (node, feature) =>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
        (node as any)[feature.name],    // (mirrors name-based updating of settings)
    enumerationLiteralFrom: (value, enumeration) => {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rtEnum = rtEnums[enumeration.key] as any
        const targetKey = rtEnum[value as number]
        return enumeration.literals.find(({key}) => key === targetKey)
            ?? null     // (undefined -> null)
    }
}

export const libraryWriteModelAPI: WriteModelAPI<BaseNode> = {
    nodeFor: (_parent, concept, id, _propertySettings) => ({
        id,
        concept: concept.key
    }),
    setFeatureValue: updateSettingsNameBased,
    encodingOf: (literal) => {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rtEnum = rtEnums[literal.enumeration.key] as any
        return rtEnum[literal.key as unknown as number]
    }
    /*
     * This is a trick that uses TypeScript's reverse mappings for enumerations
     * (@see https://www.typescriptlang.org/docs/handbook/enums.html#reverse-mappings).
     * Unfortunately, it requires some "fugly" type casting to compile:
     *  'key' really is a string containing the enumeration literal's name.
     */
}

/*
 * This {@link ModelAPI} implementation shows the problems that enumerations cause with TypeScript (or even: in general).
 * A TS enum is a type and not an object as far as TS is concerned, which means that reflecting on it requires some jury-rigging through type-casting.
 */


const id = hashingIdGen()

export const jackLondon: GuideBookWriter = {
    id: id("Jack London"),
    concept: "GuideBookWriter",
    name: "Jack London",
    countries: "Alaska" // (not a country...)
}

const explorerBook: Book = {
    id: id("Explorer Book"),
    concept: "Book",
    title: "Explorer Book",
    author: jackLondon,
    pages: 1337,
    type: BookType.Special
}

export const bobLibrary: Library = {
    id: id("Bob's Library"),
    concept: "Library",
    name: "Bob's Library",
    books: [
        explorerBook
    ]
}

export const libraryModel: BaseNode[] = [
    bobLibrary,
    jackLondon
]

