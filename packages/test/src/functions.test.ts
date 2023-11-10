import {assert} from "chai"
const {deepEqual} = assert

import {containmentChain, Id, Node} from "@lionweb/core"


describe("functions", () => {

    const node = (id: Id, parent?: Node): Node => ({
        id,
        annotations: [],
        parent
    })
    it("containmentChain", () => {
        const node1 = node("1")
        const node2 = node("2", node1)
        const node3 = node("3", node1)
        const node4 = node("4", node2)
        deepEqual(containmentChain(node1), [node1])
        deepEqual(containmentChain(node2), [node2, node1])
        deepEqual(containmentChain(node3), [node3, node1])
        deepEqual(containmentChain(node4), [node4, node2, node1])
    })

})

