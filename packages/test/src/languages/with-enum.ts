import {LanguageFactory} from "@lionweb/core"
import {hashingIdGen} from "@lionweb/utilities"


const factory = new LanguageFactory("language-with-enum", "1", hashingIdGen())

const enum_ = factory.enumeration("enum")
enum_.havingLiterals(
        factory.enumerationLiteral(enum_, "lit1"),
        factory.enumerationLiteral(enum_, "lit2"),
    )

const languageWithEnum = factory.language
    .havingEntities(enum_)


export {
    languageWithEnum
}

