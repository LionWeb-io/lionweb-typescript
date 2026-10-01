import type { LionWebJsonChunk } from "@lionweb/json"

/**
 * The serialization format versions this package can read and write.
 * Both share the same JSON structure and the same protobuf encoding.
 */
export const supportedSerializationFormatVersions: readonly string[] = ["2023.1", "2024.1"]

/**
 * Checks that the given value has the structure of a LionWeb chunk, throwing an error otherwise.
 * It checks the structure only (types of fields, duplicate node IDs), not conformance to a language.
 */
export function validateChunk(value: unknown): asserts value is LionWebJsonChunk {
    if (!value || typeof value !== "object") {
        throw new Error("Expected a LionWeb chunk")
    }
    const chunk = value as LionWebJsonChunk
    if (!supportedSerializationFormatVersions.includes(chunk.serializationFormatVersion)) {
        throw new Error(`Unsupported LionWeb serialization format version: ${chunk.serializationFormatVersion}`)
    }
    if (!Array.isArray(chunk.nodes) || !Array.isArray(chunk.languages)) {
        throw new Error("Invalid LionWeb chunk: missing nodes/languages")
    }
    const ids = new Set<string>()
    for (const node of chunk.nodes) {
        if (
            !node ||
            typeof node.id !== "string" ||
            !node.id ||
            !node.classifier ||
            typeof node.classifier.key !== "string" ||
            typeof node.classifier.language !== "string" ||
            typeof node.classifier.version !== "string" ||
            !Array.isArray(node.properties) ||
            !Array.isArray(node.references) ||
            !Array.isArray(node.containments) ||
            !Array.isArray(node.annotations) ||
            !(node.parent === null || typeof node.parent === "string")
        ) {
            throw new Error("Invalid LionWeb node")
        }
        if (ids.has(node.id)) {
            throw new Error(`Duplicate node ID in chunk: ${node.id}`)
        }
        ids.add(node.id)
        for (const containment of node.containments) {
            if (
                !containment.containment ||
                !Array.isArray(containment.children) ||
                containment.children.some(id => typeof id !== "string")
            ) {
                throw new Error(`Invalid containment on ${node.id}`)
            }
        }
        for (const reference of node.references) {
            if (
                !reference.reference ||
                !Array.isArray(reference.targets) ||
                reference.targets.some(target => target.reference !== null && typeof target.reference !== "string")
            ) {
                throw new Error(`Invalid reference on ${node.id}`)
            }
        }
        for (const property of node.properties) {
            if (!property.property || (property.value !== null && typeof property.value !== "string")) {
                throw new Error(`Invalid property on ${node.id}`)
            }
        }
    }
}
