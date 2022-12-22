import {
    Concept,
    Feature,
    FeaturesContainer,
    Metamodel,
    MetamodelElement,
    PrimitiveType
} from "./types.ts"
import {MetamodelFactory} from "./factory.ts"
import {sha256IdGen} from "../id-generation.ts"
import {
    asArray,
    EClassifier,
    EcoreXml,
    EStructuralFeature
} from "./ecore-types.ts"
import {ConceptType} from "./functions.ts"


const refPrefix = "#//"
const deref = (typeDescriptor: string): string =>
    typeDescriptor.startsWith(refPrefix)
        ? typeDescriptor.substring(refPrefix.length)
        : typeDescriptor

export const asLIonCoreMetamodel = (ecoreXml: EcoreXml): Metamodel => {
    const ePackage = ecoreXml["ecore:EPackage"]
    // TODO  an Ecore XML can contain multiple EPackage-s
    const factory = new MetamodelFactory(ePackage["@name"], sha256IdGen())

    // TODO  obtain from a built-in, imported M3 instance
    const stringDatatype = factory.primitiveType("String")
    const booleanDatatype = factory.primitiveType("boolean")
    const intDatatype = factory.primitiveType("int")

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

    const convertEClassifier = (eClassifier: EClassifier): ConceptType =>
        factory.concept(eClassifier["@name"], false)
    // TODO  ConceptInterface, Enumeration

    const convertEStructuralFeature = (container: FeaturesContainer, feature: EStructuralFeature): Feature => {
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
                        .ofType(eClassifierConversionFor(deref(feature["@eType"])) as FeaturesContainer)
                if (feature["@lowerBound"] === "0") {
                    link.isOptional()
                }
                if (feature["@upperBound"] !== "1") {
                    link.isMultiple()
                }
                return link
            }
            default:
                    throw new Error(`feature of meta type ${metaType} not handled`)
        }
    }

    const convertedEClassifiers: [eClassifier: EClassifier, metamodelElement: MetamodelElement][] =
        ePackage["eClassifiers"]
            .map((eClassifier) =>
                [eClassifier, convertEClassifier(eClassifier)]
            )

    const eClassifierConversionFor = (eClassifierName: string): MetamodelElement =>
        convertedEClassifiers
            .find(([source, _]) => source["@name"] === eClassifierName)![1]

    convertedEClassifiers.forEach(([source, target]) => {
        if (source["@xsi:type"] === "ecore:EClass") {
            const eClass = source
            const container = target as FeaturesContainer
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

    factory.metamodel
        .havingElements(stringDatatype, booleanDatatype, intDatatype)
        .havingElements(...convertedEClassifiers.map(([_, mmElement]) => mmElement))

    return factory.metamodel
}

