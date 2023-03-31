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
  LanguageElement <|-- DataType

  class Enumeration
  DataType <|-- Enumeration

  class EnumerationLiteral
  NamespacedEntity <|-- EnumerationLiteral

  class Feature {
    +Boolean optional
    +Boolean computed
  }
  <<Abstract>> Feature
  NamespacedEntity <|-- Feature

  class FeaturesContainer {
    +allFeatures() : List~Feature~?
  }
  <<Abstract>> FeaturesContainer
  LanguageElement <|-- FeaturesContainer

  class Language {
    +String name
    +String version
  }

  class LanguageElement
  <<Abstract>> LanguageElement
  NamespacedEntity <|-- LanguageElement

  class Link {
    +Boolean multiple
  }
  <<Abstract>> Link
  Feature <|-- Link

  class NamespaceProvider {
    +namespaceQualifier() : String
  }
  <<Interface>> NamespaceProvider

  class NamespacedEntity {
    +String name
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
  Language "1" o-- "*" LanguageElement: elements
  Language "*" -- "*" Language: dependsOn

  Link "*" -- "1" FeaturesContainer: type



  Property "*" -- "1" DataType: type


```
