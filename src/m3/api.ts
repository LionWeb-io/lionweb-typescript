import {ModelAPI, updateSettings} from "../api.ts"
import {
    Concept,
    ConceptInterface,
    Containment,
    Enumeration,
    EnumerationLiteral,
    FeaturesContainer,
    Language,
    M3Concept,
    PrimitiveType,
    Property,
    Reference
} from "./types.ts"
import {lioncore, metaConcepts, metaFeatures} from "./self-definition.ts"
import {classBasedConceptDeducerFor} from "./functions.ts"
import {KeyGenerator, simpleNameIsKeyGenerator} from "./key-generator.ts"


/**
 * @return An implementation of {@link ModelAPI model API} for instances of the LIonCore M3 (so M2s).
 * The returned {@link ModelAPI model API} uses the given {@link KeyGenerator key generator} to generate the keys of all objects in the M2.
 */
export const lioncoreAPIWithKeyGen = (keyGen: KeyGenerator): ModelAPI<M3Concept> => ({
    conceptOf: classBasedConceptDeducerFor(lioncore),
    getFeatureValue: (node, feature) =>
        (node as any)[feature.name],
    nodeFor: (parent, concept, id, settings) => {
        switch (concept.id) {
            case metaConcepts.concept.id:
                return new Concept(parent as Language, settings[metaFeatures.namespacedEntity_name.id] as string, "", id, settings[metaFeatures.concept_abstract.id] as boolean).keyed(keyGen)
            case metaConcepts.conceptInterface.id:
                return new ConceptInterface(parent as Language, settings[metaFeatures.namespacedEntity_name.id] as string, "", id).keyed(keyGen)
            case metaConcepts.containment.id:
                return new Containment(parent as FeaturesContainer, settings[metaFeatures.namespacedEntity_name.id] as string, "", id).keyed(keyGen)
            case metaConcepts.enumeration.id:
                return new Enumeration(parent as Language, settings[metaFeatures.namespacedEntity_name.id] as string, "", id).keyed(keyGen)
            case metaConcepts.enumerationLiteral.id:
                return new EnumerationLiteral(parent as Enumeration, settings[metaFeatures.language_elements.id] as string, "", id).keyed(keyGen)
            case metaConcepts.language.id:
                return new Language(settings[metaFeatures.language_elements.id] as string, settings[metaFeatures.language_version.id] as string, id)
            case metaConcepts.primitiveType.id:
                return new PrimitiveType(parent as Language, settings[metaFeatures.namespacedEntity_name.id] as string, "", id).keyed(keyGen)
            case metaConcepts.property.id:
                return new Property(parent as FeaturesContainer, settings[metaFeatures.namespacedEntity_name.id] as string, "", id).keyed(keyGen)
            case metaConcepts.reference.id:
                return new Reference(parent as FeaturesContainer, settings[metaFeatures.namespacedEntity_name.id] as string, "", id).keyed(keyGen)
            default:
                throw new Error(`can't deserialize a node of concept "${concept.qualifiedName()}" with ID "${concept.id}"`)
        }
    },
    setFeatureValue: (node, feature, value) => {
        updateSettings(node as unknown as Record<string, unknown>, feature, value)
    }
})


/**
 * An implementation of {@link ModelAPI} for instances of the LIonCore M3 (so M2s), where key = name.
 */
export const lioncoreAPI: ModelAPI<M3Concept> = lioncoreAPIWithKeyGen(simpleNameIsKeyGenerator)

