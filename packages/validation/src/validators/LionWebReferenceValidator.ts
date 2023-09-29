import {
    Duplicates_Issue,
    Reference_ChildMissingInParent_Issue,
    Reference_CirculairParent_Issue,
    Reference_DuplicateNodeId_Issue, Reference_LanguageUnknown_Issue,
    Reference_ParentMissingInChild_Issue
} from "../issues/ReferenceIssues";
import { IssueContext } from "../issues/ValidationIssue";
import { ChunkUtils } from "../json/ChunkUtils";
import { LION_CORE_BUILTINS_KEY, LionWebJsonChild, LionWebJsonChunk, LionWebJsonMetaPointer, LionWebJsonNode, LwJsonUsedLanguage } from "../json/LionWebJson";
import { LionWebJsonChunkWrapper } from "../json/LionWebJsonChunkWrapper";
import { NodeUtils } from "../json/NodeUtils";
import { SimpleFieldvalidator } from "./SimpleFieldvalidator";
import { ValidationResult } from "./ValidationResult";

/**
 * Assuming that the syntax is correct, check whether all LionWeb references are correct,
 * as far as they do not need the used language definition.
 */
export class LionWebReferenceValidator {
    validationResult: ValidationResult;
    nodesIdMap: Map<string, LionWebJsonNode> = new Map<string, LionWebJsonNode>();
    simpleFieldValidator: SimpleFieldvalidator;

    constructor(validationResult: ValidationResult) {
        this.validationResult = validationResult;
        this.simpleFieldValidator = new SimpleFieldvalidator(this.validationResult);
    }

    validateNodeIds(obj: LionWebJsonChunk): void {
        // put all nodes in a map, validate that there are no two nodes with the same id.
        obj.nodes.forEach((node, index) => {
            // this.validationResult.check(this.nodesIdMap.get(node.id) === undefined, `Node number ${index} has duplicate id "${node.id}"`);
            if (! (this.nodesIdMap.get(node.id) === undefined)) {
                this.validationResult.issue(new Reference_DuplicateNodeId_Issue(new IssueContext(`nodes[${index}]`), node.id));
            }
            this.nodesIdMap.set(node.id, node);
        });
    }

    validate(obj: LionWebJsonChunkWrapper): void {
        this.checkDuplicateUsedLanguage(obj.jsonChunk.languages, "Chunk");
        this.validateNodeIds(obj.jsonChunk);
        obj.jsonChunk.nodes.forEach((node, nodeIndex) => {
            const context = `node[${nodeIndex}].concept[${nodeIndex}]`;
            const parentNode = node.parent;
            if (parentNode !== null) {
                this.validateExistsAsChild(context, this.nodesIdMap.get(parentNode), node);
            }
            this.validateLanguageReference(obj, node.concept, context);
            this.checkParentCircular(node, context);
            this.checkDuplicate(node.annotations, `node[${nodeIndex}].annotations`);
            this.validateChildrenHaveCorrectParent(node, `Node[${nodeIndex}]`);
            node.children.forEach((child, childIndex) => {
                this.validateLanguageReference(obj, child.containment, `node[${nodeIndex}].child[${childIndex}]`);
                this.checkDuplicate(child.children, `node[${nodeIndex}].child[${childIndex}]`);
                child.children.forEach((childId) => {
                    const childNode = this.nodesIdMap.get(childId);
                    if (childNode !== undefined) {
                        if (childNode.parent !== null && childNode.parent !== undefined && childNode.parent !== node.id) {
                            // this.validationResult.error(`Child "${childId}" with parent "${childNode.parent}" is defined as child in node "${node.id}"`);
                        }
                        if (childNode.parent === null || childNode.parent === undefined) {
                            // this.validationResult.error(`Child "${childId}" of node "${node.id}" has different parent "${childNode.parent}"`);
                        }
                    }
                });
            });
            node.references.forEach((ref, refIndex) => {
                this.validateLanguageReference(obj, ref.reference, `node[${nodeIndex}].reference[${refIndex}]`);
                // TODO Check for duplicate targets?
                // If so, what to check because there can be either or both a `resolveInfo` and a `reference`
            });
            node.properties.forEach((prop, index) => {
                this.validateLanguageReference(obj, prop.property, `node[${nodeIndex}].property[${index}]`);
            });
        });
    }

    /**
     * Check whether the metapointer refers to a language defined in the usedLanguages of chunk.
     * @param chunk
     * @param metaPointer
     * @param context
     */
    validateLanguageReference(chunk: LionWebJsonChunkWrapper, metaPointer: LionWebJsonMetaPointer, context: string) {
        const lang = ChunkUtils.findLwUsedLanguage(chunk.jsonChunk, metaPointer.language);
        if (metaPointer.language === LION_CORE_BUILTINS_KEY) {
            // Ok, builtin
            return;
        }
        if (lang === undefined || lang === null) {
            // this.validationResult.error(`${context}: Language ${metaPointer.language} used but not declared in used languages`);
            this.validationResult.issue(new Reference_LanguageUnknown_Issue(new IssueContext(context), metaPointer))
        } else {
            if (lang.version !== metaPointer.version) {
                // this.validationResult.error(`${context}: Language version ${metaPointer.language}.${metaPointer.version} used but is ${lang.version} in used languages`);
                this.validationResult.issue(new Reference_LanguageUnknown_Issue(new IssueContext(context), metaPointer))
            }
        }
    }

    /**
     * Check whether there are duplicate values in `strings`.
     * @param strings
     * @param context
     */
    checkDuplicate(strings: string[], context: string) {
        if (strings === null || strings === undefined) {
            return;
        }
        let alreadySeen: Record<string, boolean> = {};
        strings.forEach((str) => {
            if (alreadySeen[str]) {
                // this.validationResult.error(`${context}: Duplicate ${str}`);
                this.validationResult.issue(new Duplicates_Issue(new IssueContext(context), str))
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
    checkDuplicateUsedLanguage(usedLanguages: LwJsonUsedLanguage[], context: string) {
        if (usedLanguages === null || usedLanguages === undefined) {
            return;
        }
        let alreadySeen = new Map<string, string[]>();
        usedLanguages.forEach((usedLanguage, index) => {
            const seenKeys = alreadySeen.get(usedLanguage.key);
            if (!!seenKeys) {
                if (seenKeys.includes(usedLanguage.version)) {
                    // this.validationResult.error(`${context}: Duplicate version "${usedLanguage.version}" for language "${usedLanguage.key}"`);
                    this.validationResult.issue(new Duplicates_Issue(new IssueContext(context + `.language[${index}].version`), usedLanguage.version));
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
    checkParentCircular(node: LionWebJsonNode, context: string) {
        if (node === null || node === undefined) {
            return;
        }
        if (node.parent === null || node.parent === undefined) {
            return;
        }
        let current: LionWebJsonNode | undefined = node;
        let seenParents = [node.id];
        while (current !== null && current !== undefined && current.parent !== null && current.parent !== undefined) {
            const nextParent = current.parent;
            if (nextParent !== null && nextParent !== undefined && seenParents.includes(nextParent)) {
                // this.validationResult.error(`${context} Parents circulair: ${seenParents}`);
                this.validationResult.issue(new Reference_CirculairParent_Issue(new IssueContext("???"), this.nodesIdMap.get(nextParent), seenParents));
                return;
            }
            seenParents.push(nextParent);
            current = this.nodesIdMap.get(nextParent);
        }
    }

    validateExistsAsChild(context: string, parent: LionWebJsonNode | undefined, child: LionWebJsonNode) {
        if (parent === undefined || parent === null) {
            return;
        }
        for (const children of parent.children) {
            if (children.children.includes(child.id)) {
                return;
            }
        }
        if (parent.annotations.includes(child.id)) {
            return;
        }
        // this.validationResult.error(`Child with id ${child} has parent ${parent["id"]} but parent does not contains it as a child.`);
        this.validationResult.issue(new Reference_ChildMissingInParent_Issue(new IssueContext(context), child, parent));
    }

    validateChildrenHaveCorrectParent(node: LionWebJsonNode, context: string) {
        node.children.forEach((child: LionWebJsonChild, childIndex: number) => {
            child.children.forEach((childId: string, index: number) => {
                const childNode = this.nodesIdMap.get(childId);
                if (childNode !== undefined) {
                    if (childNode.parent !== node.id) {
                        // TODO Check that this is already tested from the child in vaidateExistsAsChild().
                        // this.validationResult.error(`PP Parent of ${context}.${child.containment.key}[${index}] with id "${childId}" is "${childNode.parent}", but should be "${node.id}"`);
                    }
                    if (childNode.parent === null || childNode.parent === undefined) {
                        // this.validationResult.error(`PP Parent of ${context}.${child.containment.key}[${index}] with id "${childId}" is "${childNode.parent}", but should be "${node.id}"`);
                        this.validationResult.issue(new Reference_ParentMissingInChild_Issue(new IssueContext(`${context}.${child.containment.key}[${index}]`), node, childNode));
                    }
                }
            });
        });
        node.annotations.forEach((annotationId: string, annotationIndex: number) => {
            const childNode = this.nodesIdMap.get(annotationId);
            if (childNode !== undefined) {
                if (childNode.parent === null || childNode.parent === undefined) {
                    // this.validationResult.error(`AA Parent of ${context}.annotations[${annotationIndex}] with id "${annotationId}" is "${childNode.parent}", but should be "${node.id}"`);
                    this.validationResult.issue(new Reference_ParentMissingInChild_Issue(new IssueContext(`${context}.annotations[${annotationIndex}] `), node, childNode));
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
