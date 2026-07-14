import {
    Annotation,
    Concept,
    DataType,
    Enumeration,
    Interface,
    isResolvedReference,
    LanguageEntity,
    LionWebVersions,
    PrimitiveType,
    SingleRef,
    StructuredDataType
} from "@lionweb/core"


const { builtinsFacade } = LionWebVersions.v2023_1

export const tsTypeFor = (dataType: SingleRef<DataType>): string => {
    if (dataType instanceof PrimitiveType) {
        switch (dataType.key) {
            case builtinsFacade.primitiveTypes.booleanDataType.key: return `boolean`
            case builtinsFacade.primitiveTypes.stringDataType.key: return `string`
            case builtinsFacade.primitiveTypes.integerDataType.key: return `number`
            case builtinsFacade.primitiveTypes.jsonDataType.key: return `unknown`
            default:
                return `string`
        }
    }
    if (dataType instanceof Enumeration) {
        return dataType.name
    }
    if (dataType instanceof StructuredDataType) {
        return dataType.name
    }
    return `unknown /* [ERROR] can't compute a TS type for this datatype: ${dataType.toString()} */`
}

export const isINamed = (entity: LanguageEntity): boolean =>
       entity instanceof Interface
    && entity.language.key === builtinsFacade.classifiers.inamed.language.key
    && entity.key === builtinsFacade.classifiers.inamed.key


export const usesINamedDirectly = (entity: LanguageEntity): boolean => {
    if (entity instanceof Annotation) {
        return entity.implements.filter(isResolvedReference).some(isINamed)
    }
    if (entity instanceof Concept) {
        return entity.implements.filter(isResolvedReference).some(isINamed)
    }
    if (entity instanceof Interface) {
        return entity.extends.filter(isResolvedReference).some(isINamed)
    }
    return false
}

