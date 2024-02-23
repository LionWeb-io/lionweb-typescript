```mermaid
classDiagram

  class Annotation
  Classifier <|-- Annotation

  class Classifier
  <<Abstract>> Classifier
  LanguageEntity <|-- Classifier

  class Concept {
    +Boolean abstract
    +Boolean partition
  }
  Classifier <|-- Concept

  class Containment
  Link <|-- Containment

  class DataType
  <<Abstract>> DataType
  LanguageEntity <|-- DataType

  class Enumeration
  DataType <|-- Enumeration

  class EnumerationLiteral

  class Feature {
    +Boolean optional
  }
  <<Abstract>> Feature

  class IKeyed {
    +String key
  }
  <<Interface>> IKeyed
  INamed <|-- IKeyed

  class Interface
  Classifier <|-- Interface

  class <<partition>> Language {
    +String version
  }

  class LanguageEntity
  <<Abstract>> LanguageEntity

  class Link {
    +Boolean multiple
  }
  <<Abstract>> Link
  Feature <|-- Link

  class PrimitiveType
  DataType <|-- PrimitiveType

  class Property
  Feature <|-- Property

  class Reference
  Link <|-- Reference


  Annotation "*" --> "0..1" Classifier: annotates
  Annotation "*" --> "0..1" Annotation: extends
  Annotation "*" --> "*" Interface: implements
  Classifier "1" o--> "*" Feature: features
  Concept "*" --> "0..1" Concept: extends
  Concept "*" --> "*" Interface: implements


  Enumeration "1" o--> "*" EnumerationLiteral: literals



  Interface "*" --> "*" Interface: extends
  Language "1" o--> "*" LanguageEntity: entities
  Language "*" --> "*" Language: dependsOn

  Link "*" --> "1" Classifier: type

  Property "*" --> "1" DataType: type


```
