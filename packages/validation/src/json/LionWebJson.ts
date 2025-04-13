import { LionWebJsonUsedLanguage } from "@lionweb/json"
import { LION_CORE_M3_KEY, LION_CORE_M3_VERSION } from "./M3definitions.js"

/**
 * The types defining the structure of the LionWeb JSON format.
 * @see https://lionweb-io.github.io/specification/serialization/serialization.html
 * We use types instead of classes, because the purpose is to define the Lionweb JSON to be sent over the line.
 */


export function isLionWebM3Language(language: LionWebJsonUsedLanguage): boolean {
    return language.key === LION_CORE_M3_KEY && language.version === LION_CORE_M3_VERSION
}
