import {Classifier, Concept, Feature, Language, LanguageEntity, PrimitiveType} from "../types.ts"
import {LanguageFactory} from "../factory.ts"
import {
    checkDefinedData,
    checkUniqueData,
    checkUniqueId,
    checkValidId,
    hashingIdGen,
    wrapIdGen
} from "../../id-generation.ts"
import {EClassifier, EcoreXml, EStructuralFeature} from "./types.ts"
import {ConceptType, keyOf, namedsOf, qualifiedNameOf} from "../functions.ts"
import {booleanDatatype, intDatatype, stringDatatype} from "../builtins.ts"
import {duplicatesAmong} from "../../utils/grouping.ts"
import {asArray} from "../../utils/array-helpers.ts"


const localRefPrefix = "#//"
const deref = (typeDescriptor: string): string =>
    typeDescriptor.startsWith(localRefPrefix)
        ? typeDescriptor.substring(localRefPrefix.length)
        : typeDescriptor


/**
 * Converts a parsed Ecore XML metamodel (file) to a {@link Language LIonCore/M3 instance}.
 */
export const asLIonCoreLanguage = (ecoreXml: EcoreXml, version: string): Language => {

    const ePackage = ecoreXml["ecore:EPackage"]
    // TODO (#10)  an Ecore XML can contain multiple EPackage-s
    const factory = new LanguageFactory(
        ePackage["@name"],
        version,
        wrapIdGen(
            hashingIdGen(),
            checkDefinedData,
            checkUniqueData,
            checkValidId,
            checkUniqueId
        )
    )


    // phase 1: convert EClassifiers but without their EStructuralFeatures (in the case of EClasses)

    const convertEClassifier = (eClassifier: EClassifier): ConceptType =>
        factory.concept(eClassifier["@name"], false)
    // TODO (#10)  ConceptInterface, Enumeration

    const convertedEClassifiers: [eClassifier: EClassifier, element: LanguageEntity][] =
        ePackage["eClassifiers"]
            .map((eClassifier) =>
                [eClassifier, convertEClassifier(eClassifier)]
            )

    const eClassifierConversionFor = (eClassifierName: string): LanguageEntity =>
        convertedEClassifiers
            .find(([source, _]) => source["@name"] === eClassifierName)![1]


    // phase 2: also convert features of EClasses

    const convertEDataType = (eDataType: string): PrimitiveType => {
        switch (eDataType) {
            case "ecore:EDataType http://www.eclipse.org/emf/2002/Ecore#//EString":
            case "ecore:EDataType http://www.eclipse.org/emf/2003/XMLType#//String":
                return stringDatatype
            case "ecore:EDataType http://www.eclipse.org/emf/2003/XMLType#//Boolean":
                return booleanDatatype
            case "ecore:EDataType http://www.eclipse.org/emf/2003/XMLType#//Int":
                return intDatatype
            default:
                throw new Error(`don't know what to convert this EDataType ref. descriptor to: ${eDataType}`)
        }
    }

    const convertEStructuralFeature = (container: Classifier, feature: EStructuralFeature): Feature => {
        const metaType = feature["@xsi:type"]
        const name = feature["@name"]
        switch (metaType) {
            case "ecore:EAttribute": {
                const property = factory.property(container, name)
                    .ofType(convertEDataType(feature["@eType"]))
                if (feature["@lowerBound"] === "0") {
                    property.isOptional()
                }
                return property
            }
            case "ecore:EReference": {
                const link = (
                        feature["@containment"]
                            ? factory.containment(container, name)
                            : factory.reference(container, name)
                    )
                        .ofType(eClassifierConversionFor(deref(feature["@eType"])) as Classifier)
                if (feature["@lowerBound"] === "0") {
                    link.isOptional()
                }
                if (feature["@upperBound"] === "-1") {
                    link.isMultiple()
                }
                return link
            }
            default:
                throw new Error(`feature of meta type ${metaType} not handled`)
        }
    }

    convertedEClassifiers.forEach(([source, target]) => {
        if (source["@xsi:type"] === "ecore:EClass") {
            const eClass = source
            const container = target as Classifier
            container
                .havingFeatures(
                    ...asArray(source.eStructuralFeatures)
                        .map((feature) =>
                            convertEStructuralFeature(container, feature)
                        )
                )
            if (eClass["@eSuperTypes"] !== undefined) {
                (target as Concept).extends = eClassifierConversionFor(deref(eClass["@eSuperTypes"])) as Concept
            }
        }
    })


    // phase 3: put all converted things into the metamodel

    factory.language
        .havingEntities(...convertedEClassifiers.map(([_, mmElement]) => mmElement))

    // phase 4: dedup keys (crudely, using the qualified name) where necessary

    Object.entries(duplicatesAmong(namedsOf(factory.language), keyOf))
        .forEach(([_, mmElements]) => {
            mmElements.forEach((mmElement) => mmElement.havingKey(qualifiedNameOf(mmElement, "_")))
        })

    return factory.language
}

