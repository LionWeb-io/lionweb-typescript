import { Comparer, lexiComparer, mappedLexiComparer, regularStringComparer, sorterWith } from "@lionweb/ts-utils"
import { expect } from "chai"

describe("comparer", () => {

    it("regularStringComparer works as expected", () => {
        expect(regularStringComparer("x", "x")).to.eql(0)
        expect(regularStringComparer("a", "b")).to.eql(-1)
        expect(regularStringComparer("b", "a")).to.eql(1)

        expect(regularStringComparer("xxx", "x")).to.eql(1)
        expect(regularStringComparer("xyz", "xxx")).to.eql(1)
    })

    const ascendingNumComparer: Comparer<number> = (l, r) =>
        l === r
            ? 0
            : (l < r ? -1 : 1)

    it("ascendingNumComparer sorts ascending", () => {
        expect(sorterWith(ascendingNumComparer)([3, 5, -1, 0, 2])).to.eql([-1, 0, 2, 3, 5])
    })

    const evenOverOddComparer: Comparer<number> = (l, r) =>
        l%2 === r%2
            ? 0 // (use ascendingNumComparer here, to also sort within even and odds)
            : (l%2 === 0 ? -1 : 1)

    it("evenOverOddComparer sorts evens before odds", () => {
        expect(sorterWith(evenOverOddComparer)([3, 5, -1, 2, 0])).to.eql([2, 0, 3, 5, -1])
    })

    it("lexiComposed with 0 comparers", () => {
        expect(
            () => lexiComparer([])
        ).to.throw("can’t (lexicographically) compose 0 comparers")
    })

    it("lexiComposed with 1 comparer", () => {
        const comp1 = lexiComparer([ascendingNumComparer])
        expect(comp1(0, 0)).to.eql(0)
        expect(comp1(1, 0)).to.eql(1)
        expect(comp1(0, 1)).to.eql(-1)
    })

    it("lexiComposed with 2 comparers", () => {
        const comp2 = lexiComparer([evenOverOddComparer, ascendingNumComparer])
        expect(comp2(0, 1)).to.eql(-1)
        expect(comp2(1, 3)).to.eql(-1)
        expect(comp2(3, 1)).to.eql(1)
    })


    type Tuple = { a: string, b: string, c: string }

    it("mappedLexiComposed with 3 comparers", () => {
        const comp3 = mappedLexiComparer<Tuple, string>([(t) => t.a, (t) => t.b, (t) => t.c], regularStringComparer)
        expect(comp3({ a: "a", b: "b", c: "c"   }, { a: "x", b: "y", c: "z" })).to.eql(-1)
        expect(comp3({ a: "a", b: "b", c: "c"   }, { a: "a", b: "b", c: "c" })).to.eql(0)
        expect(comp3({ a: "x", b: "y", c: "zzz" }, { a: "x", b: "y", c: "z" })).to.eql(1)
        expect(comp3({ a: "x", b: "b", c: "z"   }, { a: "x", b: "a", c: "z" })).to.eql(1)
        expect(comp3({ a: "x", b: "y", c: "a"   }, { a: "x", b: "y", c: "b" })).to.eql(-1)
    })

})

