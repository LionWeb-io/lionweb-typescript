import {MetamodelFactory} from "./factory.ts"
import {lioncoreIdGen} from "./id-generation.ts"


const factory = new MetamodelFactory("LIonCore.stdlib", lioncoreIdGen)

/**
 * Definition of a LIonCore metamodel that serves as a standard library of built-in primitive types.
 */
export const lioncoreStdlib = factory.metamodel

const stringDatatype = factory.primitiveType("String")
const booleanDatatype = factory.primitiveType("boolean")
const intDatatype = factory.primitiveType("int")
const jsonDatatype = factory.primitiveType("JSON")

lioncoreStdlib.havingElements(
    stringDatatype,
    booleanDatatype,
    intDatatype,
    jsonDatatype
)

export const builtInPrimitiveTypes =
    Object.fromEntries(
        [stringDatatype, booleanDatatype, intDatatype, jsonDatatype]
            .map((datatype) => [datatype.simpleName, datatype])
    )

