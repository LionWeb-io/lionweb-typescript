import {MetamodelFactory} from "./factory.ts"
import {lioncoreIdGen} from "./id-generation.ts"


const factory = new MetamodelFactory("LIonCore.builtins", lioncoreIdGen)

/**
 * Definition of a LIonCore metamodel that serves as a standard library of built-in primitive types.
 */
export const lioncoreBuiltins = factory.metamodel

export const stringDatatype = factory.primitiveType("String")
export const booleanDatatype = factory.primitiveType("Boolean")
export const intDatatype = factory.primitiveType("Integer")
export const jsonDatatype = factory.primitiveType("JSON")

lioncoreBuiltins.havingElements(
    stringDatatype,
    booleanDatatype,
    intDatatype,
    jsonDatatype
)

