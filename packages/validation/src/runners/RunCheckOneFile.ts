import fs from "fs";
import { LionWebValidator } from "../validators/LionWebValidator";
import { printIssues } from "./Utils";

const file1 = process.argv[2];

if (file1 !== null) {
    const jsonString1 = fs.readFileSync(file1, "utf-8");
    const json1 = JSON.parse(jsonString1);
    const validator = new LionWebValidator(json1, null);

    validator.validateSyntax();
    validator.validateReferences();
    validator.validateForLanguage();
    printIssues(validator.validationResult);
}
