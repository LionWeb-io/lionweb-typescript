import { ValidationResult, getAllDirectories, getFilesDirect, issuestoString, validateFileResultWithLanguage } from "@lionweb/validation";
import { } from "@lionweb/core"
import {assert} from "chai"
import fs from "fs";
import { TestExpectation } from "./TestExpectation.js";

const validDir = "../../../lionweb-integration-testing/testset/valid";
const invalidDir = "../../../lionweb-integration-testing/testset/invalid";

// const validDirWithLanguage = "../../../lionweb-integration-testing/testset/withLanguage/valid";
// const invalidDirWithLanguage = "../../../lionweb-integration-testing/testset/withLanguage/invalid";
// const languageFile = "../../../lionweb-integration-testing/testset/withLanguage/myLang.language.json";

type TestDir = { dir: string; lang: string | null | undefined };

function integrationTest(testDir: TestDir) {
    const directories = getAllDirectories(testDir.dir, []);

    for (const dir of directories) {
        const files = getFilesDirect(dir, []);
        const expected = files.find(file => file === "__TestExpectation.json");
        const testExpectations: TestExpectation[] = [];
        if (expected !== undefined) {
            const jsonString = fs.readFileSync(dir + "/" + expected, "utf-8");
            const json1 = JSON.parse(jsonString);
            const errors: TestExpectation[] = json1["errors"];
            errors.forEach(error => {
                testExpectations.push(error);
            });
        }
        for (const file of files) {
            if (file === "__TestExpectation.json") {
                continue;
            }
            const expectedError = testExpectations.find(expect => file === expect.file);
            it("Validate file " + dir + "/" + file + " expected error: " + expectedError, () => {
                const result: ValidationResult = validateFileResultWithLanguage(dir + "/" + file, testDir.lang);
                let assertTrue= true; 
                if (expectedError !== undefined) {
                    assertTrue = result.issues.find(issue => issue.id === expectedError.error) !== undefined;
                } else {
                    assertTrue = !result.hasErrors();
                }
                // assert.isTrue(result.hasErrors(), file + ": " + result?.issues[0]?.errorMsg());
                assert.isTrue(assertTrue, issuestoString(result, file));
            });
        }
    }
}

const tests = [
    { dir: validDir, lang: null },
    { dir: invalidDir, lang: null }
    // TODO enable next tests
    // { dir: validDirWithLanguage, lang: languageFile },
    // { dir: invalidDirWithLanguage, lang: languageFile }
];

tests.forEach(function(testDir) {
    describe('validate ' + testDir.dir, function() {
        integrationTest.apply(null, [testDir]);
        // assert.equal(res, test.expected);
    });
});


