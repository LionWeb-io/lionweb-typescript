import { ValidationResult, getAllDirectories, getFilesDirect, issuestoString, validateFileResultWithLanguage } from "@lionweb/validation";
import {assert} from "chai"
import fs from "fs";
import { TestExpectation } from "./TestExpectation.js";

const validDir = "testset/valid";
const invalidDir = "testset/invalid";
// const validDirWithLanguage = "testset/withLanguage/valid";
// const invalidDirWithLanguage = "testset/withLanguage/invalid";
// const languageFile = "testset/withLanguage/myLang.language.json";

type TestDir = { dir: string; lang: string | null | undefined };

function integrationTest(testDir: TestDir) {
    const directories = getAllDirectories(testDir.dir, []);

    for (const dir of directories) {
        const files = getFilesDirect(dir, []);
        const expected = files.find(file => file === "__TestExpectation.json");
        const testExpectations: TestExpectation[] = [];
        if (expected !== undefined) {
            const jsonString = fs.readFileSync(dir + "/" + expected, "utf-8");
            const json = JSON.parse(jsonString);
            const errors: TestExpectation[] = json["errors"];
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
                const success = expectedError !== undefined
                    ? result.issues.find(issue => issue.id === expectedError.error) !== undefined
                    : !result.hasErrors();
                assert.isTrue(success, issuestoString(result, file));
            });
        }
    }
}


const tests = [
    { dir: validDir, lang: null },
    { dir: invalidDir, lang: null }
    // TODO  uncomment after completing language(s)-aware validators
    // { dir: validDirWithLanguage, lang: languageFile },
    // { dir: invalidDirWithLanguage, lang: languageFile }
];

tests.forEach(function(testDir) {
    describe("validate " + testDir.dir, function() {
        integrationTest.apply(null, [testDir]);
        // assert.equal(res, test.expected);
    });
});

