const { readFileSync } = require("fs")
const { parseDependencyTree, parseCircular, prettyCircular } = require("dpdm")

const checkPackage = async (pkg) =>
    parseDependencyTree(`packages/${pkg}/src/**/*.ts`, {})
        .then((tree) => {
            const circulars = parseCircular(tree)
            if (circulars.length === 0) {
                return false
            }
            console.log(`package "${pkg}" has the following circular dependencies:`)
            console.log(prettyCircular(circulars))
            console.log()
            return true
        })

Promise.all(
    JSON.parse(readFileSync("package.json", { encoding: "utf8" }))
        .workspaces
        .map((path) => path.substring("./packages/".length))
        .map(checkPackage)
).then((results) => {
    if (results.some((result) => result)) {
        console.log(`[WARNING] at least one package has circular dependencies`)
    }
})

