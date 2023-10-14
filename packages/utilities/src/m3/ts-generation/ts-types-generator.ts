import {
    builtinClassifiers,
    builtinPrimitives,
    Concept,
    conceptsOf,
    Datatype,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
    DynamicNode,
    Enumeration,
    Feature,
    Interface,
    isConcrete,
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
import {asString} from "littoral-templates"
import {cond, indent} from "./text-generation-utils.js"
import {Field, tsFromTypeDef, TypeDefModifier} from "./type-def.js"


const fieldForFeature = (feature: Feature) => {
    if (feature instanceof Link) {
        return fieldForLink(feature)
    }
    if (feature instanceof Property) {
        return fieldForProperty(feature)
    }
    return {
        name: feature.name,
        optional: false,
        type: `unknown`
    }
}


const fieldForLink = ({name, type, optional, multiple}: Link): Field =>
    ({
        name,
        optional: optional && !multiple,
        type: `${type === unresolved ? `unknown` : type.name}${multiple ? `[]` : ``}`
    })
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


const fieldForProperty = ({name, type, optional}: Property): Field =>
    ({
        name,
        optional,
        type: tsTypeFor(type)
    })


const isINamed = (entity: LanguageEntity) =>
    entity === builtinClassifiers.inamed


const usesINamedDirectly = (entity: LanguageEntity): boolean => {
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

        const superTypes = [
            ...(concept.extends ? [concept.extends] : []),
            ...concept.implements
        ]
        const subClassifiers =
            concept.abstract
                ? (
                    generationOptions.indexOf(GenerationOptions.assumeSealed) > -1
                        ? conceptsOf(language).filter((entity) => entity.extends === concept)
                        : []
                )
                : [concept]

        return tsFromTypeDef({
            modifier: concept.abstract ? TypeDefModifier.abstract : TypeDefModifier.none,
            name: concept.name,
            mixinNames: superTypes.length === 0 ? [`DynamicNode`] : superTypes.map(nameOf),
            bodyComment: subClassifiers.length > 0 ? `classifier -> ${subClassifiers.map(nameOf).join(` | `)}` : undefined,
            fields: concept.features.map(fieldForFeature)
        })

    }

    const typeForInterface = (intface: Interface) =>
        tsFromTypeDef({
            modifier: TypeDefModifier.interface,
            name: intface.name,
            mixinNames: intface.extends.length === 0 ? [`DynamicNode`] : intface.extends.map(nameOf),
            fields: intface.features.map(fieldForFeature)
        })

    const typeForLanguageEntity = (entity: LanguageEntity) => {
        // TODO  Annotation
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
        return [
            `// unhandled language entity <${entity.constructor.name}>"${entity.name}"`,
            ``
        ]
    }

    const globalImports = [
        ...cond(!language.entities.every(usesINamedDirectly), `DynamicNode`),
        ...cond(language.entities.some(usesINamedDirectly), `DynamicINamed as INamed`)     // (rename import so we don't have to map just the one)
    ]

    return asString(
        [
            `// Warning: this file is generated!`,
            `// Modifying it by hand it useless at best, and sabotage at worst.`,
            ``,
            `/*
 * language's metadata:
 *     name:    ${language.name}
 *     version: ${language.version}
 */`,
            ``,
            cond(globalImports.length > 0, `import {${globalImports.join(`, `)}} from "@lionweb/core";`),
            ``,
            nameSorted(language.entities).map(typeForLanguageEntity),
            `export type ${language.name}Node = ${nameSorted(language.entities.filter(isConcrete)).map(nameOf).join(` | `)};`
        ]
    )
}

