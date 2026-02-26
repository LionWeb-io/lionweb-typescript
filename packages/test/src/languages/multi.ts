import { LanguageFactory } from "@lionweb/core"
import { chain, concatenator, lastOf } from "@lionweb/ts-utils"
import { hasher } from "@lionweb/utilities"
import { library, libraryLanguage } from "./library.js"

const factory = new LanguageFactory("multi", "1", chain(concatenator("-"), hasher()), lastOf)
export const multiLanguage = factory.language.dependingOn(libraryLanguage)

const container = factory.concept("Container", false)
factory.containment(container, "libraries").ofType(library).isMultiple()

