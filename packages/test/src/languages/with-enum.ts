import {chain, concatenator, LanguageFactory, lastOf} from "@lionweb/core"
import {hasher} from "@lionweb/utilities"


const factory = new LanguageFactory(
    "language-with-enum",
    "1",
    chain(concatenator("-"), hasher()),
    lastOf
)

const enum_ = factory.enumeration("MyEnum")
enum_.havingLiterals(
        factory.enumerationLiteral(enum_, "lit1"),
        factory.enumerationLiteral(enum_, "lit2"),
    )

const languageWithEnum = factory.language
    .havingEntities(enum_)


export {
    languageWithEnum
}

