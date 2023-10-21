import { Language_PropertyValue_Issue } from "../issues/LanguageIssues";
import { Syntax_IdFormat_Issue, Syntax_KeyFormat_Issue, Syntax_SerializationFormatVersion_Issue, Syntax_VersionFormat_Issue } from "../issues/SyntaxIssues";
import { JsonContext } from "../issues/ValidationIssue";
import { LionWebJsonProperty } from "../json/LionWebJson";
import { ValidationResult } from "./ValidationResult";

export type ValidatorFunction = <T>(obj: T, ctx: JsonContext) => void;

export class SimpleFieldValidator {
    validationResult: ValidationResult;

    constructor(validationResult: ValidationResult) {
        this.validationResult = validationResult;
    }

    /**
     * Check whether `id` is a valid LionWeb id.
     * @param id
     * @param context
     */
    // eslint-disable-next-line @typescript-eslint/ban-types
    validateId: ValidatorFunction = <String>(id: String, context: JsonContext): void => {
        if (id === null || id === undefined) {
            return;
        }
        const idString: string = id.toString();
        const egexp = /^[a-zA-Z0-9$_-][a-zA-Z0-9$_-]*$/;
        if (!egexp.test(idString)) {
            this.validationResult.issue(new Syntax_IdFormat_Issue(context, idString));
        }
    }

    /**
     *
     * @param key       The `key` to be checked.
     * @param context   The context for the error message in errors.
     * @return          true if `key` is a correct LionWeb key.
     */
        // eslint-disable-next-line @typescript-eslint/ban-types
    validateKey: ValidatorFunction = <String>(key: String, context: JsonContext): void => {
        if (key === undefined || key === null) {
            this.validationResult.issue(new Syntax_KeyFormat_Issue(context, "null-or-undefined"));
        }
        const keyString: string = "" + key;
        const egexp = /^[a-zA-Z0-9$_-][a-zA-Z$_0-9-]*$/;
        if (!egexp.test(keyString)) {
            this.validationResult.issue(new Syntax_KeyFormat_Issue(context, keyString));
        }
    }
    
    // eslint-disable-next-line @typescript-eslint/ban-types
    validateVersion: ValidatorFunction = <String>(version: String, context: JsonContext): void => {
        const versionString: string = "" + version;
        if (versionString.length === 0) {
            this.validationResult.issue(new Syntax_VersionFormat_Issue(context, versionString));
        }
    }

    validateBoolean = (property: LionWebJsonProperty, propName: string, context: JsonContext): void => {
        if (property.value !== "true" && property.value !== "false") {
            this.validationResult.issue(new Language_PropertyValue_Issue(context, propName, property.value, "boolean"));
        }
    }

    validateInteger = (property: LionWebJsonProperty, propName: string, context: JsonContext): void => {
        const regexp = /^[+-]?(0|[1-9][0-9]*)$/;
        if (!regexp.test(property.value)) {
            this.validationResult.issue(new Language_PropertyValue_Issue(context, propName, property.value, "integer"));
        }
    }

    validateJSON = (property: LionWebJsonProperty, propName: string, context: JsonContext): void => {
        try {
            JSON.parse(property.value);
        } catch (e) {
            this.validationResult.issue(new Language_PropertyValue_Issue(context, propName, property.value, "JSON"));
        }
    }

    validateSerializationFormatVersion = (objElement: unknown, context: JsonContext): void => {
        if (typeof objElement !== "string") {
            this.validationResult.issue(new Syntax_SerializationFormatVersion_Issue(context, JSON.stringify(objElement)));
            return;
        }
        if (objElement.length === 0) {
            this.validationResult.issue(new Syntax_SerializationFormatVersion_Issue(context, objElement));
            return;
        }
    }
}
