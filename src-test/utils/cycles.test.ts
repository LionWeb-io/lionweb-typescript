import {assertEquals} from "../deps.ts"
import {cycleWith} from "../../src-pkg/index.ts"


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

    await tctx.step("should (only) detect attributes in cycles", () => {
        [ 1, 2, 3 ].forEach((n) => assertEquals(cycleWithObject(objects[n - 1]).length > 0, true, "in cycle"))
        assertEquals(cycleWithObject(objects[4 - 1]).length, 0, "not in cycle")
    })

    await tctx.step("should not detect no-cycles", () => {
        assertEquals(cycleWith(0, (x) => x < 4 ? [x + 1] : []), [])
    })

    await tctx.step("should detect a trivial cycle", () => {
        assertEquals(cycleWith(0, (_) => [0]), [0, 0])
    })

    await tctx.step("should detect a simple cycle", () => {
        assertEquals(cycleWith(0, (x) => [(x + 1) % 4]), [0, 1, 2, 3, 0])
    })

    await tctx.step("should detect a more complex cycle", () => {
        //          0      1         2      3      4      5
        const t = [ [1], [2, 3], [4], [5], [0], [] ]
        assertEquals(cycleWith(0, (x) => t[x]), [0, 1, 2, 4, 0])
    })


    /*
     * The following functions and unit test exist purely to support the unit test after them.
     */

    const collatz = (n: number) => n % 2 === 0 ? n/2 : (3 * n + 1)/2
    const inverseCollatz = (m: number) => (m % 3 === 2) ? [2 * m, (2 * m - 1)/3] : [2 * m]

    await tctx.step("inverse Collatz function works", () => {
        for (let n = 1; n < 1000; n++) {
            const inv = inverseCollatz(n)
            assertEquals(inv.length > 0, true)
            inv.forEach((m) => assertEquals(n, collatz(m)))
        }
    })

    await tctx.step("should detect a cycle in the Collatz graph", () => {
        const collatzAncestors = (n: number) => n < 100 ? inverseCollatz(n) : []
        assertEquals(cycleWith(1, collatzAncestors), [1, 2, 1])
    })

})

