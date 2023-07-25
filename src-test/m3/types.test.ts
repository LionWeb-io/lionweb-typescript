import {assertThrows} from "../deps.ts"
import {LanguageFactory} from "../../src/m3/factory.ts"
import {intDatatype} from "../../src/m3/builtins.ts"


/*
 * The following typechecks because all classes are effectively one type “class” as TypeScript is concerned.
 */
class A {
    with(e: B) {}
}
class B {}
const a = new A()
a.with(a)   // would be nice if this produced a compiler error!
/*
 * This means that we have to check arguments of a class-type “manually”.
 */


Deno.test("M3 types", async (tctx) => {

    await tctx.step("adding non-language elements to a language should fail", () => {
        const factory = new LanguageFactory("TestLanguage", "0")
        const {language} = factory
        const concept = factory.concept("Concept", false)
        const property = factory.property(concept, "property").ofType(intDatatype)
        factory.language.havingElements(concept)
        assertThrows(() => {
            language.havingElements(property),
            Error,
            `trying to add non-LanguageElements to Language: <Property>"property"`
        })
    })

})

