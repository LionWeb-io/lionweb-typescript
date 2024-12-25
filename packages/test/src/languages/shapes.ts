import {builtinClassifiers, builtinPrimitives, chain, concatenator, LanguageFactory, lastOf} from "@lionweb/core"
import {hasher} from "@lionweb/utilities"


const factory = new LanguageFactory(
    "Shapes",
    "1",
    chain(concatenator("-"), hasher({ encoding: "base64" })),
    lastOf
)
export const shapesLanguage = factory.language

const Geometry = factory.concept("Geometry", false)
const Shape = factory.concept("Shape", true).implementing(builtinClassifiers.inamed)
export const Circle = factory.concept("Circle", false, Shape)
const Line = factory.concept("Line", false, Shape)
export const Coord = factory.concept("Coord", false)

const GeometryShapes = factory.containment(Geometry, "shapes").ofType(Shape).isMultiple().isOptional()
const LineStart = factory.containment(Line, "start").ofType(Coord)
const LineEnd = factory.containment(Line, "end").ofType(Coord)
const CircleCenter = factory.containment(Circle, "center").ofType(Coord)
const CircleRadius = factory.property(Circle, "r").ofType(builtinPrimitives.integerDatatype)

const CoordX = factory.property(Coord, "x").ofType(builtinPrimitives.integerDatatype)
const CoordY = factory.property(Coord, "y").ofType(builtinPrimitives.integerDatatype)
const CoordZ = factory.property(Coord, "z").ofType(builtinPrimitives.integerDatatype)

Geometry.havingFeatures(GeometryShapes)
Circle.havingFeatures(CircleRadius, CircleCenter)
Line.havingFeatures(LineStart, LineEnd)
Coord.havingFeatures(CoordX, CoordY, CoordZ)

export const Annotated = factory.annotation("Annotated").annotating(Shape)

shapesLanguage.havingEntities(Coord, Geometry, Shape, Circle, Line, Annotated)

