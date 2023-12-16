import { JsonContext } from "../../issues/index.js"
import { LionWebJsonNode, LwJsonUsedLanguage } from "../../json/index.js"
import { Change } from "./Change.js"

export abstract class ChunkChange extends Change {
    constructor(public context: JsonContext) {
        super(context)
    }
}

export class SerializationFormatChange extends ChunkChange {
    readonly id = "SerializationFormatChange"

    constructor(
        public context: JsonContext,
        protected original: string,
        protected newValue: string,
    ) {
        super(context)
    }

    protected msg = () => `Serialization versions do not match: ${this.original} vs ${this.newValue}`
}

export class NodeRemoved extends ChunkChange {
    readonly id = "NodeRemoved"

    constructor(
        public context: JsonContext,
        public node: LionWebJsonNode,
    ) {
        super(context)
    }

    protected msg = () => `Node ${this.node.id} is removed`
}

export class NodeAdded extends ChunkChange {
    readonly id = "NodeAdded"

    constructor(
        public context: JsonContext,
        public node: LionWebJsonNode,
    ) {
        super(context)
    }

    protected msg = () => `Node ${this.node.id} is added`
}

export abstract class LanguageChange extends ChunkChange {
    constructor(
        public context: JsonContext,
        public language: LwJsonUsedLanguage,
    ) {
        super(context)
    }
}

export class LanguageRemoved extends LanguageChange {
    readonly id = "LanguageRemoved"
    protected msg = () => `Language with  key ${this.language.key} and version ${this.language.version} is removed`
}

export class LanguageAdded extends LanguageChange {
    readonly id = "LanguageAdded"
    protected msg = () => `Language with  key ${this.language.key} and version ${this.language.version} is added`
}
