import {MetamodelFactory} from "../factory.ts"
import {hashingIdGen} from "../../id-generation.ts"
import {intDatatype, stringDatatype} from "../builtins.ts"


const factory = new MetamodelFactory("library", hashingIdGen())
export const libraryMetamodel = factory.metamodel


const library = factory.concept("Library", false)
const book = factory.concept("Book", false)
const writer = factory.concept("Writer", false)
const guideBookWriter = factory.concept("GuideBookWriter", false, writer)
const specialistBookWriter = factory.concept("SpecialistBookWriter", false, writer)

const library_name = factory.property(library, "name").ofType(stringDatatype)
const library_books = factory.containment(library, "books").ofType(book).isMultiple()
library.havingFeatures(library_name, library_books)

const book_title = factory.property(book, "title").ofType(stringDatatype)
const book_pages = factory.property(book, "pages").ofType(intDatatype)
const book_author = factory.reference(book, "author").ofType(writer).isMultiple()
book.havingFeatures(book_title, book_pages, book_author)

const writer_name = factory.property(writer, "name").ofType(stringDatatype)
writer.havingFeatures(writer_name)

const guideBookWriter_countries = factory.property(guideBookWriter, "countries").ofType(stringDatatype)
guideBookWriter.havingFeatures(guideBookWriter_countries)

const specialistBookWriter_subject = factory.property(specialistBookWriter, "subject").ofType(stringDatatype)
specialistBookWriter.havingFeatures(specialistBookWriter_subject)


libraryMetamodel.havingElements(
    book,
    library,
    writer,
    guideBookWriter,
    specialistBookWriter
)

