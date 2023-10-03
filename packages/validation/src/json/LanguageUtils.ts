import { LionWebJsonChunk } from "./LionWebJson";
import { LionWebJsonChunkWrapper } from "./LionWebJsonChunkWrapper";

/**
 * Contains methods for getting information from a LionWebJsonChunk representing a language.
 */
export class LanguageWrapper extends LionWebJsonChunkWrapper {
   
    constructor(languageJson: LionWebJsonChunk) {
        super(languageJson);
    }
}
