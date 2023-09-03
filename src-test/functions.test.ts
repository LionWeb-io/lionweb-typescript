import {assertEquals} from "./deps.ts"
import {containmentChain, Node} from "../src/index.ts"


Deno.test("functions", async (tctx) => {

    await tctx.step("containmentChain", () => {
        const node1: Node = { id: "1" }
        const node2: Node = { id: "2", parent: node1 }
        const node3: Node = { id: "3", parent: node1 }
        const node4: Node = { id: "4", parent: node2 }
        assertEquals(containmentChain(node1), [node1])
        assertEquals(containmentChain(node2), [node2, node1])
        assertEquals(containmentChain(node3), [node3, node1])
        assertEquals(containmentChain(node4), [node4, node2, node1])
    })

})

