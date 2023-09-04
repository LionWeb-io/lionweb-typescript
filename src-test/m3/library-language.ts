import {LanguageFactory} from "../../src/m3/factory.ts"
import {hashingIdGen} from "../../src/id-generation.ts"
import {builtinPrimitives} from "../../src/m3/builtins.ts"


const factory = new LanguageFactory("library", "1", hashingIdGen())
export const libraryLanguage = factory.language

const {integerDatatype, stringDatatype} = builtinPrimitives

export const library = factory.concept("Library", false)
const book = factory.concept("Book", false)
const writer = factory.concept("Writer", false)
const guideBookWriter = factory.concept("GuideBookWriter", false, writer)
const specialistBookWriter = factory.concept("SpecialistBookWriter", false, writer)
const bookType = factory.enumeration("BookType")
bookType.havingLiterals(
        factory.enumerationLiteral(bookType, "Normal"),
        factory.enumerationLiteral(bookType, "Special"),
    )

const library_name = factory.property(library, "name").ofType(stringDatatype).havingKey("library_Library_name")
const library_books = factory.containment(library, "books").ofType(book).isMultiple()
library.havingFeatures(library_name, library_books)

const book_title = factory.property(book, "title").ofType(stringDatatype)
const book_pages = factory.property(book, "pages").ofType(integerDatatype)
const book_author = factory.reference(book, "author").ofType(writer)
const book_type = factory.property(book, "type").ofType(bookType).isOptional()
book.havingFeatures(book_title, book_pages, book_author, book_type)

const writer_name = factory.property(writer, "name").ofType(stringDatatype).havingKey("library_Writer_name")
writer.havingFeatures(writer_name)
// Note: writers are _not_ contained in the library (node) itself, so are separate nodes.

const guideBookWriter_countries = factory.property(guideBookWriter, "countries").ofType(stringDatatype)
guideBookWriter.havingFeatures(guideBookWriter_countries)

const specialistBookWriter_subject = factory.property(specialistBookWriter, "subject").ofType(stringDatatype)
specialistBookWriter.havingFeatures(specialistBookWriter_subject)


libraryLanguage.havingEntities(
    book,
    bookType,
    library,
    writer,
    guideBookWriter,
    specialistBookWriter
)

