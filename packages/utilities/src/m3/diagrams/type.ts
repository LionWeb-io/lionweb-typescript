import { Language, LanguageEntity } from "@lionweb/core"

/**
 * Type def. to unify diagram generation functions type-wise.
 */
export type DiagramRenderer = (language: Language, focusEntities?: LanguageEntity[]) => string

