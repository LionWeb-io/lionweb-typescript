import { asMinimalJsonString } from "@lionweb/ts-utils"
import {
    getAllDirectories,
    getFilesDirect,
    issuestoString,
    LanguageRegistry,
    validateFileResult,
    ValidationResult
} from "@lionweb/validation"
import { LionWebLanguageWrapper } from "@lionweb/validation/dist/languages/LionWebLanguageWrapper.js"
import fs from "fs"
import { isTrue } from "../test-utils/assertions.js"

import { TestExpectation } from "./TestExpectation.js"

// Directories containing test cases
const validDir = "testset/valid"
const invalidDir = "testset/invalid"
const validDirWithLanguage = "testset/withLanguage/valid"
const invalidDirWithLanguage = "testset/withLanguage/invalid"
const languageFile = "testset/withLanguage/myLang.language.json"
const m3languageDir = "testlanguage"
const m3languageFile = "testlanguage/LionCore_M3.json"
const builtinsLanguageFile = "testlanguage/std-builtins.json"

type TestDir = { dir: string; lang: string[] }

const verbose = false

function validationTest(testDir: TestDir, validateAgainstLanguage: boolean, registry: LanguageRegistry) {
    console.log("validationTest " + asMinimalJsonString(testDir))
    const directories = getAllDirectories(testDir.dir, [])

    for (const dir of directories) {
        const files = getFilesDirect(dir, [])
        const expected = files.find(file => file === "__TestExpectation.json")
        const testExpectations: TestExpectation[] = []
        if (expected !== undefined) {
            const jsonString = fs.readFileSync(dir + "/" + expected, "utf-8")
            const json = JSON.parse(jsonString)
            const errors: TestExpectation[] = json["errors"]
            errors.forEach(error => {
                testExpectations.push(error)
            })
        }
        for (const file of files) {
            if (file === "__TestExpectation.json") {
                continue
            }
            const expectedError = testExpectations.find(expect => file === expect.file)
            const msg = expectedError === undefined ? "none" : asMinimalJsonString(expectedError)
            it("Validate file " + dir + "/" + file + " expected error: " + msg, () => {
                const result: ValidationResult = validateFileResult(dir + "/" + file, validateAgainstLanguage, registry)
                const success =
                    (expectedError !== undefined || expectedError === "none")
                        ? result.issues.find(issue => issue.issueType === expectedError.error) !== undefined
                        : !result.hasErrors()
                if (verbose) {
                    if (!success) {
                        console.log("FAILED: " + issuestoString(result, file))
                    } else {
                        console.log("SUCCESS: " + issuestoString(result, file))
                    }
                }
                isTrue(success, issuestoString(result, file))
            })
        }
    }
}

const tests: TestDir[] = [
    { dir: validDir, lang: [] },
    { dir: invalidDir, lang: [] },
    { dir: validDirWithLanguage, lang: [languageFile] },
    { dir: invalidDirWithLanguage, lang: [languageFile] },
    { dir: m3languageDir, lang: [m3languageFile, builtinsLanguageFile] }
]

function registerLanguage(registry: LanguageRegistry, fileName: string) {
    // console.log(`ADD LANGUAGE ${fileName}`)
    const languageAsString = fs.readFileSync(fileName, "utf-8")
    const json = JSON.parse(languageAsString)
    registry.addLanguage(new LionWebLanguageWrapper(json))
}

tests.forEach(async testDir => {
    console.log("testDir " + asMinimalJsonString(testDir))
    // await to ensure tests won't go in parallel because the KnownLanguages is static
    const registry = new LanguageRegistry()
    testDir.lang.forEach(lang => registerLanguage(registry, lang))
    describe("validate " + testDir.dir, () => {
        validationTest.apply(null, [testDir, testDir.lang.length !== 0, registry])
    })
})
