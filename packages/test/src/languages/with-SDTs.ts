import { LanguageFactory, LionWebVersions } from "@lionweb/core"
import { concatenator, lastOf } from "@lionweb/ts-utils"

const { builtinsFacade } = LionWebVersions.v2024_1
const { booleanDataType, integerDataType } = builtinsFacade.primitiveTypes

const factory = new LanguageFactory("LanguageWithSDTs", "1", concatenator("-"), lastOf)

export const Currency = factory.enumeration("Currency").havingKey("currency")
;["EUR", "GBP"].map((cur) => factory.enumerationLiteral(Currency, cur).havingKey(`cur-${cur.toLowerCase()}`))

export const Amount = factory.structuredDataType("Amount").havingKey("amount")
factory.field(Amount, "value").ofType(integerDataType).havingKey("amount-val")
factory.field(Amount, "currency").ofType(Currency).havingKey("amount-cur")
factory.field(Amount, "digital").ofType(booleanDataType).havingKey("digital")

export const Decimal = factory.structuredDataType("Decimal").havingKey("decimal")
factory.field(Decimal, "int").ofType(integerDataType).havingKey("decimal-int")
factory.field(Decimal, "frac").ofType(integerDataType).havingKey("decimal-frac")

export const ComplexNumber = factory.structuredDataType("ComplexNumber").havingKey("complex")
factory.field(ComplexNumber, "real").ofType(Decimal).havingKey("complex-real")
factory.field(ComplexNumber, "imaginary").ofType(Decimal).havingKey("complex-imaginary")

export const FaultySDT = factory.structuredDataType("FaultySDT")
factory.field(FaultySDT, "typeless")

export const languageWithSDTs = factory.language

