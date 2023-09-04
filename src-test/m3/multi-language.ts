import {LanguageFactory} from "../../src/m3/factory.ts"
import {hashingIdGen} from "../../src/id-generation.ts"
import {library, libraryLanguage} from "./library-language.ts"


const factory = new LanguageFactory("multi", "1", hashingIdGen())
export const multiLanguage = factory.language.dependingOn(libraryLanguage)

const container = factory.concept("Container", false)
const container_libraries = factory.containment(container, "libraries").ofType(library).isMultiple()

container.havingFeatures(container_libraries)

multiLanguage.havingEntities(container)

