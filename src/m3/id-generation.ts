import {
    checkDefinedData,
    checkUniqueData,
    checkUniqueId,
    checkValidId,
    wrapIdGen
} from "../id-generation.ts"


/**
 * A {@link IdGenerator ID generator} specifically for LIonCore metamodels,
 * namely: its self-definition, and its standard library of built-in primitive types.
 */
export const lioncoreIdGen = wrapIdGen(
    (qualifiedName) => qualifiedName!.replaceAll(".", "_"),
    checkDefinedData,   // ensures that the '!' on the previous line always works
    checkUniqueData,
    checkValidId,
    checkUniqueId
)

