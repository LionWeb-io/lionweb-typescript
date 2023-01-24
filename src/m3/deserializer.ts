import {M3Concept as _M3Concept, Metamodel} from "./types.ts"
import {SerializedModel} from "../serialization.ts"
import {lioncoreAPI} from "./api.ts"
import {nodesExtractorUsing} from "../api.ts"
import {deserializeModel} from "../deserializer.ts"
import {lioncore} from "./self-definition.ts"


/**
 * Deserializes a metamodel that's serialized into the LIonWeb serialization JSON format
 * as an instance of the LIonCore/M3 metametamodel, using {@link _M3Concept these type definitions}.
 */
export const deserializeMetamodel = (serializedModel: SerializedModel, ...dependentMetamodels: Metamodel[]): Metamodel =>
    deserializeModel(
        serializedModel,
        lioncoreAPI,
        lioncore,
        dependentMetamodels.flatMap(nodesExtractorUsing(lioncoreAPI))
    )[0] as Metamodel

