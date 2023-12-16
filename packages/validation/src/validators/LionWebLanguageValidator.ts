import { IncorrectLionCoreVersion_Issue, NotLionCoreLanguageKey_Issue, NumberOfLanguagesUsed_Issue } from "../issues/LanguageIssues.js"
import { JsonContext } from "./../issues/JsonContext.js"
import { LionWebJsonChunk } from "../json/LionWebJson.js"
import { LionWebJsonChunkWrapper } from "../json/LionWebJsonChunkWrapper.js"
import { ValidationResult } from "./ValidationResult.js"

export class LionWebLanguageValidator {
    validationResult: ValidationResult

    constructor() {
        this.validationResult = new ValidationResult()
    }

    /**
     * check JSON as in `check`, but also check whether the metamoddel is a Language.
     * @param obj
     */
    checkLanguage(chunk: LionWebJsonChunk) {
        // TODO Vaalidate syntax first via LionWebSyntaxValidator !!!
        if (chunk.languages.length !== 1) {
            // Check whether the LionCore M3 is the only used language, then this is a language model.
            this.validationResult.issue(new NumberOfLanguagesUsed_Issue(new JsonContext(null, ["languages"]), chunk.languages.length))
            return
        }
        const usedLanguage = chunk.languages[0]
        if (usedLanguage.key !== "LionCore-M3") {
            this.validationResult.issue(new NotLionCoreLanguageKey_Issue(new JsonContext(null, ["languages", 0]), usedLanguage.key))
        }
        if (usedLanguage.version !== "1") {
            this.validationResult.issue(new IncorrectLionCoreVersion_Issue(new JsonContext(null, ["languages", 0]), usedLanguage.version))
        }
        const chunkWrapper = new LionWebJsonChunkWrapper(chunk)
        const languageNodes = chunkWrapper.findNodesOfConcept("Language")
        if (languageNodes.length !== 1) {
            // TODO Better error handling.
            console.error("Expected exactly one Language node, found " + languageNodes.length + " => " + JSON.stringify(languageNodes))
        }
    }
}
