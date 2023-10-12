// TODO The diff is outdated and need work to become ffully functional again.

import { LionWebSyntaxValidator } from "../validators/LionWebSyntaxValidator";
import {
    isEqualMetaPointer,
    LionWebJsonChild,
    LionWebJsonChunk,
    LionWebJsonNode, LionWebJsonProperty,
    LionWebJsonReference, LwJsonUsedLanguage,
} from "../json/LionWebJson";
import { NodeUtils } from "../json/NodeUtils";
import { ChunkUtils } from "../json/ChunkUtils";
import { ValidationResult } from "../validators/ValidationResult";

export type ChangedType = {
    path: string;
    oldValue: unknown;
    newValue: unknown;
};
export type AddedOrDeletedType = {
    path: string;
    value: unknown;
};
export type MatchedType = {
    path: string;
    value: unknown;
};
export type ResultType = {
    matched: MatchedType[];
    changed: ChangedType[];
    added: AddedOrDeletedType[];
    deleted: AddedOrDeletedType[];
};

export class LwDiff {
    errors: string[] = [];
    lwChecker = new LionWebSyntaxValidator(new ValidationResult());

    constructor() {
        this.lwChecker.recursive = false;
    }

    error(msg: string) {
        this.errors.push(msg + "\n");
    }

    check(b: boolean, message: string): void {
        if (!b) {
            this.error("Check error: " + message);
        }
    }

    /**
     * Compare two LwNode objects and return their difference
     * @param obj1
     * @param obj2
     */
    diffLwNode(obj1: LionWebJsonNode, obj2: LionWebJsonNode): void {
        // console.log("Comparing nodes")
        if (!isEqualMetaPointer(obj1.classifier, obj2.classifier)) {
            this.error(`Object ${obj1.id} has concept ${JSON.stringify(obj1.classifier)} vs ${JSON.stringify(obj2.classifier)}`);
        }
        if (obj1.parent !== obj2.parent) {
            this.error(`Object ${obj1.id} has parent ${obj1.parent} vs ${obj2.parent}`);
        }
        for (const prop of obj1.properties) {
            const key = prop.property.key;
            // console.log(`    property ${key} of node ${obj1.id}`)
            const otherProp = NodeUtils.findLwProperty(obj2, key);
            if (otherProp === null) {
                this.error(`Property with concept key ${key} does not exist in second object`);
                continue;
            }
            // const tmp = this.diffLwProperty(prop, otherProp);
        }
        for (const child of obj1.children) {
            const key = child.containment.key;
            // console.log(`    property ${key} of node ${obj1.id}`)
            const otherChild = NodeUtils.findLwChild(obj2, key);
            if (otherChild === null) {
                this.error(`Child with containment key ${key} does not exist in second object`);
                continue;
            }
            // const tmp = this.diffLwChild(child, otherChild);
        }
        for (const ref of obj1.references) {
            const key = ref.reference.key;
            const otherref = NodeUtils.findLwReference(obj2, key);
            if (otherref === null) {
                this.error(`Child with containment key ${key} does not exist in second object`);
                continue;
            }
            // const tmp = this.diffLwReference(ref, otherref);
        }
    }

    diffLwChunk(chunk1: LionWebJsonChunk, chunk2: LionWebJsonChunk): void {
        console.log("Comparing chuncks");
        if (chunk1.serializationFormatVersion !== chunk2.serializationFormatVersion) {
            this.error(`Serialization versions do not match: ${chunk1.serializationFormatVersion} vs ${chunk2.serializationFormatVersion}`);
        }
        for (const language of chunk1.languages) {
            const otherLanguage = ChunkUtils.findLwUsedLanguage(chunk2, language.key);
            if (otherLanguage === null) {
                // return { isEqual: false, diffMessage: `Node with concept key ${id} does not exist in second object`};
                this.error(`Language with  key ${language.key} does not exist in second object`);
                continue;
            }
            // const tmp = this.diffLwUsedLanguage(language, otherLanguage);
        }
        for (const language of chunk2.languages) {
            console.log("Comparing languages");
            const otherLanguage = ChunkUtils.findLwUsedLanguage(chunk1, language.key);
            if (otherLanguage === null) {
                // return { isEqual: false, diffMessage: `Node with concept key ${id} does not exist in second object`};
                this.error(`Language with  key ${language.key} does not exist in first object`);
            }
        }
        for (const node of chunk1.nodes) {
            const id = node.id;
            const otherNode = ChunkUtils.findNode(chunk2, id);
            if (otherNode === null) {
                // return { isEqual: false, diffMessage: `Node with concept key ${id} does not exist in second object`};
                this.error(`Node with concept key ${id} does not exist in second object`);
                continue;
            }
            // const tmp = this.diffLwNode(node, otherNode);
        }
        for (const node of chunk2.nodes) {
            const id = node.id;
            const otherNode = ChunkUtils.findNode(chunk1, id);
            if (otherNode === null) {
                // return { isEqual: false, diffMessage: `Node with concept key ${id} does not exist in second object`};
                this.error(`Node with concept key ${id} does not exist in first object`);
            }
        }
    }

    diffLwChild(obj1: LionWebJsonChild, obj2: LionWebJsonChild): void {
        if (!isEqualMetaPointer(obj1.containment, obj2.containment)) {
            // return { isEqual: false, diffMessage: `Property Object has concept ${JSON.stringify(obj1.property)} vs ${JSON.stringify(obj2.property)}`}
            this.error(`Child Object has concept ${JSON.stringify(obj1.containment)} vs ${JSON.stringify(obj2.containment)}`);
        }
        // Check whether children exist in both objects (two for loops)
        for (const childId1 of obj1.children) {
            if (!obj2.children.includes(childId1)) {
                this.error(`Child ${childId1} is missing in other object`);
            }
        }
        for (const childId2 of obj2.children) {
            if (!obj1.children.includes(childId2)) {
                console.error(`Child ${childId2} is missing in first object`);
            }
        }
    }

    diffLwReference(ref1: LionWebJsonReference, ref2: LionWebJsonReference): void {
        if (!isEqualMetaPointer(ref1.reference, ref2.reference)) {
            // return { isEqual: false, diffMessage: `Property Object has concept ${JSON.stringify(obj1.property)} vs ${JSON.stringify(obj2.property)}`}
            this.error(`Reference has concept ${JSON.stringify(ref1.reference)} vs ${JSON.stringify(ref2.reference)}`);
        }
        for (const target of ref1.targets) {
            const otherTarget = NodeUtils.findLwReferenceTarget(ref2.targets, target);
            if (otherTarget === null) {
                console.error(`REFERENCE Target ${JSON.stringify(target)} missing in second `);
            } else {
                if (target.reference !== otherTarget.reference || target.resolveInfo !== otherTarget.resolveInfo) {
                    this.error(`REFERENCE target ${JSON.stringify(target)} vs ${JSON.stringify(otherTarget)}`);
                }
            }
        }
        for (const target of ref2.targets) {
            if (NodeUtils.findLwReferenceTarget(ref1.targets, target) === null) {
                this.error(`REFERENCE Target ${JSON.stringify(target)} missing in first `);
            }
        }
    }

    private diffLwUsedLanguage(obj1: LwJsonUsedLanguage, obj2: LwJsonUsedLanguage) {
        if (obj1.key !== obj2.key || obj1.version !== obj2.version) {
            this.error(`Different used languages ${JSON.stringify(obj1)} vs ${JSON.stringify(obj2)}`);
        }
    }

    private diffLwProperty(obj1: LionWebJsonProperty, obj2: LionWebJsonProperty) {
        if (!isEqualMetaPointer(obj1.property, obj2.property)) {
            this.error(`Property Object has concept ${JSON.stringify(obj1.property)} vs ${JSON.stringify(obj2.property)}`);
        }
        if (obj1.value !== obj2.value) {
            this.error(`Property ${obj1.property.key} has value ${obj1.value} vs ${obj2.value}`);
        }
    }
}
