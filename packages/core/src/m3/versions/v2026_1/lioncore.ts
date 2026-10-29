import { lioncoreBuiltinsFacade } from "./builtins.js"
import { LanguageFactory } from "../../factory.js"
import { LionCoreFacade, lioncoreIdGeneratorWithPostfix, localQualifiedName } from "../../lioncore-common.js"
import { ConceptModifier } from "../../types.js"


const factory = new LanguageFactory(
    "LionCore_M3",
    "2026.1",
    lioncoreIdGeneratorWithPostfix("-2026-1"),
    localQualifiedName
)
/*
 * ID: `-id-${key}-2026-1` — e.g. "-id-Concept-abstract-2026-1"
 * key: qualified name _without_ "LionCore_M3", dash-separated — e.g. "Concept-abstract"
 * resolveInfo: `LionWeb.LionCore_M3.${dotted key}` — e.g. "LionWeb.LionCore_M3.Concept.abstract"
 *  where <dotted key> is the qualified name _without_ "LionCore_M3", dot-separated.
 */

const { inamed } = lioncoreBuiltinsFacade.classifiers
const { booleanDataType, stringDataType } = lioncoreBuiltinsFacade.primitiveTypes

const ikeyed = factory.interface("IKeyed").extending(inamed)
const ikeyed_key = factory.property(ikeyed, "key").ofType(stringDataType)

const feature = factory.concept("Feature", ConceptModifier.abstract).implementing(ikeyed)
factory.property(feature, "optional").ofType(booleanDataType)

const property = factory.concept("Property", ConceptModifier.concrete, feature)
const property_type = factory.reference(property, "type")

const link = factory.concept("Link", ConceptModifier.abstract, feature)
factory.property(link, "multiple").ofType(booleanDataType)
const link_type = factory.reference(link, "type")

const containment = factory.concept("Containment", ConceptModifier.concrete, link)

const reference = factory.concept("Reference", ConceptModifier.concrete, link)

const languageEntity = factory.concept("LanguageEntity", ConceptModifier.abstract).implementing(ikeyed)

const classifier = factory.concept("Classifier", ConceptModifier.abstract, languageEntity)
factory.containment(classifier, "features").isOptional().isMultiple().ofType(feature)
link_type.ofType(classifier)

const annotation = factory.concept("Annotation", ConceptModifier.concrete, classifier)
factory.reference(annotation, "annotates").isOptional().ofType(classifier)
factory.reference(annotation, "extends").isOptional().ofType(annotation)
const annotation_implements = factory.reference(annotation, "implements").isMultiple().isOptional()

const concept = factory.concept("Concept", ConceptModifier.concrete, classifier)
const concept_abstract = factory.property(concept, "abstract").ofType(booleanDataType)
factory.property(concept, "partition").ofType(booleanDataType)
factory.reference(concept, "extends").isOptional().ofType(concept)
const concept_implements = factory.reference(concept, "implements").isOptional().isMultiple()

const interface_ = factory.concept("Interface", ConceptModifier.concrete, classifier)
factory.reference(interface_, "extends").isOptional().isMultiple().ofType(interface_)

annotation_implements.ofType(interface_)
concept_implements.ofType(interface_)

const dataType = factory.concept("DataType", ConceptModifier.abstract, languageEntity)
property_type.ofType(dataType)

const primitiveType = factory.concept("PrimitiveType", ConceptModifier.concrete, dataType)

const enumeration = factory.concept("Enumeration", ConceptModifier.concrete, dataType)
const enumeration_literals = factory.containment(enumeration, "literals").isMultiple().isOptional()
const enumerationLiteral = factory.concept("EnumerationLiteral", ConceptModifier.concrete).implementing(ikeyed)
enumeration_literals.ofType(enumerationLiteral)

const structuredDataType = factory.concept("StructuredDataType", ConceptModifier.concrete, dataType)
const structuredDataType_fields = factory.containment(structuredDataType, "fields").isMultiple()
const field = factory.concept("Field", ConceptModifier.concrete).implementing(ikeyed)
factory.reference(field, "type").ofType(dataType)
structuredDataType_fields.ofType(field)

const language = factory.concept("Language", ConceptModifier.concrete).implementing(ikeyed).isPartition()
const language_version = factory.property(language, "version").ofType(stringDataType)
factory.containment(language, "entities").isOptional().isMultiple().ofType(languageEntity)
factory.reference(language, "dependsOn").isOptional().isMultiple().ofType(language)


export const lioncoreFacade: LionCoreFacade = {
    language: factory.language,
    metaConcepts: {
        annotation,
        classifier,
        concept,
        interface: interface_,
        containment,
        enumeration,
        enumerationLiteral,
        field,
        ikeyed,
        language,
        primitiveType,
        property,
        reference,
        structuredDataType
    },
    metaFeatures: {
        concept_abstract,
        ikeyed_key,
        language_version
    }
}

