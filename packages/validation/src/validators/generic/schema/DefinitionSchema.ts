import { Definition, PrimitiveDefinition, TaggedUnionDefinition } from "./ValidationTypes.js"

/**
 * A collection of object and primitive definitions describing JSON objects.
 * Used to
 * - validate an incoming JSON object
 * - generate the corresponding TypeScript type definitions
 * - generate handlers for the JSOn objects (in @lionweb/server)
 */
export class DefinitionSchema {
    unionDefinition: TaggedUnionDefinition | undefined
    /**
     * Mapping from extenden object type name to list of extending Object Definitions
     */
    definitionsMap: Map<string, Definition> = new Map<string, Definition>()

    constructor(definitions: Definition[], taggedUnion?: TaggedUnionDefinition) {
        this.add(definitions)
        this.unionDefinition = taggedUnion
    }

    getDefinition(name: string): Definition | undefined {
        return this.definitionsMap.get(name)
    }

    add(definitions :Definition[] | Definition) {
        if (!Array.isArray(definitions)) {
            definitions = [definitions]
        }
        for(const def of definitions) {
            this.definitionsMap.set(def.name, def)
        }
    }

    isTagProperty(propertyName: string): boolean {
        return this.unionDefinition?.unionProperty === propertyName
    }

    definitions(): Definition[] {
        return Array.from(this.definitionsMap.values())
    }

    isUnionDiscriminator(propDef: PrimitiveDefinition): boolean {
        return this.unionDefinition?.unionDiscriminator === propDef.name
    }

    joinDefinitions(...schema: DefinitionSchema[]): void {
        schema.forEach(sch => {
            this.add(sch.definitions())
        })
    }
}
