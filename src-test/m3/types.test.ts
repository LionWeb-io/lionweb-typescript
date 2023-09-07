// import {assertThrows} from "../deps.ts"
// import {LanguageFactory} from "../../src-pkg/m3/factory.ts"
// import {builtinPrimitives} from "../../src-pkg/m3/builtins.ts"


/*
 * The following typechecks because all classes are effectively one type “class” as TypeScript is concerned.
 */
class A {
    with(_: _B) {}
}
class _B {}
const a = new A()
a.with(a)   // would be nice if this produced a compiler error!
/*
 * This means that we have to check arguments of a class-type “manually”.
 */


Deno.test("M3 types", async (_) => {

    /*
    await tctx.step("adding non-language elements to a language should fail", () => {
        const factory = new LanguageFactory("TestLanguage", "0")
        const {language} = factory
        const concept = factory.concept("Concept", false)
        const property = factory.property(concept, "property").ofType(builtinPrimitives.intDatatype)
        factory.language.havingEntities(concept)
        // TODO  understand why the following fails to compile after the addition of a getter "language" to LanguageEntity
        assertThrows(() => {
            language.havingEntities(property),
            Error,
            `trying to add non-LanguageElements to Language: <Property>"property"`
        })
    })
     */

})

