import {chain, concatenator, LanguageFactory, lastOf} from "@lionweb/core"
import {hasher} from "@lionweb/utilities"


const factory = new LanguageFactory(
    "WithEnum",
    "1",
    chain(concatenator("-"), hasher()),
    lastOf
)

const myEnum = factory.enumeration("MyEnum")
myEnum.havingLiterals(
        factory.enumerationLiteral(myEnum, "lit1"),
        factory.enumerationLiteral(myEnum, "lit2"),
    )

const enumHolder = factory.concept("EnumHolder", false)
const enumHolder_enumValue = factory.property(enumHolder, "enumValue").ofType(myEnum)
enumHolder.havingFeatures(enumHolder_enumValue)

const languageWithEnum = factory.language
    .havingEntities(
        myEnum,
        enumHolder
    )


export {
    languageWithEnum
}

