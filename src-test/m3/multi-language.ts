import {LanguageFactory} from "../../src-pkg/index.js"
import {hashingIdGen} from "../../src-utils/id-generation.js"
import {library, libraryLanguage} from "./library-language.js"


const factory = new LanguageFactory("multi", "1", hashingIdGen())
export const multiLanguage = factory.language.dependingOn(libraryLanguage)

const container = factory.concept("Container", false)
const container_libraries = factory.containment(container, "libraries").ofType(library).isMultiple()

container.havingFeatures(container_libraries)

multiLanguage.havingEntities(container)

