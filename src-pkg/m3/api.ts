import {ModelAPI, updateSettings} from "../api.js"
import {
    Classifier,
    Concept,
    ConceptInterface,
    Containment,
    Enumeration,
    EnumerationLiteral,
    Language,
    M3Concept,
    PrimitiveType,
    Property,
    Reference
} from "./types.js"
import {builtinFeatures} from "./builtins.js"
import {lioncore, metaConcepts, metaFeatures} from "./lioncore.js"
import {classBasedConceptDeducerFor, qualifiedNameOf} from "./functions.js"
import {KeyGenerator, nameIsKeyGenerator} from "./key-generation.js"


const {inamed_name} = builtinFeatures

/**
 * @return An implementation of {@link ModelAPI model API} for instances of the LIonCore M3 (so M2s).
 * The returned {@link ModelAPI model API} uses the given {@link KeyGenerator key generator} to generate the keys of all objects in the M2.
 */
export const lioncoreAPIWithKeyGen = (keyGen: KeyGenerator): ModelAPI<M3Concept> => ({
    conceptOf: classBasedConceptDeducerFor(lioncore),
    getFeatureValue: (node, feature) =>
        (node as any)[feature.name],
    enumerationLiteralFrom: (value, _) => value as (EnumerationLiteral | null),
    nodeFor: (parent, concept, id, settings) => {
        switch (concept.key) {
            case metaConcepts.concept.key:
                return new Concept(parent as Language, settings[inamed_name.key] as string, "", id, settings[metaFeatures.concept_abstract.key] as boolean).keyed(keyGen)
            case metaConcepts.conceptInterface.key:
                return new ConceptInterface(parent as Language, settings[inamed_name.key] as string, "", id).keyed(keyGen)
            case metaConcepts.containment.key:
                return new Containment(parent as Classifier, settings[inamed_name.key] as string, "", id).keyed(keyGen)
            case metaConcepts.enumeration.key:
                return new Enumeration(parent as Language, settings[inamed_name.key] as string, "", id).keyed(keyGen)
            case metaConcepts.enumerationLiteral.key:
                return new EnumerationLiteral(parent as Enumeration, settings[inamed_name.key] as string, "", id).keyed(keyGen)
            case metaConcepts.language.key:
                return new Language(settings[inamed_name.key] as string, settings[metaFeatures.language_version.key] as string, id, settings[metaFeatures.ikeyed_key.key] as string)
            case metaConcepts.primitiveType.key:
                return new PrimitiveType(parent as Language, settings[inamed_name.key] as string, "", id).keyed(keyGen)
            case metaConcepts.property.key:
                return new Property(parent as Classifier, settings[inamed_name.key] as string, "", id).keyed(keyGen)
            case metaConcepts.reference.key:
                return new Reference(parent as Classifier, settings[inamed_name.key] as string, "", id).keyed(keyGen)
            default:
                throw new Error(`can't deserialize a node of concept "${qualifiedNameOf(concept)}" with key "${concept.key}"`)
        }
    },
    setFeatureValue: (node, feature, value) => {
        updateSettings(node as unknown as Record<string, unknown>, feature, value)
    },
    encodingOf: (literal) => literal
})


/**
 * An implementation of {@link ModelAPI} for instances of the LIonCore M3 (so M2s), where key = name.
 *
 * TODO  deprecate this: [de-]serialization of metamodels should be parametrized with key generation throughout
 */
export const lioncoreAPI: ModelAPI<M3Concept> = lioncoreAPIWithKeyGen(nameIsKeyGenerator)

