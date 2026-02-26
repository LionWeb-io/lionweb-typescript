import { LanguageFactory } from "@lionweb/core"
import { chain, concatenator, lastOf } from "@lionweb/ts-utils"
import { hasher } from "@lionweb/utilities"

const factory = new LanguageFactory("WithEnum", "1", chain(concatenator("-"), hasher()), lastOf)

const myEnum = factory.enumeration("MyEnum")
myEnum.havingLiterals(...[1, 2].map(i => factory.enumerationLiteral(myEnum, `literal${i}`).havingKey(`lit${i}`)))

const enumHolder = factory.concept("EnumHolder", false)
factory.property(enumHolder, "enumValue").ofType(myEnum)

export const languageWithEnum = factory.language

