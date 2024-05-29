import {builtinPrimitives, chain, concatenator, LanguageFactory, lastOf} from "@lionweb/core"
import {hasher} from "@lionweb/utilities"


const factory = new LanguageFactory(
    "libraryWithDates",
    "1",
    chain(concatenator("-"), hasher()),
    lastOf
)
export const libraryWithDatesLanguage = factory.language

const {integerDatatype, stringDatatype} = builtinPrimitives

export const libraryWithDates = factory.concept("LibraryWithDates", false)
const book = factory.concept("Book", false)
const writer = factory.concept("Writer", false)
const guideBookWriter = factory.concept("GuideBookWriter", false, writer)
const specialistBookWriter = factory.concept("SpecialistBookWriter", false, writer)
const bookType = factory.enumeration("BookType")
bookType.havingLiterals(
        factory.enumerationLiteral(bookType, "Normal"),
        factory.enumerationLiteral(bookType, "Special")
    )
export const dateDatatype = factory.primitiveType("Date")

const library_name = factory.property(libraryWithDates, "name").ofType(stringDatatype).havingKey("library_Library_name")
const library_creationDate = factory.property(libraryWithDates, "creationDate").ofType(dateDatatype).havingKey("library_Library_creationDate")
const library_books = factory.containment(libraryWithDates, "books").ofType(book).isMultiple()
libraryWithDates.havingFeatures(library_name, library_books, library_creationDate)

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


libraryWithDatesLanguage.havingEntities(
    book,
    bookType,
    libraryWithDates,
    dateDatatype,
    writer,
    guideBookWriter,
    specialistBookWriter
)

