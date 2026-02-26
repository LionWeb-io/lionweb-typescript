import {
    Annotation,
    Concept,
    Datatype,
    Enumeration,
    Interface,
    isRef,
    LanguageEntity,
    LionWebVersions,
    PrimitiveType,
    SingleRef
} from "@lionweb/core"


const { builtinsFacade } = LionWebVersions.v2023_1

export const tsTypeFor = (datatype: SingleRef<Datatype>): string => {
    if (datatype instanceof PrimitiveType) {
        switch (datatype.key) {
            case builtinsFacade.primitiveTypes.booleanDataType.key: return `boolean`
            case builtinsFacade.primitiveTypes.stringDataType.key: return `string`
            case builtinsFacade.primitiveTypes.integerDataType.key: return `number`
            case builtinsFacade.primitiveTypes.jsonDataType.key: return `unknown`
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
       entity instanceof Interface
    && entity.language.key === builtinsFacade.classifiers.inamed.language.key
    && entity.key === builtinsFacade.classifiers.inamed.key


export const usesINamedDirectly = (entity: LanguageEntity): boolean => {
    if (entity instanceof Annotation) {
        return entity.implements.filter(isRef).some(isINamed)
    }
    if (entity instanceof Concept) {
        return entity.implements.filter(isRef).some(isINamed)
    }
    if (entity instanceof Interface) {
        return entity.extends.filter(isRef).some(isINamed)
    }
    return false
}

