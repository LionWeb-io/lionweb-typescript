import {
    Annotation,
    builtinClassifiers,
    builtinPrimitives,
    Concept,
    Datatype,
    Enumeration,
    Interface,
    LanguageEntity,
    PrimitiveType,
    SingleRef
} from "@lionweb/core"


export const tsTypeFor = (datatype: SingleRef<Datatype>): string => {
    if (datatype instanceof PrimitiveType) {
        switch (datatype) {
            case builtinPrimitives.booleanDatatype: return `boolean`
            case builtinPrimitives.stringDatatype: return `string`
            case builtinPrimitives.integerDatatype: return `number`
            case builtinPrimitives.jsonDatatype: return `unknown`
            default:
                return `string`
        }
    }
    if (datatype instanceof Enumeration) {
        return datatype.name
    }
    return `unknown /* [ERROR] can't compute a TS type for this datatype: ${datatype} */`
}

export const isINamed = (entity: LanguageEntity): boolean =>
    entity === builtinClassifiers.inamed


export const usesINamedDirectly = (entity: LanguageEntity): boolean => {
    if (entity instanceof Annotation) {
        return entity.implements.some(isINamed)
    }
    if (entity instanceof Concept) {
        return entity.implements.some(isINamed)
    }
    if (entity instanceof Interface) {
        return entity.extends.some(isINamed)
    }
    return false
}

