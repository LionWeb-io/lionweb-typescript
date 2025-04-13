import { chain, concatenator, LanguageFactory, lastOf } from "@lionweb/core"
import { hasher } from "@lionweb/utilities"
import { library, libraryLanguage } from "./library.js"

const factory = new LanguageFactory("multi", "1", chain(concatenator("-"), hasher()), lastOf)
export const multiLanguage = factory.language.dependingOn(libraryLanguage)

const container = factory.concept("Container", false)
const container_libraries = factory.containment(container, "libraries").ofType(library).isMultiple()

container.havingFeatures(container_libraries)

multiLanguage.havingEntities(container)
