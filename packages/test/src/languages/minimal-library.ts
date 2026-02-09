import { LanguageFactory, LionWebVersions } from "@lionweb/core"
import { chain, concatenator, lastOf } from "@lionweb/ts-utils"
import { hasher } from "@lionweb/utilities"

const factory = new LanguageFactory("library", "1", chain(concatenator("-"), hasher()), lastOf)

/**
 * An M2 for a library that’s “unrolled” w.r.t. hierarchy,
 * e.g. instead of implementing the built-in `INamed` interface, a string-typed `name` property is added.
 */
export const minimalLibraryLanguage = factory.language

const { integerDataType, stringDataType } = LionWebVersions.v2023_1.builtinsFacade.primitiveTypes

const library = factory.concept("Library", false)
const book = factory.concept("Book", false)
const guideBookWriter = factory.concept("GuideBookWriter", false)

factory.property(library, "name").ofType(stringDataType).havingKey("library_Library_name")
factory.containment(library, "books").ofType(book).isMultiple()

factory.property(book, "title").ofType(stringDataType)
factory.property(book, "pages").ofType(integerDataType)
factory.property(book, "type").ofType(stringDataType)
factory.reference(book, "author").ofType(guideBookWriter)

factory.property(guideBookWriter, "name").ofType(stringDataType).havingKey("library_Writer_name")
factory.property(guideBookWriter, "countries").ofType(stringDataType)

