```mermaid
classDiagram

  class Annotation2
  <<Annotation>> Annotation2
  Annotation1 <|-- Annotation2
  Interface1 <|.. Annotation2

  class Annotation1
  <<Annotation>> Annotation1
  Annotation1 ..> Node





```
