import { Definition, isObjectDefinition, PrimitiveDefinition, TaggedUnionDefinition } from "./ValidationTypes.js"

/**
 * A collection of object and primitive definitions describing JSON objects.
 * Used to 
 * - validate an incoming JSON object
 * - generate the corresponding TypeScript type definitions.
 */
export class DefinitionSchema {
    unionDefinitions: TaggedUnionDefinition[] = []
    /**
     * Mapping from extenden object type name to list of extending Object Definitions
     */
    taggedUnions: Map<string, Definition[]> = new Map<string, Definition[]>()
    definitionsMap: Map<string, Definition> = new Map<string, Definition>()

    constructor(taggedUnions: TaggedUnionDefinition[], definitions: Definition[]) {
        this.add(definitions)
        this.addTaggedUnion(taggedUnions)
    }
    
    getDefinition(name: string): Definition | undefined {
        return this.definitionsMap.get(name)
    }
    
    addTaggedUnion(defs: TaggedUnionDefinition[]){
        this.unionDefinitions.push(...defs)
    }

    add(definitions :Definition[] | Definition) {
        if (!Array.isArray(definitions)) {
            definitions = [definitions]
        }
        for(const def of definitions) {
            if (isObjectDefinition(def)) {
                if (def.taggedUnionType !== "") {
                    let existingExtends = this.taggedUnions.get(def.taggedUnionType!)
                    if (existingExtends === undefined) {
                        existingExtends = []
                        this.taggedUnions.set(def.taggedUnionType!, existingExtends)
                    }
                    existingExtends.push(def)
                }
            }
            this.definitionsMap.set(def.name, def)
        }
    }
    
    isTagProperty(propertyName: string): boolean {
        return this.unionDefinitions.find(def => def.unionProperty === propertyName) !== undefined
    }

    definitions(): Definition[] {
        return Array.from(this.definitionsMap.values())
    }
    
    getTaggedUnionDefinition(name: string): TaggedUnionDefinition | undefined {
        return this.unionDefinitions.find(def => def.unionType === name)
    }

    isUnionDiscriminator(propDef: PrimitiveDefinition): boolean {
        return this.unionDefinitions.find(def => def.unionDiscriminator === propDef.name) !== undefined
    }

    extending(name: string): Definition[] {
        const result = this.taggedUnions.get(name)
        if (result === undefined) {
            return []
        } else {
            return Array.from(result.values())
        }
    }
    
    static join(...schema: DefinitionSchema[]): DefinitionSchema {
        const result = new DefinitionSchema([], [])
        schema.forEach(sch => {
            sch.definitions().forEach(value => {
                result.add([value])
            })
            result.addTaggedUnion(sch.unionDefinitions)
        })
        return result
    }
}
