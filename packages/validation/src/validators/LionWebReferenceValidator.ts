import {
    Duplicates_Issue,
    Reference_ChildMissingInParent_Issue,
    Reference_CirculairParent_Issue,
    Reference_DuplicateNodeId_Issue, Reference_LanguageUnknown_Issue,
    Reference_ParentMissingInChild_Issue
} from "../issues/ReferenceIssues.js";
import { JsonContext } from "./../issues/JsonContext.js";
import { ChunkUtils } from "../json/ChunkUtils.js";
import { LION_CORE_BUILTINS_KEY, LionWebJsonChild, LionWebJsonChunk, LionWebJsonMetaPointer, LionWebJsonNode, LwJsonUsedLanguage } from "../json/LionWebJson.js";
import { LionWebJsonChunkWrapper } from "../json/LionWebJsonChunkWrapper.js";
import { SimpleFieldValidator } from "./SimpleFieldValidator.js";
import { ValidationResult } from "./ValidationResult.js";

/**
 * Assuming that the syntax is correct, check whether all LionWeb references are correct,
 * as far as they do not need the used language definition.
 */
export class LionWebReferenceValidator {
    validationResult: ValidationResult;
    nodesIdMap: Map<string, LionWebJsonNode> = new Map<string, LionWebJsonNode>();
    simpleFieldValidator: SimpleFieldValidator;

    constructor(validationResult: ValidationResult) {
        this.validationResult = validationResult;
        this.simpleFieldValidator = new SimpleFieldValidator(this.validationResult);
    }

    validateNodeIds(obj: LionWebJsonChunk, ctx: JsonContext): void {
        // put all nodes in a map, validate that there are no two nodes with the same id.
        obj.nodes.forEach((node, index) => {
            // this.validationResult.check(this.nodesIdMap.get(node.id) === undefined, `Node number ${index} has duplicate id "${node.id}"`);
            if (! (this.nodesIdMap.get(node.id) === undefined)) {
                this.validationResult.issue(new Reference_DuplicateNodeId_Issue(ctx.concat("nodes", index), node.id));
            }
            this.nodesIdMap.set(node.id, node);
        });
    }

    validate(obj: LionWebJsonChunkWrapper): void {
        const rootCtx =  new JsonContext(null, ["$"]);
        this.checkDuplicateUsedLanguage(obj.jsonChunk.languages, rootCtx);
        this.validateNodeIds(obj.jsonChunk, rootCtx);
        obj.jsonChunk.nodes.forEach((node, nodeIndex) => {
            const context = rootCtx.concat(`node`, nodeIndex);
            const parentNode = node.parent;
            if (parentNode !== null) {
                this.validateExistsAsChild(context, this.nodesIdMap.get(parentNode), node);
            }
            this.validateLanguageReference(obj, node.classifier, context);
            this.checkParentCircular(node, context);
            this.checkDuplicate(node.annotations, rootCtx.concat("node", nodeIndex, "annotations"));
            this.validateChildrenHaveCorrectParent(node, rootCtx.concat("node", nodeIndex));
            node.properties.forEach((prop, propertyIndex) => {
                this.validateLanguageReference(obj, prop.property, rootCtx.concat("node", nodeIndex, "property", propertyIndex));
            });
            node.containments.forEach((containment, childIndex) => {
                this.validateLanguageReference(obj, containment.containment, rootCtx.concat("node", nodeIndex, "containments", childIndex));
                this.checkDuplicate(containment.children, rootCtx.concat("node", nodeIndex, "containments", childIndex));
                containment.children.forEach((childId) => {
                    const childNode = this.nodesIdMap.get(childId);
                    if (childNode !== undefined) {
                        if (childNode.parent !== null && childNode.parent !== undefined && childNode.parent !== node.id) {
                            // TODO this.validationResult.error(`Child "${childId}" with parent "${childNode.parent}" is defined as child in node "${node.id}"`);
                        }
                        if (childNode.parent === null || childNode.parent === undefined) {
                            // TODO this.validationResult.error(`Child "${childId}" of node "${node.id}" has different parent "${childNode.parent}"`);
                        }
                    }
                });
            });
            node.references.forEach((ref, refIndex) => {
                this.validateLanguageReference(obj, ref.reference, rootCtx.concat("node", nodeIndex, "references", refIndex));
                // TODO Check for duplicate targets?
                // If so, what to check because there can be either or both a `resolveInfo` and a `reference`
            });
        });
    }

    /**
     * Check whether the metapointer refers to a language defined in the usedLanguages of chunk.
     * @param chunk
     * @param metaPointer
     * @param context
     */
    validateLanguageReference(chunk: LionWebJsonChunkWrapper, metaPointer: LionWebJsonMetaPointer, context: JsonContext) {
        const lang = ChunkUtils.findLwUsedLanguageWithVersion(chunk.jsonChunk, metaPointer.language, metaPointer.version);
        if (metaPointer.language === LION_CORE_BUILTINS_KEY) {
            // Ok, builtin
            return;
        }
        if (lang === undefined || lang === null) {
            this.validationResult.issue(new Reference_LanguageUnknown_Issue(context, metaPointer))
        } else {
            if (lang.version !== metaPointer.version) {
                this.validationResult.issue(new Reference_LanguageUnknown_Issue(context, metaPointer))
            }
        }
    }

    /**
     * Check whether there are duplicate values in `strings`.
     * @param strings
     * @param context
     */
    checkDuplicate(strings: string[], context: JsonContext) {
        if (strings === null || strings === undefined) {
            return;
        }
        const alreadySeen: Record<string, boolean> = {};
        strings.forEach((str) => {
            if (alreadySeen[str]) {
                this.validationResult.issue(new Duplicates_Issue(context, str))
            } else {
                alreadySeen[str] = true;
            }
        });
    }

    /**
     * Checks whether there are duplicate usedLanguages in `usedLanguages`.
     * usedLanguages are considered equal when bith their `key` and `version` are identical.
     * @param usedLanguages
     * @param context
     */
    checkDuplicateUsedLanguage(usedLanguages: LwJsonUsedLanguage[], context: JsonContext) {
        if (usedLanguages === null || usedLanguages === undefined) {
            return;
        }
        const alreadySeen = new Map<string, string[]>();
        usedLanguages.forEach((usedLanguage, index) => {
            const seenKeys = alreadySeen.get(usedLanguage.key);
            if (seenKeys !== null && seenKeys !== undefined) {
                if (seenKeys.includes(usedLanguage.version)) {
                    this.validationResult.issue(new Duplicates_Issue(context.concat("language", index, "version"), usedLanguage.version));
                }
            } else {
                alreadySeen.set(usedLanguage.key, [usedLanguage.version]);
            }
        });
    }

    /**
     * Checks whether the parent of node recursively points to `node` itself.
     * @param node
     */
    checkParentCircular(node: LionWebJsonNode, context: JsonContext) {
        if (node === null || node === undefined) {
            return;
        }
        if (node.parent === null || node.parent === undefined) {
            return;
        }
        let current: LionWebJsonNode | undefined = node;
        const seenParents = [node.id];
        while (current !== null && current !== undefined && current.parent !== null && current.parent !== undefined) {
            const nextParent = current.parent;
            if (nextParent !== null && nextParent !== undefined && seenParents.includes(nextParent)) {
                this.validationResult.issue(new Reference_CirculairParent_Issue(context.concat("???"), this.nodesIdMap.get(nextParent), seenParents));
                return;
            }
            seenParents.push(nextParent);
            current = this.nodesIdMap.get(nextParent);
        }
    }

    validateExistsAsChild(context: JsonContext, parent: LionWebJsonNode | undefined, child: LionWebJsonNode) {
        if (parent === undefined || parent === null) {
            return;
        }
        for (const containment of parent.containments) {
            if (containment.children.includes(child.id)) {
                return;
            }
        }
        if (parent.annotations.includes(child.id)) {
            return;
        }
        this.validationResult.issue(new Reference_ChildMissingInParent_Issue(context, child, parent));
    }

    validateChildrenHaveCorrectParent(node: LionWebJsonNode, context: JsonContext) {
        node.containments.forEach((child: LionWebJsonChild) => {
            child.children.forEach((childId: string, index: number) => {
                const childNode = this.nodesIdMap.get(childId);
                if (childNode !== undefined) {
                    if (childNode.parent !== node.id) {
                        // TODO Check that this is already tested from the child in vaidateExistsAsChild().
                    }
                    if (childNode.parent === null || childNode.parent === undefined) {
                        this.validationResult.issue(new Reference_ParentMissingInChild_Issue(context.concat("child", "containment", "key", index), node, childNode));
                    }
                }
            });
        });
        node.annotations.forEach((annotationId: string, annotationIndex: number) => {
            const childNode = this.nodesIdMap.get(annotationId);
            if (childNode !== undefined) {
                if (childNode.parent === null || childNode.parent === undefined) {
                    this.validationResult.issue(new Reference_ParentMissingInChild_Issue(context.concat("annotations", annotationIndex), node, childNode));
                }
            }
        });
        // for (const childId of NodeUtils.allChildren(node)) {
        //     const childNode = this.nodesIdMap.get(childId);
        //     if (childNode !== undefined) {
        //         if (childNode.parent !== node.id) {
        //             this.validationResult.error(`QQ Parent of child "${childId}" is "${childNode.parent}", but should be "${node.id}" in ${context}`);
        //         }
        //     }
        // }
    }
}
