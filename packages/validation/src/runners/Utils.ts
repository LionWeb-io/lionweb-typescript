import fs from "fs"
import path from "path"
import { ValidationResult } from "../validators/generic/ValidationResult.js"

export function getFilesRecursive(dirPath: string, arrayOfFiles: string[]) {
    const files = fs.readdirSync(dirPath)
    arrayOfFiles = arrayOfFiles || []

    files.forEach(function (file: string) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getFilesRecursive(dirPath + "/" + file, arrayOfFiles)
        } else {
            arrayOfFiles.push(path.join(dirPath, "/", file))
        }
    })
    return arrayOfFiles
}

export function getFilesDirect(dirPath: string, arrayOfFiles: string[]) {
    const files = fs.readdirSync(dirPath)
    arrayOfFiles = arrayOfFiles || []

    files.forEach(function (file: string) {
        if (fs.statSync(dirPath + "/" + file).isFile()) {
            arrayOfFiles.push(file)
        }
    })
    return arrayOfFiles
}

export function getAllDirectories(dirPath: string, arrayOfDirs: string[]) {
    const files = fs.readdirSync(dirPath, { withFileTypes: true })
    arrayOfDirs = arrayOfDirs || []

    files.forEach(function (file: fs.Dirent) {
        if (file.isDirectory()) {
            arrayOfDirs = getAllDirectories(dirPath + "/" + file.name, arrayOfDirs)
            arrayOfDirs.push(path.join(dirPath, "/", file.name))
        } else {
            // ignore files
        }
    })
    return arrayOfDirs
}

export function printIssues(result: ValidationResult, file?: string): void {
    result.issues.forEach(issue => console.log((file == undefined ? "" : `File ${file}: `) + issue.errorMsg()))
}

export function issuestoString(vresult: ValidationResult, file?: string): string {
    let result = ""
    vresult.issues.forEach(issue => (result += (file == undefined ? "" : `File ${file}: `) + issue.errorMsg() + "\n"))
    return result
}
