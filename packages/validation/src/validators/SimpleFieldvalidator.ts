import { Language_PropertyValue_Issue } from "../issues/LanguageIssues";
import { Syntax_IdFormat_Issue, Syntax_KeyFormat_Issue, Syntax_SerializationFormatVersion_Issue, Syntax_VersionFormat_Issue } from "../issues/SyntaxIssues";
import { IssueContext } from "../issues/ValidationIssue";
import { LionWebJsonProperty } from "../json/LionWebJson";
import { ValidationResult } from "./ValidationResult";

export type ValidatorFunction = <T>(obj: T, ctx: string) => void;

export class SimpleFieldvalidator {
    validationResult: ValidationResult;

    constructor(validationResult: ValidationResult) {
        this.validationResult = validationResult;
    }

    /**
     * Check whether `id` is a valid LionWeb id.
     * @param id
     * @param context
     */
    validateId: ValidatorFunction = <String>(id: String, context: string): void => {
        if (id === null || id === undefined) {
            return;
        }
        const idString: string = id.toString();
        if (typeof idString !== "string") {
            this.validationResult.issue(new Syntax_IdFormat_Issue(new IssueContext(context), idString));
            return;
        }
        const egexp = /^[a-zA-Z0-9$_-][a-zA-Z0-9$_-]*$/;
        if (!egexp.test(idString)) {
            this.validationResult.issue(new Syntax_IdFormat_Issue(new IssueContext(context), idString));
        }
    }

    /**
     *
     * @param key       The `key` to be checked.
     * @param context   The context for the error message in errors.
     * @return          true if `key` is a correct LionWeb key.
     */
    validateKey: ValidatorFunction = <String>(key: String, context: string): void => {
        const keyString: string = "" + key;
        if (typeof keyString !== "string") {
            this.validationResult.issue(new Syntax_KeyFormat_Issue(new IssueContext(context), keyString));
            return;
        }
        const egexp = /^[a-zA-Z0-9$_-][a-zA-Z$_0-9-]*$/;
        if (!egexp.test(keyString)) {
            this.validationResult.issue(new Syntax_KeyFormat_Issue(new IssueContext(context), keyString));
        }
    }

    validateVersion: ValidatorFunction = <String>(version: String, context: string): void => {
        const versionString: string = "" + version;
        if (typeof versionString !== "string") {
            this.validationResult.issue(new Syntax_VersionFormat_Issue(new IssueContext(context), versionString));
            return;
        }
        if (versionString.length === 0) {
            this.validationResult.issue(new Syntax_VersionFormat_Issue(new IssueContext(context), versionString));
        }
    }

    validateBoolean = (property: LionWebJsonProperty, propName: string, context: string): void => {
        if (property.value !== "true" && property.value !== "false") {
            this.validationResult.issue(new Language_PropertyValue_Issue(new IssueContext(context), propName, property.value, "boolean"));
        }
    }

    validateInteger = (property: LionWebJsonProperty, propName: string, context: string): void => {
        const egexp = /^[+-]?(0|[1-9][0-9]*)$/;
        if (!egexp.test(property.value)) {
            this.validationResult.issue(new Language_PropertyValue_Issue(new IssueContext(context), propName, property.value, "integer"));
        }
    }

    validateJSON = (property: LionWebJsonProperty, propName: string, context: string): void => {
        try {
            JSON.parse(property.value);
        } catch (e) {
            this.validationResult.issue(new Language_PropertyValue_Issue(new IssueContext(context), propName, property.value, "JSON"));
        }
    }

    validateSerializationFormatVersion = (objElement: unknown, context: string): void => {
        if (typeof objElement !== "string") {
            this.validationResult.issue(new Syntax_SerializationFormatVersion_Issue(new IssueContext(context), JSON.stringify(objElement)));
            return;
        }
        if (objElement.length === 0) {
            this.validationResult.issue(new Syntax_SerializationFormatVersion_Issue(new IssueContext(context), objElement));
            return;
        }
    }
}
