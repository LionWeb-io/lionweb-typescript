```mermaid
classDiagram

  class ConceptDescription,<<Annotation>> ConceptDescription,ConceptDescription ..> Classifier {
    +String? conceptAlias
    +String? conceptShortDescription
    +String? helpUrl
  }

  class Deprecated,<<Annotation>> Deprecated,Deprecated ..> IKeyed {
    +String? comment
    +String? build
  }

  class KeyedDescription,<<Annotation>> KeyedDescription,KeyedDescription ..> IKeyed {
    +String? documentation
  }

  class ShortDescription,<<Annotation>> ShortDescription,ShortDescription ..> Node {
    +String? description
  }

  class VirtualPackage
  <<Annotation>> VirtualPackage
  VirtualPackage ..> Node
  INamed <|.. VirtualPackage




  KeyedDescription "*" --> "*" Node: seeAlso



```
