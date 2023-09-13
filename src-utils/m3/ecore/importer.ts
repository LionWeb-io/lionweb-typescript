import {
    asArray,
    builtinPrimitives,
    checkDefinedData,
    checkUniqueData,
    checkUniqueId,
    checkValidId,
    Classifier,
    Concept,
    duplicatesAmong,
    Enumeration,
    Feature,
    keyOf,
    Language,
    LanguageEntity,
    LanguageFactory,
    namedsOf,
    PrimitiveType,
    qualifiedNameOf,
    wrapIdGen
} from "../../../src-pkg/index.js"
import {hashingIdGen} from "../../../src-utils/id-generation.js"
import {EClass, EClassifier, EcoreXml, EEnum, EStructuralFeature} from "./types.js"


const localRefPrefix = "#//"
/**
 * "Dereferences" a type descriptor string by removing the optional <pre>"#//"</pre> prefix.
 */
const deref = (typeDescriptor: string): string =>
    typeDescriptor.startsWith(localRefPrefix)
        ? typeDescriptor.substring(localRefPrefix.length)
        : typeDescriptor


const {booleanDatatype, integerDatatype, stringDatatype} = builtinPrimitives

const typeDesc2primitiveType: Record<string, PrimitiveType> = {
    "ecore:EDataType http://www.eclipse.org/emf/2002/Ecore#//EString": stringDatatype,
    "ecore:EDataType http://www.eclipse.org/emf/2003/XMLType#//String": stringDatatype,
    "ecore:EDataType http://www.eclipse.org/emf/2003/XMLType#//Boolean": booleanDatatype,
    "ecore:EDataType http://www.eclipse.org/emf/2003/XMLType#//Int": integerDatatype
}


/**
 * Converts a parsed Ecore XML metamodel (file) to a {@link Language LIonCore/M3 instance}.
 */
export const asLIonCoreLanguage = (ecoreXml: EcoreXml, version: string): Language => {

    const ePackage = ecoreXml["ecore:EPackage"]
    // TODO (#10)  an Ecore XML can contain multiple EPackage-s
    const factory = new LanguageFactory(
        ePackage["$"]["name"],
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

    const convertEClassifier = (eClassifier: EClassifier): LanguageEntity => {
        const xsiType = eClassifier["$"]["xsi:type"]
        if (xsiType === "ecore:EClass") {
            return factory.concept(eClassifier["$"]["name"], false)
        }
        if (xsiType === "ecore:EEnum") {
            return factory.enumeration(eClassifier["$"]["name"])
        }
        throw new Error(`don't know how to convert an EClassifier with descriptor "${xsiType}"`)
    }
    // TODO (#10)  ConceptInterface?

    const convertedEClassifiers: [eClassifier: EClassifier, element: LanguageEntity][] =
        ePackage["eClassifiers"]
            .map((eClassifier) =>
                [eClassifier, convertEClassifier(eClassifier)]
            )

    const eClassifierConversionFor = (eClassifierName: string): LanguageEntity =>
        convertedEClassifiers
            .find(([source, _]) => source["$"]["name"] === eClassifierName)![1]


    // phase 2: also convert features of EClasses

    const convertEStructuralFeature = (container: Classifier, feature: EStructuralFeature): Feature => {
        const metaType = feature["$"]["xsi:type"]
        const name = feature["$"]["name"]
        switch (metaType) {
            case "ecore:EAttribute": {
                const typeDesc = feature["$"]["eType"]
                const property = factory.property(container, name)
                    .ofType(
                        typeDesc in typeDesc2primitiveType
                            ? typeDesc2primitiveType[typeDesc]
                            : eClassifierConversionFor(deref(typeDesc))
                    )
                if (feature["$"]["lowerBound"] === "0") {
                    property.isOptional()
                }
                return property
            }
            case "ecore:EReference": {
                const link = (
                        feature["$"]["containment"]
                            ? factory.containment(container, name)
                            : factory.reference(container, name)
                    )
                        .ofType(eClassifierConversionFor(deref(feature["$"]["eType"])) as Classifier)
                if (feature["$"]["lowerBound"] === "0") {
                    link.isOptional()
                }
                if (feature["$"]["upperBound"] === "-1") {
                    link.isMultiple()
                }
                return link
            }
            default:
                throw new Error(`feature of meta type ${metaType} not handled`)
        }
    }

    convertedEClassifiers.forEach(([source, target]) => {
        const xsiType = source["$"]["xsi:type"]
        if (xsiType === "ecore:EClass") {
            const classifier = target as Classifier
            classifier
                .havingFeatures(
                    ...asArray((source as EClass).eStructuralFeatures)
                        .map((feature) =>
                            convertEStructuralFeature(classifier, feature)
                        )
                )
            if (source["$"]["eSuperTypes"] !== undefined) {
                (target as Concept).extends = eClassifierConversionFor(deref(source["$"]["eSuperTypes"])) as Concept
            }
        }
        if (xsiType === "ecore:EEnum") {
            const classifier = target as Enumeration
            classifier
                .havingLiterals(
                ...asArray((source as EEnum).eLiterals)
                    .map((literal) => factory.enumerationLiteral(classifier, literal["$"]["name"]))
                )
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

