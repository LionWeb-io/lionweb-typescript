import { builtinPrimitives, LanguageFactory } from "@lionweb/core"
import { chain, concatenator, lastOf } from "@lionweb/ts-utils"
import { hasher } from "@lionweb/utilities"

const factory = new LanguageFactory("library", "1", chain(concatenator("-"), hasher()), lastOf)
export const minimalLibraryLanguage = factory.language

const { integerDataType, stringDataType } = builtinPrimitives

const library = factory.concept("Library", false)
const book = factory.concept("Book", false)
const guideBookWriter = factory.concept("GuideBookWriter", false)

const library_name = factory.property(library, "name").ofType(stringDataType).havingKey("library_Library_name")
const library_books = factory.containment(library, "books").ofType(book).isMultiple()
library.havingFeatures(library_name, library_books)

const book_title = factory.property(book, "title").ofType(stringDataType)
const book_pages = factory.property(book, "pages").ofType(integerDataType)
const book_type = factory.property(book, "type").ofType(stringDataType)
const book_author = factory.reference(book, "author").ofType(guideBookWriter)
book.havingFeatures(book_title, book_pages, book_type, book_author)

const writer_name = factory.property(guideBookWriter, "name").ofType(stringDataType).havingKey("library_Writer_name")
const guideBookWriter_countries = factory.property(guideBookWriter, "countries").ofType(stringDataType)
guideBookWriter.havingFeatures(guideBookWriter_countries, writer_name)

minimalLibraryLanguage.havingEntities(book, library, guideBookWriter)
