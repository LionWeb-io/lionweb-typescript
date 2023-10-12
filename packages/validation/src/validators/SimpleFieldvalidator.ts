import { Language_PropertyValue_Issue } from "../issues/LanguageIssues";
import { Syntax_IdFormat_Issue, Syntax_KeyFormat_Issue, Syntax_SerializationFormatVersion_Issue, Syntax_VersionFormat_Issue } from "../issues/SyntaxIssues";
import { IssueContext } from "../issues/ValidationIssue";
import { LionWebJsonProperty } from "../json/LionWebJson";
import { ValidationResult } from "./ValidationResult";

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
    validateId = (id: string, context: string): void => {
        if (id === null || id === undefined) {
            return;
        }
        if (typeof id !== "string") {
            // this.validationResult.error(`${context}: Type of id "${id}" is not a string`);
            this.validationResult.issue(new Syntax_IdFormat_Issue(new IssueContext(context), id));
            return;
        }
        const egexp = /^[a-zA-Z0-9$_-][a-zA-Z0-9$_-]*$/;
        if (!egexp.test(id)) {
            // this.validationResult.error(`${context}: Id "${id}" has incorrect format in`);
            this.validationResult.issue(new Syntax_IdFormat_Issue(new IssueContext(context), id));
        }
    }

    /**
     *
     * @param key       The `key` to be checked.
     * @param context   The context for the error message in errors.
     * @return          true if `key` is a correct LionWeb key.
     */
    validateKey = (key: string, context: string): void => {
        if (typeof key !== "string") {
            // this.validationResult.error(`${context}: Type of key "${key}" is not a string`);
            this.validationResult.issue(new Syntax_KeyFormat_Issue(new IssueContext(context), key));
            return;
        }
        const egexp = /^[a-zA-Z0-9$_-][a-zA-Z$_0-9-]*$/;
        if (!egexp.test(key)) {
            // this.validationResult.error(`${context}: Key "${key}" has incorrect format`);
            this.validationResult.issue(new Syntax_KeyFormat_Issue(new IssueContext(context), key));
        }
    }

    validateVersion = (version: string, context: string): void => {
        if (typeof version !== "string") {
            // this.validationResult.error(`${context}: Type of version "${version}" is not a string`);
            this.validationResult.issue(new Syntax_VersionFormat_Issue(new IssueContext(context), version));
            return;
        }
        if (version.length === 0) {
            // this.validationResult.error(`${context}: Version "${version}" is empty`);
            this.validationResult.issue(new Syntax_VersionFormat_Issue(new IssueContext(context), version));
        }
    }

    validateBoolean = (property: LionWebJsonProperty, propName: string, context: string): void => {
        if (property.value !== "true" && property.value !== "false") {
            // this.validationResult.error(`${context}: Type of propery "${property.value}" should be boolean ("false" or "true")`);
            this.validationResult.issue(new Language_PropertyValue_Issue(new IssueContext(context), propName, property.value, "boolean"));
        }
    }

    validateInteger = (property: LionWebJsonProperty, propName: string, context: string): void => {
        const egexp = /^[+-]?(0|[1-9][0-9]*)$/;
        if (!egexp.test(property.value)) {
            // this.validationResult.error(`${context}: Value "${property.value}" is not an integer`);
            this.validationResult.issue(new Language_PropertyValue_Issue(new IssueContext(context), propName, property.value, "integer"));
        }
    }

    validateJSON = (property: LionWebJsonProperty, propName: string, context: string): void => {
        try {
            JSON.parse(property.value);
        } catch (e) {
            // this.validationResult.error(`${context}: Value "${property.value}" is not a JSON, parsing error: ${e.message}`);
            this.validationResult.issue(new Language_PropertyValue_Issue(new IssueContext(context), propName, property.value, "JSON"));
        }
    }

    vcalidateSerializationFormatVersion = (objElement: unknown, context: string): void => {
        if (typeof objElement !== "string") {
            // this.validationResult.error(`SerializationFormatVersion "${objElement}" is not a string in ${context}`);
            this.validationResult.issue(new Syntax_SerializationFormatVersion_Issue(new IssueContext(context), JSON.stringify(objElement)));
            return;
        }
        if (objElement.length === 0) {
            // this.validationResult.error(`SerializationFormatVersion "${objElement}" is empty in ${context}`);
            this.validationResult.issue(new Syntax_SerializationFormatVersion_Issue(new IssueContext(context), objElement));
            return;
        }
        const egexp = /^[0-9]+$/;
        if (!egexp.test(objElement)) {
            // this.validationResult.error(`SerializationFormatVersion "${objElement}" has incorrect format in ${context}`);
            this.validationResult.issue(new Syntax_SerializationFormatVersion_Issue(new IssueContext(context), objElement));
        }
    }
}
