import {assert} from "chai"
const {deepEqual} = assert

import {containmentChain, Node} from "@lionweb/core"


describe("functions", () => {

    it("containmentChain", () => {
        const node1: Node = { id: "1" }
        const node2: Node = { id: "2", parent: node1 }
        const node3: Node = { id: "3", parent: node1 }
        const node4: Node = { id: "4", parent: node2 }
        deepEqual(containmentChain(node1), [node1])
        deepEqual(containmentChain(node2), [node2, node1])
        deepEqual(containmentChain(node3), [node3, node1])
        deepEqual(containmentChain(node4), [node4, node2, node1])
    })

})

