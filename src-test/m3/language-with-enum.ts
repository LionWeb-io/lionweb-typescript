import {LanguageFactory} from "../../src/m3/factory.ts"
import {hashingIdGen} from "../../src/id-generation.ts"


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

