import {Id} from "@lionweb/core"

export type BaseNode = {
    id: Id
    classifier: string
    annotations: BaseNode[]
}

