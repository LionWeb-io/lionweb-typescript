import {Language} from "./types.ts"
import {SerializedModel} from "../serialization.ts"
import {lioncoreAPI} from "./api.ts"
import {nodesExtractorUsing} from "../api.ts"
import {deserializeModel} from "../deserializer.ts"
import {lioncore} from "./lioncore.ts"
import {lioncoreBuiltins} from "./builtins.ts"


/**
 * Deserializes a language that's serialized into the LIonWeb serialization JSON format
 * as an instance of the LIonCore/M3 metametamodel, using {@link _M3Concept these type definitions}.
 */
export const deserializeLanguage = (serializedModel: SerializedModel, ...dependentMetamodels: Language[]): Language =>
    deserializeModel(
        serializedModel,
        lioncoreAPI,
        lioncore,
        [lioncoreBuiltins, ...dependentMetamodels].flatMap(nodesExtractorUsing(lioncoreAPI))
    )[0] as Language

