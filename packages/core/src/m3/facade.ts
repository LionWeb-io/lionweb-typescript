import {ExtractionFacade, InstantiationFacade, updateSettingsNameBased} from "../facade.js"
import {
    Annotation,
    Classifier,
    Concept,
    Containment,
    Enumeration,
    EnumerationLiteral,
    Interface,
    Language,
    M3Concept,
    PrimitiveType,
    Property,
    Reference
} from "./types.js"
import {builtinFeatures} from "./builtins.js"
import {lioncore, metaConcepts, metaFeatures} from "./lioncore.js"
import {metaTypedBasedClassifierDeducerFor, qualifiedNameOf} from "./functions.js"


const {inamed_name} = builtinFeatures
const {ikeyed_key} = metaFeatures


export const lioncoreExtractionFacade: ExtractionFacade<M3Concept> = ({
    classifierOf: metaTypedBasedClassifierDeducerFor(lioncore),
    getFeatureValue: (node, feature) =>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
        (node as any)[feature.name],    // (mirrors name-based update of settings)
    enumerationLiteralFrom: (value, _) => value as (EnumerationLiteral | null)
})


/**
 * @return An implementation of {@link InstantiationFacade} for instances of the LionCore M3 (so M2s).
 */
export const lioncoreInstantiationFacade: InstantiationFacade<M3Concept> = ({
    nodeFor: (parent, classifier, id, propertySettings) => {
        switch (classifier.key) {
            case metaConcepts.annotation.key:
                return new Annotation(parent as Language, propertySettings[inamed_name.key] as string, propertySettings[ikeyed_key.key] as string, id)
            case metaConcepts.concept.key:
                return new Concept(parent as Language, propertySettings[inamed_name.key] as string, propertySettings[ikeyed_key.key] as string, id, propertySettings[metaFeatures.concept_abstract.key] as boolean)
            case metaConcepts.interface.key:
                return new Interface(parent as Language, propertySettings[inamed_name.key] as string, propertySettings[ikeyed_key.key] as string, id)
            case metaConcepts.containment.key:
                return new Containment(parent as Classifier, propertySettings[inamed_name.key] as string, propertySettings[ikeyed_key.key] as string, id)
            case metaConcepts.enumeration.key:
                return new Enumeration(parent as Language, propertySettings[inamed_name.key] as string, propertySettings[ikeyed_key.key] as string, id)
            case metaConcepts.enumerationLiteral.key:
                return new EnumerationLiteral(parent as Enumeration, propertySettings[inamed_name.key] as string, propertySettings[ikeyed_key.key] as string, id)
            case metaConcepts.language.key:
                return new Language(propertySettings[inamed_name.key] as string, propertySettings[metaFeatures.language_version.key] as string, id, propertySettings[metaFeatures.ikeyed_key.key] as string)
            case metaConcepts.primitiveType.key:
                return new PrimitiveType(parent as Language, propertySettings[inamed_name.key] as string, propertySettings[ikeyed_key.key] as string, id)
            case metaConcepts.property.key:
                return new Property(parent as Classifier, propertySettings[inamed_name.key] as string, propertySettings[ikeyed_key.key] as string, id)
            case metaConcepts.reference.key:
                return new Reference(parent as Classifier, propertySettings[inamed_name.key] as string, propertySettings[ikeyed_key.key] as string, id)
            default:
                throw new Error(`can't deserialize a node of concept "${qualifiedNameOf(classifier)}" with key "${classifier.key}"`)
        }
    },
    setFeatureValue: (node, feature, value) => {
        updateSettingsNameBased(node as unknown as Record<string, unknown>, feature, value)
    },
    encodingOf: (literal) => literal
})

