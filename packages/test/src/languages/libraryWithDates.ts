import { LanguageFactory, LionWebVersions } from "@lionweb/core"
import { chain, concatenator, lastOf } from "@lionweb/ts-utils"
import { hasher } from "@lionweb/utilities"

const factory = new LanguageFactory("libraryWithDates", "1", chain(concatenator("-"), hasher()), lastOf)
export const libraryWithDatesLanguage = factory.language

const { integerDataType, stringDataType } = LionWebVersions.v2023_1.builtinsFacade.primitiveTypes

export const libraryWithDates = factory.concept("LibraryWithDates", false)
const book = factory.concept("Book", false)
const writer = factory.concept("Writer", false)
const guideBookWriter = factory.concept("GuideBookWriter", false, writer)
const specialistBookWriter = factory.concept("SpecialistBookWriter", false, writer)
const bookType = factory.enumeration("BookType")
factory.enumerationLiteral(bookType, "Normal")
factory.enumerationLiteral(bookType, "Special")
export const dateDataType = factory.primitiveType("Date")

factory.property(libraryWithDates, "name").ofType(stringDataType).havingKey("library_Library_name")
factory.property(libraryWithDates, "creationDate").ofType(dateDataType).havingKey("library_Library_creationDate")
factory.containment(libraryWithDates, "books").ofType(book).isMultiple()

factory.property(book, "title").ofType(stringDataType)
factory.property(book, "pages").ofType(integerDataType)
factory.reference(book, "author").ofType(writer)
factory.property(book, "type").ofType(bookType).isOptional()

factory.property(writer, "name").ofType(stringDataType).havingKey("library_Writer_name")
// Note: writers are _not_ contained in the library (node) itself, so are separate nodes.

factory.property(guideBookWriter, "countries").ofType(stringDataType)

factory.property(specialistBookWriter, "subject").ofType(stringDataType)

