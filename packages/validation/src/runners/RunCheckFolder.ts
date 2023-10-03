import { LionWebValidator } from "../validators/LionWebValidator";
import { getAllFiles, printIssues } from "./Utils";

const fs = require("fs");
const path = require("path");

const folder = process.argv[2];
let totalErrors = 0;
let totalSucceed = 0;
let totalFailed = 0;


for (const f of getAllFiles(folder, [])) {
    const jsonString1 = fs.readFileSync(f, "utf-8");
    const json1 = JSON.parse(jsonString1);
    const validator = new LionWebValidator(json1, null)

    try {
        validator.validateAll();

        if (!validator.validationResult.hasErrors()) {
            totalSucceed += 1;
            console.log("V PASSED " + f) ;
            printIssues(validator.validationResult)
        } else {
            console.log("V FAILED " + f);
            printIssues(validator.validationResult)
            totalFailed += 1;
            totalErrors += validator.validationResult.issues.length;
        }
    } catch(e: any) {
        console.log("EXCEPTION in file: " + f);
        console.log("EXCEPTION " + e.stack);
    }
}

console.log("Total without errors: " + totalSucceed);
console.log("Total with errors: " + totalFailed);
console.log("Total number of errors: " + totalErrors);
