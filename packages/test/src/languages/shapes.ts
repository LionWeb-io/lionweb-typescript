import { LanguageFactory, LionWebVersions } from "@lionweb/core"
import { chain, concatenator, lastOf } from "@lionweb/ts-utils"
import { hasher } from "@lionweb/utilities"

const { builtinsFacade } = LionWebVersions.v2023_1

const factory = new LanguageFactory("Shapes", "1", chain(concatenator("-"), hasher({ encoding: "base64" })), lastOf)
export const shapesLanguage = factory.language

export const Coord = factory.concept("Coord", false)
const Geometry = factory.concept("Geometry", false)
const Shape = factory.concept("Shape", true).implementing(builtinsFacade.classifiers.inamed)
export const Circle = factory.concept("Circle", false, Shape)
const Line = factory.concept("Line", false, Shape)

const { integerDataType } = builtinsFacade.primitiveTypes

factory.containment(Geometry, "shapes").ofType(Shape).isMultiple().isOptional()
factory.containment(Line, "start").ofType(Coord)
factory.containment(Line, "end").ofType(Coord)
factory.property(Circle, "r").ofType(integerDataType)
factory.containment(Circle, "center").ofType(Coord)

factory.property(Coord, "x").ofType(integerDataType)
factory.property(Coord, "y").ofType(integerDataType)
factory.property(Coord, "z").ofType(integerDataType)

export const Annotated = factory.annotation("Annotated").annotating(Shape)
