import { metaTypedBasedClassifierDeducerFor, qualifiedNameOf } from "./functions.js"
import { LionWebVersion } from "./version.js"
import { defaultLionWebVersion } from "./versions.js"
import { Reader } from "../reading.js"
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
import { updateSettingsNameBased, Writer } from "../writing.js"


/**
 * @return an instance of {@link Reader} to read instances of the LionCore M3 (so M2s),
 * according to the specified {@link LionWebVersion LionWeb `version`}.
 */
export const lioncoreReaderFor = (version: LionWebVersion): Reader<M3Concept> => ({
    classifierOf: metaTypedBasedClassifierDeducerFor(version.lioncoreFacade.language),
    getFeatureValue: (node, feature) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (node as any)[feature.name], // (mirrors name-based update of settings)
    enumerationLiteralFrom: (value, _) => value as EnumerationLiteral | null
})

/**
 * An instance of {@link Reader} to read instances of the LionCore M3 (so M2s),
 * according to the 2023.1 version of LionWeb.
 *
 * @deprecated Use {@link lioncoreReaderFor} instead.
 */
export const lioncoreReader: Reader<M3Concept> = lioncoreReaderFor(defaultLionWebVersion)

/**
 * Alias for {@link lioncoreReader}, kept for backward compatibility, and to be removed later.
 *
 * @deprecated Use {@link lioncoreReaderFor} instead (skipping `lioncoreReader`).
 */
export const lioncoreExtractionFacade = lioncoreReader


/**
 * An instance of {@link Writer} for instances of the LionCore M3 (so M2s),
 * according to the specified {@link LionWebVersion LionWeb `version`}.
 */
export const lioncoreWriterFor = (version: LionWebVersion): Writer<M3Concept> => {
    const { lioncoreFacade, builtinsFacade } = version
    const { ikeyed_key } = lioncoreFacade.metaFeatures
    const { inamed_name } = builtinsFacade.features
    const { metaConcepts, metaFeatures } = lioncoreFacade
    return {
        nodeFor: (parent, classifier, id, propertySettings) => {
            switch (classifier.key) {
                case metaConcepts.annotation.key:
                    return new Annotation(
                        parent as Language,
                        propertySettings[inamed_name.key] as string,
                        propertySettings[ikeyed_key.key] as string,
                        id
                    )
                case metaConcepts.concept.key:
                    return new Concept(
                        parent as Language,
                        propertySettings[inamed_name.key] as string,
                        propertySettings[ikeyed_key.key] as string,
                        id,
                        propertySettings[metaFeatures.concept_abstract.key] as boolean
                    )
                case metaConcepts.interface.key:
                    return new Interface(
                        parent as Language,
                        propertySettings[inamed_name.key] as string,
                        propertySettings[ikeyed_key.key] as string,
                        id
                    )
                case metaConcepts.containment.key:
                    return new Containment(
                        parent as Classifier,
                        propertySettings[inamed_name.key] as string,
                        propertySettings[ikeyed_key.key] as string,
                        id
                    )
                case metaConcepts.enumeration.key:
                    return new Enumeration(
                        parent as Language,
                        propertySettings[inamed_name.key] as string,
                        propertySettings[ikeyed_key.key] as string,
                        id
                    )
                case metaConcepts.enumerationLiteral.key:
                    return new EnumerationLiteral(
                        parent as Enumeration,
                        propertySettings[inamed_name.key] as string,
                        propertySettings[ikeyed_key.key] as string,
                        id
                    )
                case metaConcepts.language.key:
                    return new Language(
                        propertySettings[inamed_name.key] as string,
                        propertySettings[metaFeatures.language_version.key] as string,
                        id,
                        propertySettings[metaFeatures.ikeyed_key.key] as string
                    )
                case metaConcepts.primitiveType.key:
                    return new PrimitiveType(
                        parent as Language,
                        propertySettings[inamed_name.key] as string,
                        propertySettings[ikeyed_key.key] as string,
                        id
                    )
                case metaConcepts.property.key:
                    return new Property(
                        parent as Classifier,
                        propertySettings[inamed_name.key] as string,
                        propertySettings[ikeyed_key.key] as string,
                        id
                    )
                case metaConcepts.reference.key:
                    return new Reference(
                        parent as Classifier,
                        propertySettings[inamed_name.key] as string,
                        propertySettings[ikeyed_key.key] as string,
                        id
                    )
                default:
                    throw new Error(
                        `don't know a node of concept ${qualifiedNameOf(classifier)} with key ${classifier.key} that's not in LionCore M3`
                    )
            }
        },
        setFeatureValue: (node, feature, value) => {
            updateSettingsNameBased(node as unknown as Record<string, unknown>, feature, value)
        },
        encodingOf: literal => literal
    }
}

/**
 * An instance of {@link Writer} for instances of the LionCore M3 (so M2s),
 * according to the 2023.1 LionWeb version.
 *
 * @deprecated Use {@link lioncoreWriterFor} instead.
 */
export const lioncoreWriter: Writer<M3Concept> = lioncoreWriterFor(defaultLionWebVersion)

/**
 * Alias for {@link lioncoreWriter}, kept for backward compatibility, and to be deprecated and removed later.
 *
 * @deprecated Use {@link lioncoreWriterFor} instead (skipping `lioncoreWrite` altogether).
 */
export const lioncoreInstantationFacade = lioncoreWriter

