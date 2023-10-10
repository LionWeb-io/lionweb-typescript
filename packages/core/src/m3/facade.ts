import {ExtractionFacade, InstantiationFacade, updateSettingsNameBased} from "../facade.js"
import {
    Classifier,
    Concept,
    Containment,
    Enumeration,
    EnumerationLiteral,
    Interface,
    Language,
    M3Concept,
    M3Node,
    PrimitiveType,
    Property,
    Reference
} from "./types.js"
import {builtinFeatures} from "./builtins.js"
import {lioncore, metaConcepts, metaFeatures} from "./lioncore.js"
import {classBasedClassifierDeducerFor, qualifiedNameOf} from "./functions.js"
import {KeyGenerator, nameIsKeyGenerator} from "./key-generation.js"


const {inamed_name} = builtinFeatures


export const lioncoreExtractionFacade: ExtractionFacade<M3Concept> = ({
    supports: (node) => node instanceof M3Node,
    classifierOf: classBasedClassifierDeducerFor(lioncore),
    getFeatureValue: (node, feature) =>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
        (node as any)[feature.name],    // (mirrors name-based update of settings)
    enumerationLiteralFrom: (value, _) => value as (EnumerationLiteral | null)
})


/**
 * @return An implementation of {@link InstantiationFacade} for instances of the LionCore M3 (so M2s).
 * The returned {@link InstantiationFacade} uses the given {@link KeyGenerator key generator} to generate the keys of all objects in the M2.
 */
export const lioncoreInstantiationFacadeWithKeyGen = (keyGen: KeyGenerator): InstantiationFacade<M3Concept> => ({
    nodeFor: (parent, classifier, id, propertySettings) => {
        switch (classifier.key) {
            case metaConcepts.concept.key:
                return new Concept(parent as Language, propertySettings[inamed_name.key] as string, "", id, propertySettings[metaFeatures.concept_abstract.key] as boolean).keyed(keyGen)
            case metaConcepts.interface.key:
                return new Interface(parent as Language, propertySettings[inamed_name.key] as string, "", id).keyed(keyGen)
            case metaConcepts.containment.key:
                return new Containment(parent as Classifier, propertySettings[inamed_name.key] as string, "", id).keyed(keyGen)
            case metaConcepts.enumeration.key:
                return new Enumeration(parent as Language, propertySettings[inamed_name.key] as string, "", id).keyed(keyGen)
            case metaConcepts.enumerationLiteral.key:
                return new EnumerationLiteral(parent as Enumeration, propertySettings[inamed_name.key] as string, "", id).keyed(keyGen)
            case metaConcepts.language.key:
                return new Language(propertySettings[inamed_name.key] as string, propertySettings[metaFeatures.language_version.key] as string, id, propertySettings[metaFeatures.ikeyed_key.key] as string)
            case metaConcepts.primitiveType.key:
                return new PrimitiveType(parent as Language, propertySettings[inamed_name.key] as string, "", id).keyed(keyGen)
            case metaConcepts.property.key:
                return new Property(parent as Classifier, propertySettings[inamed_name.key] as string, "", id).keyed(keyGen)
            case metaConcepts.reference.key:
                return new Reference(parent as Classifier, propertySettings[inamed_name.key] as string, "", id).keyed(keyGen)
            default:
                throw new Error(`can't deserialize a node of concept "${qualifiedNameOf(classifier)}" with key "${classifier.key}"`)
        }
    },
    setFeatureValue: (node, feature, value) => {
        updateSettingsNameBased(node as unknown as Record<string, unknown>, feature, value)
    },
    encodingOf: (literal) => literal
})


/**
 * An implementation of {@link InstantiationFacade} for instances of the LionCore M3 (so M2s), where key = name.
 *
 * TODO  deprecate this: [de-]serialization of metamodels should be parametrized with key generation throughout
 */
export const lioncoreInstantiationFacade = lioncoreInstantiationFacadeWithKeyGen(nameIsKeyGenerator)

