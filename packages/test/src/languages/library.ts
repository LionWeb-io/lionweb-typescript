import { builtinPrimitives, LanguageFactory } from "@lionweb/core"
import { chain, concatenator, lastOf } from "@lionweb/ts-utils"
import { hasher } from "@lionweb/utilities"

const factory = new LanguageFactory("library", "1", chain(concatenator("-"), hasher()), lastOf)
export const libraryLanguage = factory.language

const { integerDataType, stringDataType } = builtinPrimitives

const book = factory.concept("Book", false)
const bookType = factory.enumeration("BookType")
factory.enumerationLiteral(bookType, "Normal")
factory.enumerationLiteral(bookType, "Special")

export const library = factory.concept("Library", false)
const writer = factory.concept("Writer", false)
const guideBookWriter = factory.concept("GuideBookWriter", false, writer)
const specialistBookWriter = factory.concept("SpecialistBookWriter", false, writer)

factory.property(library, "name").ofType(stringDataType).havingKey("library_Library_name")
factory.containment(library, "books").ofType(book).isMultiple()

factory.property(book, "title").ofType(stringDataType)
factory.property(book, "pages").ofType(integerDataType)
factory.reference(book, "author").ofType(writer)
factory.property(book, "type").ofType(bookType).isOptional()

factory.property(writer, "name").ofType(stringDataType).havingKey("library_Writer_name")
// Note: writers are _not_ contained in the library (node) itself, so are separate nodes.

factory.property(guideBookWriter, "countries").ofType(stringDataType)

factory.property(specialistBookWriter, "subject").ofType(stringDataType)
