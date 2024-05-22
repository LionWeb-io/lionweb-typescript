import {NestedString} from "littoral-templates"
import {cond, indent} from "./text-generation-utils.js"


export enum TypeDefModifier {
    none,
    abstract,
    interface
}

export type TypeDef = {
    modifier: TypeDefModifier
    name: string
    mixinNames: string[]
    bodyComment?: string
    fields: Field[]
}

export type Field = {
    name: string
    optional: boolean
    type: string
}


const tsFromField = ({name, optional, type}: Field): NestedString =>
    `${name}${optional ? `?` : ``}: ${type};`


export const tsFromTypeDef = ({modifier, name, mixinNames, bodyComment, fields}: TypeDef): NestedString => {
    const hasBody = !!bodyComment || fields.length > 0
    return [
        `${modifier === TypeDefModifier.none ? `` : `/** ${TypeDefModifier[modifier]} */ `}export type ${name} = ${mixinNames.join(` & `)}${!hasBody ? `;` : ` & {`}`,
        cond(
            hasBody,
            [
                indent([
                    cond(!!bodyComment, `// ${bodyComment}`),
                    cond(
                        fields.length > 0,
                        [
                            `settings: {`,
                            indent(fields.map(tsFromField)),
                            `};`
                        ]
                    )
                ]),
                `};`    // (`{` was already rendered as part of the header)
            ]
        ),
        ``
    ]
}


// TODO  Idea: expose the TypeDef type, and have the generator generate type-def.s, which can be transformed to code at will.

