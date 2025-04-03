// Copyright 2025 TRUMPF Laser SE and other contributors
//
// Licensed under the Apache License, Version 2.0 (the "License")
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// SPDX-FileCopyrightText: 2025 TRUMPF Laser SE and other contributors
// SPDX-License-Identifier: Apache-2.0

import {
    Annotation,
    asArray,
    Classifier,
    Concept,
    Enumeration,
    EnumerationLiteral,
    Feature,
    featureMetaType,
    Interface,
    isConcrete,
    isEnumeration,
    isMultiple,
    Language,
    LanguageEntity,
    Link,
    nameOf,
    PrimitiveType,
    Property,
    SingleRef
} from "@lionweb/core"
import {when, withNewlineAppended} from "littoral-templates"

import {indent, switchOrIf} from "../utils/textgen.js"
import {entityMetaType, extendsFrom, Imports, nameOfBaseClassForLanguage} from "./helpers/index.js"


export const reflectiveClassFor = (imports: Imports) => {

    // classifier:

    const reflectiveMembersForFeature = (feature: Feature) => {
        const {classifier, name, key, id, optional} = feature
        const metaType = featureMetaType(feature)
        const qName = `${classifier.name}_${name}`
        return [
            `private readonly _${qName} = new ${imports.core(metaType)}(this._${classifier.name}, "${name}", "${key}", "${id}")${optional ? ".isOptional()" : ""}${isMultiple(feature) ? ".isMultiple()" : ""};`,
            //               | core (2nd x) |
            `get ${qName}(): ${metaType} {`,
            indent([
                `this.ensureWiredUp();`,
                `return this._${qName};`
            ]),
            `}`
        ]
    }

    const reflectiveMembersForClassifier = (classifier: Classifier) => {
        const {name, key, id, features} = classifier
        const metaType = entityMetaType(classifier)
        return [
            `public readonly _${name} = new ${imports.core(metaType)}(this._language, "${name}", "${key}", "${id}"${classifier instanceof Concept ? (", " + classifier.abstract) : ""});`,
            //              | core (2nd x) |
            `get ${name}(): ${metaType} {`,
            indent([
                `this.ensureWiredUp();`,
                `return this._${name};`
            ]),
            `}`,
            features.map(reflectiveMembersForFeature)
        ]
    }


// enumeration:

    const reflectiveMemberForEnumerationLiteral = ({enumeration, name, key, id}: EnumerationLiteral) => {
        const qName = `${enumeration.name}_${name}`
        return [
            `private readonly _${qName} = new ${imports.core("EnumerationLiteral")}(this._${enumeration.name}, "${name}", "${key}", "${id}");`,
            //               |  core (2nd x)  |
            `get ${qName}(): EnumerationLiteral {`,
            indent([
                `this.ensureWiredUp();`,
                `return this._${qName};`
            ]),
            `}`
        ]
    }

    const reflectiveMembersForEnumeration = ({name, key, id, literals}: Enumeration) =>
        [
            `public readonly _${name} = new ${imports.core("Enumeration")}(this._language, "${name}", "${key}", "${id}");`,
            //              | core (2nd x) |
            `get ${name}(): Enumeration {`,
            indent([
                `this.ensureWiredUp();`,
                `return this._${name};`
            ]),
            `}`,
            literals.map(reflectiveMemberForEnumerationLiteral)
        ]

    const reflectiveMembersForPrimitiveType = ({name, key, id}: PrimitiveType) =>
        [
            `public readonly _${name} = new ${imports.core("PrimitiveType")}(this._language, "${name}", "${key}", "${id}");`,
            //              | core (2nd x) |
            `get ${name}(): PrimitiveType {`,
            indent([
                `this.ensureWiredUp();`,
                `return this._${name};`
            ]),
            `}`
        ]


    const reflectiveMembersForEntity = (entity: LanguageEntity) => {
        if (entity instanceof Classifier) {
            return reflectiveMembersForClassifier(entity)
        }
        if (entity instanceof Enumeration) {
            return reflectiveMembersForEnumeration(entity)
        }
        if (entity instanceof PrimitiveType) {
            return reflectiveMembersForPrimitiveType(entity)
        }
        return `// unhandled language entity <${entityMetaType(entity)}>"${entity.name}"`
    }


    const refForType = (type: SingleRef<LanguageEntity>) => {
        if (type === null) {
            return `???`
        }
        if (type.language === imports.thisLanguage) {
            return `this._${type.name}`
        }
        return `${imports.language(type.language)}.INSTANCE._${type.name}`
    }

    const wireUpStatementsForProperty = (property: Property) => {
        const {classifier, name, type, optional} = property
        return `this._${classifier.name}_${name}.ofType(${refForType(type)})${optional ? ".isOptional()" : ""};`
    }

    const wireUpStatementsForLink = (link: Link) => {
        const {classifier, name, type} = link
        return `this._${classifier.name}_${name}.ofType(${refForType(type)});`
    }

    const wireUpStatementsForFeature = (feature: Feature) => {
        if (feature instanceof Property) {
            return wireUpStatementsForProperty(feature)
        }
        if (feature instanceof Link) {
            return wireUpStatementsForLink(feature)
        }
        return `// unhandled feature <${featureMetaType(feature)}>"${feature.name}"`
    }

    const isConcreteClassifier = (classifier: Classifier): classifier is (Annotation | Concept) =>
        classifier instanceof Annotation || classifier instanceof Concept

    const wireUpStatementsForEntity = (entity: LanguageEntity) => {
        const {name} = entity
        const thisLocalName = (localName: string) => `this._${name}_${localName}`
        if (entity instanceof Classifier) {
            const extends_ = extendsFrom(entity)
            return [
                extends_ instanceof Classifier
                    ? `this._${name}.extends = ${refForType(extends_)};`
                    : [],
                when(entity instanceof Interface && entity.extends.length > 0)(
                    () => `this._${name}.extending(${(entity as Interface).extends.map((interface_) => refForType(interface_)).join(", ")});`
                ),
                when(isConcreteClassifier(entity) && entity.implements.length > 0)(
                    () => `this._${name}.implementing(${asArray((entity as (Annotation | Concept)).implements).map((interface_) => refForType(interface_)).join(", ")});`
                ),
                when(entity.features.length > 0)(
                    `this._${name}.havingFeatures(${entity.features.map(nameOf).map(thisLocalName).join(", ")});`
                ),
                entity.features.map(wireUpStatementsForFeature)
            ]
        }
        if (entity instanceof Enumeration) {
            return `this._${name}.havingLiterals(${entity.literals.map(nameOf).map(thisLocalName).join(", ")});`
        }
        if (entity instanceof PrimitiveType) {
            return []   // (nothing to do)
        }
        return `// unhandled language entity <${entityMetaType(entity)}>"${name}"`
    }

    return (language: Language) => {
        const {version, id, key, entities} = language
        const enumerations = entities.filter(isEnumeration)
        const concreteClassifiers = entities.filter(isConcrete)
        const parameterPrefix = concreteClassifiers.length === 0 ? "_" : ""
        const thisLocalName = (localName: string) => `this._${localName}`
        return [
            `export class ${imports.thisBaseClassName} implements ${imports.generic("ILanguageBase")} {`,
            ``,
            indent([
                //                                                             | core | (2nd x)
                `private readonly _language: ${imports.core("Language")} = new Language("${imports.thisLanguageNameAsJsIdentifier}", "${version}", "${id}", "${key}");`,
                //               | core | (3rd x)
                `get language(): Language {`,
                indent([
                    `this.ensureWiredUp();`,
                    `return this._language;`
                ]),
                `}`,
                ``,
                entities.map(withNewlineAppended(reflectiveMembersForEntity)),
                `private _wiredUp: boolean = false;`,
                `private ensureWiredUp() {`,
                indent([
                    `if (this._wiredUp) {`,
                    indent(`return;`),
                    `}`,
                    `this._language.havingEntities(${entities.map(nameOf).map(thisLocalName).join(", ")});`,
                    entities.map(wireUpStatementsForEntity),
                    `this._wiredUp = true;`
                ]),
                `}`,
                ``,
                `factory(${parameterPrefix}handleDelta?: ${imports.generic("DeltaHandler")}): ${imports.generic("NodeBaseFactory")} {`,
                indent([
                    `return (classifier: ${imports.core("Classifier")}, ${parameterPrefix}id: ${imports.core("Id")}) => {`,
                    indent(
                        switchOrIf(
                            "classifier.key",
                            concreteClassifiers.map(nameOf).map((name) => [`this._${name}.key`, `${name}.create(id, ${parameterPrefix}handleDelta)`]),
                            [
                                `const {language} = classifier;`,
                                `throw new Error(\`can't instantiate \${classifier.name} (key=\${classifier.key}): classifier is not known in language \${language.name} (key=\${language.key}, version=\${language.version})\`);`
                            ]
                        )
                    ),
                    `}`
                ]),
                `}`,
                ``,
                `enumLiteralFrom<EnumType>(enumerationLiteral: ${imports.core("EnumerationLiteral")}): EnumType {`,
                // (Why can this work?! EnumType is an unsatisfied generic parameter!)
                indent([
                    `const {enumeration} = enumerationLiteral;`,
                    switchOrIf(
                        "enumeration.key",
                        enumerations.map(nameOf).map((name) => [`this._${name}.key`, "enumerationLiteral.key as EnumType"]),
                        [
                            `const {language} = enumeration;`,
                            `throw new Error(\`enumeration with key \${enumeration.key} is not known in language \${language.name} (key=\${language.key}, version=\${language.version})\`);`
                        ]
                    )
                ]),
                `}`,
                ``,
                `public static readonly INSTANCE = new ${nameOfBaseClassForLanguage(language)}();`
            ]),
            `}`
        ]
    }

}

