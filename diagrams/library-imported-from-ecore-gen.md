```mermaid
classDiagram

  class Book {
    +String title
    +int pages
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


  Book "*" -- "*" Writer: author

  Library "1" o-- "*" Book: books



```
