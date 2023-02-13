```mermaid
classDiagram

  class Concept {
    +Boolean abstract
  }
  FeaturesContainer <|-- Concept

  class ConceptInterface
  FeaturesContainer <|-- ConceptInterface

  class Containment
  Link <|-- Containment

  class DataType
  <<Abstract>> DataType
  MetamodelElement <|-- DataType

  class Enumeration
  DataType <|-- Enumeration

  class EnumerationLiteral
  NamespacedEntity <|-- EnumerationLiteral

  class Feature {
    +Boolean optional
    +Boolean derived
  }
  <<Abstract>> Feature
  NamespacedEntity <|-- Feature

  class FeaturesContainer {
    +allFeatures() : List~Feature~?
  }
  <<Abstract>> FeaturesContainer
  MetamodelElement <|-- FeaturesContainer

  class Link {
    +Boolean multiple
  }
  <<Abstract>> Link
  Feature <|-- Link

  class Metamodel {
    +String name
  }

  class MetamodelElement
  <<Abstract>> MetamodelElement
  NamespacedEntity <|-- MetamodelElement

  class NamespaceProvider {
    +namespaceQualifier() : String
  }
  <<Interface>> NamespaceProvider

  class NamespacedEntity {
    +String simpleName
    +qualifiedName() : String
  }
  <<Abstract>> NamespacedEntity

  class PrimitiveType
  DataType <|-- PrimitiveType

  class Property {
    +Boolean programmatic
  }
  Feature <|-- Property

  class Reference
  Link <|-- Reference


  Concept "*" -- "0..1" Concept: extends
  Concept "*" -- "*" ConceptInterface: implements
  ConceptInterface "*" -- "*" ConceptInterface: extends


  Enumeration "1" o-- "*" EnumerationLiteral: literals


  FeaturesContainer "1" o-- "*" Feature: features
  Link "*" -- "1" FeaturesContainer: type
  Metamodel "1" o-- "*" MetamodelElement: elements
  Metamodel "*" -- "*" Metamodel: dependsOn




  Property "*" -- "1" DataType: type


```
