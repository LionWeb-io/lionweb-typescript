// const { throws } = require("chai").assert
// import {LanguageFactory} from "../../src-pkg/m3/factory.js"
// import {builtinPrimitives} from "../../src-pkg/m3/builtins.js"


/*
 * The following typechecks because all classes are effectively one type "class" as TypeScript is concerned.
 */
class A {
    with(_: _B) {}
}
class _B {}
const a = new A()
a.with(a)   // would be nice if this produced a compiler error!
/*
 * This means that we have to check arguments of a class-type "manually".
 */


describe("M3 types", () => {

    /*
    it("adding non-language elements to a language should fail", () => {
        const factory = new LanguageFactory("TestLanguage", "0")
        const {language} = factory
        const concept = factory.concept("Concept", false)
        const property = factory.property(concept, "property").ofType(builtinPrimitives.intDatatype)
        factory.language.havingEntities(concept)
        // TODO  understand why the following fails to compile after the addition of a getter "language" to LanguageEntity
        throws(() => {
            language.havingEntities(property),
            Error,
            `trying to add non-LanguageElements to Language: <Property>"property"`
        })
    })
     */

})

