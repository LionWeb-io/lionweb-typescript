import {
    assertEquals,
    assertFalse
} from "https://deno.land/std@0.160.0/testing/asserts.ts"

import {cycleWith, dependencyOrderOf} from "../cycles.ts"


const collatz = (n: number) => n % 2 === 0 ? n/2 : (3 * n + 1)/2
const inverseCollatz = (m: number) => (m % 3 === 2) ? [2 * m, (2 * m - 1)/3] : [2 * m]

Deno.test("Collatz shenanigans", async (tctx) => {

    await tctx.step("inverse Collatz function works", async () => {
        for (let n = 1; n < 1000; n++) {
            const inv = inverseCollatz(n)
            assertEquals(inv.length > 0, true)
            inv.forEach((m) => assertEquals(n, collatz(m)))
        }
    })

})

Deno.test("cycleWith", async (tctx) => {

    type Obj = {
        id: number
        ref: Obj | null
    }
    const refsIn = ({ref}: Obj): Obj[] => ref === null ? [] : [ref]

    const objects: Obj[] = [ 1, 2, 3, 4 ].map((n) => ({ id: n, ref: null }))
    objects[4 - 1].ref = objects[3 - 1]
    objects[3 - 1].ref = objects[2 - 1]
    objects[2 - 1].ref = objects[1 - 1]
    objects[1 - 1].ref = objects[3 - 1]

    const cycleWithObject = (obj: Obj) => cycleWith(obj, refsIn)

    await tctx.step("should (only) detect attributes in cycles", async () => {
        [ 1, 2, 3 ].forEach((n) => assertEquals(cycleWithObject(objects[n - 1]).length > 0, true, "in cycle"))
        assertEquals(cycleWithObject(objects[4 - 1]).length, 0, "not in cycle")
    })

    await tctx.step("should not detect no-cycles", async () => {
        assertEquals(cycleWith(0, (x) => x < 4 ? [x + 1] : []), [])
    })

    await tctx.step("should detect a trivial cycle", async () => {
        assertEquals(cycleWith(0, (x) => [0]), [0, 0])
    })

    await tctx.step("should detect a simple cycle", async () => {
        assertEquals(cycleWith(0, (x) => [(x + 1) % 4]), [0, 1, 2, 3, 0])
    })

    await tctx.step("should detect a more complex cycle", async () => {
        //          0      1         2      3      4      5
        const t = [ [1], [2, 3], [4], [5], [0], [] ]
        assertEquals(cycleWith(0, (x) => t[x]), [0, 1, 2, 4, 0])
    })

    await tctx.step("should detect a cycle in the Collatz graph", async () => {
        const collatzAncestors = (n: number) => n < 100 ? inverseCollatz(n) : []
        assertEquals(cycleWith(1, collatzAncestors), [1, 2, 1])
    })

})


Deno.test("topological sort (dependencyOrderOf)", async (tctx) => {

    type Ref = number | null
    type Obj = {
        id: number
        ref: Ref
    }
    const refsAsObjects = (refs: Ref[]): Obj[] => refs.map((ref, index) => ({ id: index + 1, ref }))
    const idsOf = <R>(objects: Obj[] | false): number[] | false =>
        objects === false
            ? false
            : objects.map(({id}) => id)

    /**
     * Curried dependencyOrderOf where each object is of the form { id: index + 1, ref: id | null }.
     */
    const dependencyOrderOfObjects = (objects: Obj[]) => dependencyOrderOf(
        objects,
        (current) => current.ref === null ? [] : [ objects[current.ref - 1] ]
    )

    await tctx.step("exercises for dependencyOrderOf", async () => {
        assertEquals(idsOf(dependencyOrderOfObjects(refsAsObjects([ null, null, 2, 3 ]))), [ 1, 2, 3, 4 ], "1.")
        assertEquals(idsOf(dependencyOrderOfObjects(refsAsObjects([ 2, 3, 4, null ]))), [ 4, 3, 2, 1 ], "2.")
        assertEquals(idsOf(dependencyOrderOfObjects(refsAsObjects([ null, 1, 1, 3 ]))), [ 1, 2, 3, 4 ], "3.")
        assertEquals(idsOf(dependencyOrderOfObjects(refsAsObjects([ 2, null, 1, 3 ]))), [ 2, 1, 3, 4 ], "4.")
    })

})


Deno.test("dependencyOrderOf", async (tctx) => {

    await tctx.step("should work for simple examples", async () => {
        // Note: this is the same example as for the case 'should not detect no-cycles' for 'cycleWith function'!
        assertEquals(dependencyOrderOf([0], (x) => x < 4 ? [x + 1] : []), [4, 3, 2, 1, 0])
    })

    await tctx.step("should detect cycles", async () => {
        // Note: same examples as for cases 'should detect a simple cycle' and 'should detect a more complex cycle' for 'cycleWithFor function'!
        assertFalse(dependencyOrderOf([0], (x) => [(x + 1) % 4]))
        //          0      1         2      3      4      5
        const t = [[1], [2, 3], [4], [5], [0], []]
        assertFalse(dependencyOrderOf([0], (x) => t[x]))
    })

    await tctx.step("should work for a more complex example", async () => {
        const t = [
            /*  0: */ [1, 2],
            /*  1: */ [3, 4],
            /*  2: */ [5, 6],
            /*  3: */ [7, 8],
            /*  4: */ [],
            /*  5: */ [],
            /*  6: */ [],
            /*  7: */ [],
            /*  8: */ []
        ]
        assertEquals(dependencyOrderOf([0], (x) => t[x]), [7, 8, 3, 4, 1, 5, 6, 2, 0])
        assertEquals(dependencyOrderOf([0, 1], (x) => t[x]), [7, 8, 3, 4, 1, 5, 6, 2, 0])
        assertEquals(dependencyOrderOf([0, 1, 2, 3, 4, 5, 6, 7, 8], (x) => t[x]), [7, 8, 3, 4, 1, 5, 6, 2, 0])
    })

    await tctx.step("should work for a bifurcated example", async () => {
        const t = [
            /*  0: */ [1],
            /*  1: */ [2, 4],
            /*  2: */ [3],
            /*  3: */ [7],
            /*  4: */ [5],
            /*  5: */ [6],
            /*  6: */ [7],
            /*  7: */ [8],
            /*  8: */ []
        ]
        assertEquals(dependencyOrderOf([0], (x) => t[x]), [8, 7, 3, 2, 6, 5, 4, 1, 0])
        assertEquals(dependencyOrderOf([0, 1, 2, 3, 4, 5, 6, 7, 8], (x) => t[x]), [8, 7, 3, 2, 6, 5, 4, 1, 0])
    })

})

