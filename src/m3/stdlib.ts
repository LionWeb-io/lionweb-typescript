import {MetamodelFactory} from "./factory.ts"
import {lioncoreIdGen} from "./id-generation.ts"


const factory = new MetamodelFactory("LIonCore.stdlib", lioncoreIdGen)

/**
 * Definition of a LIonCore metamodel that serves as a standard library of built-in primitive types.
 */
export const lioncoreStdlib = factory.metamodel

export const stringDatatype = factory.primitiveType("String")
export const booleanDatatype = factory.primitiveType("boolean")
export const intDatatype = factory.primitiveType("int")
export const jsonDatatype = factory.primitiveType("JSON")

lioncoreStdlib.havingElements(
    stringDatatype,
    booleanDatatype,
    intDatatype,
    jsonDatatype
)

