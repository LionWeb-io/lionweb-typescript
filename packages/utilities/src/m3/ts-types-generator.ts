import {
    builtinClassifiers,
    builtinPrimitives,
    Concept,
    Datatype,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
    DynamicNode,
    Enumeration,
    Feature,
    Interface,
    Language,
    LanguageEntity,
    Link,
    nameOf,
    nameSorted,
    PrimitiveType,
    Property,
    SingleRef,
    unresolved
} from "@lionweb/core"
import {asString, indentWith, NestedString} from "littoral-templates"


const indent = indentWith("    ")(1)

/**
 * Include the given `result` only when the `expr` is `true`.
 */
const cond = (expr: boolean, result: NestedString) =>
    expr ? [result] : []


const fieldForFeature = (feature: Feature) => {
    if (feature instanceof Link) {
        return fieldForLink(feature)
    }
    if (feature instanceof Property) {
        return fieldForProperty(feature)
    }
    return `${feature.name}: unknown;`
}


const fieldForLink = ({name, type, optional, multiple}: Link) =>
    `${name}${optional && !multiple ? `?` : ``}: ${type === unresolved ? `unknown` : type.name}${multiple ? `[]` : ``};`
        // FIXME  this doesn't work cross-language


const tsTypeFor = (datatype: SingleRef<Datatype>) => {
    switch (datatype) {
        case builtinPrimitives.booleanDatatype: return `boolean`
        case builtinPrimitives.stringDatatype: return `string`
        case builtinPrimitives.integerDatatype: return `number`
        case builtinPrimitives.jsonDatatype: return `unknown`

        case unresolved:
        default:
            return `unknown`
    }
}


const fieldForProperty = ({name, type, optional}: Property) =>
    `${name}${optional ? `?` : ``}: ${tsTypeFor(type)};`


const isINamed = (entity: LanguageEntity) =>
    entity === builtinClassifiers.inamed


const usesINamed = (entity: LanguageEntity): boolean => {
    if (entity instanceof Concept) {
        return entity.implements.some(isINamed)
    }
    if (entity instanceof Interface) {
        return entity.extends.some(isINamed)
    }
    return false
}


const typeForEnumeration = (enumeration: Enumeration) =>
    [
        `enum ${enumeration.name} {`,
        indent(enumeration.literals.map(nameOf).join(`, `)),
        `}`,
        ``
    ]

const typeForPrimitiveType = (datatype: PrimitiveType) =>
    [
        `export type ${datatype.name} = ${tsTypeFor(datatype)};`,
        ``
    ]


export enum GenerationOptions {
    assumeSealed
}


/**
 * @return string generated TypeScript source code that contains type definitions that match the given {@link Language language}
 *  in combination with using the {@link DynamicNode} base type and corresponding facades.
 */
export const tsTypesForLanguage = (language: Language, ...generationOptions: GenerationOptions[]) => {

    const typeForConcept = (concept: Concept) => {

        const {name} = concept
        const mixinNames = [
            ...cond(!usesINamed(concept), [`DynamicNode`]),  // (Yes...this is a slight misuse of the cond function...)
            ...concept.implements.map(nameOf)
        ]
        const subClassifiers =
            concept.abstract
                ? (
                    generationOptions.indexOf(GenerationOptions.assumeSealed) === -1
                        ? []
                        : language.entities
                            .filter((entity) => entity instanceof Concept && entity.extends === concept)
                                // TODO  (move to an appropriate function in core/src/m3/functions.ts)
                )
                : [concept]
        const hasBody = !concept.abstract || concept.features.length > 0 || subClassifiers.length > 0

        return [
            `${concept.abstract ? `/** abstract */ ` : ``}export type ${name} = ${mixinNames.join(` & `)}${hasBody ? ` & {` : `;`}`,
            cond(hasBody, [
                indent([
                    cond(subClassifiers.length > 0, `classifier: ${subClassifiers.map((classifier) => `"${classifier.name}"`).join(` | `)};`),
                    cond(concept.features.length > 0, [
                        `settings: {`,
                        indent(
                            concept.features.map(fieldForFeature)
                        ),
                        `};`
                    ]),
                ]),
                `};`    // (`{` was already rendered as part of the header)
            ]),
            ``
        ]

    }

    const typeForInterface = (intface: Interface) => {

        const {name} = intface
        const mixinNames = [
            ...cond(!usesINamed(intface), [`DynamicNode`]),  // (Yes...this is a slight misuse of the cond function...)
            ...intface.extends.map(nameOf)
        ]
        const hasBody = intface.features.length > 0

        return [
            `/** interface */ export type ${name} = ${mixinNames.join(` & `)}${hasBody ? ` & {` : `;`}`,
            cond(hasBody, [
                indent([
                    cond(intface.features.length > 0, [
                        `settings: {`,
                        indent(
                            intface.features.map(fieldForFeature)
                        ),
                        `};`
                    ]),
                ]),
                `};`    // (`{` was already rendered as part of the header)
            ]),
            ``
        ]

    }

    // TODO  Refactor previous two functions: 1) transform to an instance of a type def. that captures the code to generate, 2) generate from that

    const typeForLanguageEntity = (entity: LanguageEntity) => {
        if (entity instanceof Concept) {
            return typeForConcept(entity)
        }
        if (entity instanceof Enumeration) {
            return typeForEnumeration(entity)
        }
        if (entity instanceof Interface) {
            return typeForInterface(entity)
        }
        if (entity instanceof PrimitiveType) {
            return typeForPrimitiveType(entity)
        }
        // TODO  Annotation, ConceptInterface
        return [
            `// unhandled language entity <${entity.constructor.name}>"${entity.name}"`,
            ``
        ]
    }

    const globalImports = [
        ...cond(!language.entities.every(usesINamed), `DynamicNode`),
        ...cond(language.entities.some(usesINamed), `DynamicINamed as INamed`)     // (rename import so we don't have to map just the one)
    ]

    return asString(
        [
            `// Warning: this file is generated!`,
            `// Modifying it by hand it useless at best, and sabotage at worst.`,
            ``,
            ``,
            `/*
 * language's metadata:
 *     name:    ${language.name}
 *     version: ${language.version}
 */`,
            ``,
            ``,
            cond(globalImports.length > 0, `import {${globalImports.join(`, `)}} from "@lionweb/core";`),
            ``,
            ``,
            nameSorted(language.entities).map(typeForLanguageEntity)
        ]
    )
}

