import {
    Annotation,
    Concept,
    Datatype,
    Enumeration,
    Interface,
    isRef,
    LanguageEntity,
    lioncoreBuiltinsFacade,
    PrimitiveType,
    SingleRef
} from "@lionweb/core"


export const tsTypeFor = (datatype: SingleRef<Datatype>): string => {
    if (datatype instanceof PrimitiveType) {
        switch (datatype) {
            case lioncoreBuiltinsFacade.primitiveTypes.booleanDataType: return `boolean`
            case lioncoreBuiltinsFacade.primitiveTypes.stringDataType: return `string`
            case lioncoreBuiltinsFacade.primitiveTypes.integerDataType: return `number`
            case lioncoreBuiltinsFacade.primitiveTypes.jsonDataType: return `unknown`
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
    entity === lioncoreBuiltinsFacade.primitiveTypes.inamed


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

