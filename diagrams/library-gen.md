```mermaid
classDiagram

  class Book {
    +String title
    +Integer pages
  }

  class GuideBookWriter {
    +String countries
  }
  Writer <|-- GuideBookWriter

  class Library {
    +String name
  }

  class SpecialistBookWriter {
    +String subject
  }
  Writer <|-- SpecialistBookWriter

  class Writer {
    +String name
  }


  Book "*" -- "1" Writer: author

  Library "1" o-- "*" Book: books



```
