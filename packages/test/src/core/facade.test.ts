import { childrenExtractorUsing, dynamicExtractionFacade, DynamicNode, Node, nodesExtractorUsing } from "@lionweb/core"

import { Annotated, Circle, Coord } from "../languages/shapes.js"
import { deepEqual } from "../test-utils/assertions.js"

const center = {
    id: "center",
    classifier: Coord,
    settings: {
        x: 1,
        y: 2,
        z: 3
    },
    annotations: [
        {
            id: "annotated",
            classifier: Annotated,
            settings: {},
            annotations: []
        }
    ]
}

const circle: DynamicNode = {
    id: "circle",
    classifier: Circle,
    settings: {
        center,
        radius: 5
    },
    annotations: []
}

describe("annotations are extracted", () => {
    const idOf = ({ id }: Node) => id

    it("by childrenExtractorUsing", () => {
        deepEqual(childrenExtractorUsing(dynamicExtractionFacade)(circle).map(idOf), ["center"])
        deepEqual(childrenExtractorUsing(dynamicExtractionFacade)(center).map(idOf), ["annotated"])
    })

    it("by nodesExtractorUsing", () => {
        deepEqual(nodesExtractorUsing(dynamicExtractionFacade)(circle).map(idOf), ["circle", "center", "annotated"])
    })
})
