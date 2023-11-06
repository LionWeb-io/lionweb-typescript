import fs from "fs";
import { LionWebJsonChunkWrapper } from "../json/LionWebJsonChunkWrapper.js";
import { LionWebLanguageDefinition} from "../json/LionWebLanguageDefinition.js";
import { LionWebValidator } from "../validators/LionWebValidator.js";
import { getFilesRecursive, printIssues } from "./Utils.js";

const folder = process.argv[2];
const language = process.argv[3];

let totalSucceed = 0;
let totalFailed = 0;


const languageString = fs.readFileSync(language, "utf-8");
const languageJson = JSON.parse(languageString);
const languageValidator = new LionWebValidator(languageJson, null);

languageValidator.validateSyntax();
languageValidator.validateReferences();
if (languageValidator.validationResult.hasErrors()) {
    console.log("===== Language errors, ignoring folder ======");
    printIssues(languageValidator.validationResult);
    process.exit(1);
}

for (const modelFile of getFilesRecursive(folder, [])) {
    const jsonString1 = fs.readFileSync(modelFile, "utf-8");
    const jsonModel = JSON.parse(jsonString1);
    const modelValidator = new LionWebValidator(jsonModel, new LionWebLanguageDefinition(languageValidator.chunk as LionWebJsonChunkWrapper));

    modelValidator.validateAll();
    if (modelValidator.validationResult.hasErrors()) {
        totalFailed++;
        // console.log("FAILED: " + modelFile)
        printIssues(modelValidator.validationResult, modelFile);
    } else {
        console.log("SUCCEEDED: " + modelFile);
        totalSucceed++;
    }
}

console.log("Total without errors: " + totalSucceed);
console.log("Total with errors: " + totalFailed);

