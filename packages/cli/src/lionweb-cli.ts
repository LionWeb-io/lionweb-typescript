#!/usr/bin/env node


import {argv} from "process"

import {extractFromSerialization} from "./serialization-extractor.js"
import {diagramFromSerialization} from "./m3/diagram-generator.js"


const main = (args: string[])=> {
    if (args.length <= 2) {
        console.log(
`lionweb-cli is a LionWeb utility around LionWeb-TypeScript

Usage: $ npx @lionweb/cli <command> <arguments>

Available commands are:

    diagram
    extract
`
        )
        return
    }

    const command = args[2]
    const commandArgs = args.slice(3)
    switch (command) {

        case "diagram": {
            if (commandArgs.length === 0) {
                console.log(
                    `The diagram command generates a PlantUML and Mermaid diagram for the language that the given paths point to.`
                )
            } else {
                commandArgs.forEach(diagramFromSerialization)
            }
            return
        }

        case "extract": {
            if (commandArgs.length === 0) {
                console.log(
`The extract command extracts the following from a serialization chunk in the form of files: a sorted JSON, and a shortened JSON.
If the chunk is the serialization of a LionCore Language/M2, then a textual rendering is already output.
(See the README.md for more information.)`
                )
            } else {
                commandArgs.forEach(extractFromSerialization)
            }
            return
        }

        // TODO  generate schema, import Ecore

        default: {
            console.error(`command "${command}" is not recognized`)
        }
    }

}

main(argv)

