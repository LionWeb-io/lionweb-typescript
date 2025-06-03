import { LionWebId } from "@lionweb/json"

export type BaseNode = {
    id: LionWebId
    classifier: string
    annotations: BaseNode[]
}
