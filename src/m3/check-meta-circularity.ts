import {lioncore} from "./meta-circularity.ts"
import {generateForMetamodel} from "./PlantUML-generator.ts"


Deno.writeTextFileSync("plantUML/metametamodel-gen.puml", generateForMetamodel(lioncore))

/*
 * TODOs:
 *
 *  1. check syntax
 *  2. check constraints
 *  3. generate types.ts? (then: sort type def.s alphabetically)
 */

