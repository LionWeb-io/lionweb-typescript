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

// Warning: this file is generated!
// Modifying it by hand is useless at best, and sabotage at worst.

/*
 * language's metadata:
 *     name:    Deltas
 *     version: 0
 *     key:     Deltas
 *     id:      Deltas
 */


import {
    Classifier,
    Concept,
    Containment,
    Enumeration,
    EnumerationLiteral,
    Interface,
    Language,
    Property,
    Reference,
    SingleRef
} from "@lionweb/core";

import {
    LionWebId
} from "@lionweb/json";

import {
    ContainmentValueManager,
    DeltaHandler,
    ILanguageBase,
    INamed,
    INodeBase,
    LionCore_builtinsBase,
    NodeBase,
    NodeBaseFactory,
    OptionalMultiContainmentValueManager,
    OptionalPropertyValueManager,
    OptionalSingleContainmentValueManager,
    OptionalSingleReferenceValueManager,
    Parentage,
    PropertyValueManager,
    ReferenceValueManager,
    RequiredPropertyValueManager,
    RequiredSingleContainmentValueManager
} from "@lionweb/class-core";


export class DeltasBase implements ILanguageBase {

    private readonly _language: Language = new Language("Deltas", "0", "Deltas", "Deltas");
    get language(): Language {
        this.ensureWiredUp();
        return this._language;
    }

    public readonly _Deltas = new Concept(this._language, "Deltas", "Deltas-Deltas", "Deltas-Deltas", false).isPartition();
    get Deltas(): Concept {
        this.ensureWiredUp();
        return this._Deltas;
    }
    private readonly _Deltas_deltas = new Containment(this._Deltas, "deltas", "Deltas-Deltas-deltas", "Deltas-Deltas-deltas").isOptional().isMultiple();
    get Deltas_deltas(): Containment {
        this.ensureWiredUp();
        return this._Deltas_deltas;
    }

    public readonly _Type = new Interface(this._language, "Type", "Deltas-Type", "Deltas-Type");
    get Type(): Interface {
        this.ensureWiredUp();
        return this._Type;
    }

    public readonly _Field = new Concept(this._language, "Field", "Deltas-Field", "Deltas-Field", false);
    get Field(): Concept {
        this.ensureWiredUp();
        return this._Field;
    }
    private readonly _Field_type = new Containment(this._Field, "type", "Deltas-Field-type", "Deltas-Field-type");
    get Field_type(): Containment {
        this.ensureWiredUp();
        return this._Field_type;
    }

    public readonly _FeatureKinds = new Enumeration(this._language, "FeatureKinds", "Deltas-FeatureKinds", "Deltas-FeatureKinds");
    get FeatureKinds(): Enumeration {
        this.ensureWiredUp();
        return this._FeatureKinds;
    }
    private readonly _FeatureKinds_property = new EnumerationLiteral(this._FeatureKinds, "property", "Deltas-FeatureKinds-property", "Deltas-FeatureKinds-property");
    get FeatureKinds_property(): EnumerationLiteral {
        this.ensureWiredUp();
        return this._FeatureKinds_property;
    }
    private readonly _FeatureKinds_containment = new EnumerationLiteral(this._FeatureKinds, "containment", "Deltas-FeatureKinds-containment", "Deltas-FeatureKinds-containment");
    get FeatureKinds_containment(): EnumerationLiteral {
        this.ensureWiredUp();
        return this._FeatureKinds_containment;
    }
    private readonly _FeatureKinds_reference = new EnumerationLiteral(this._FeatureKinds, "reference", "Deltas-FeatureKinds-reference", "Deltas-FeatureKinds-reference");
    get FeatureKinds_reference(): EnumerationLiteral {
        this.ensureWiredUp();
        return this._FeatureKinds_reference;
    }

    public readonly _FeatureType = new Concept(this._language, "FeatureType", "Deltas-FeatureType", "Deltas-FeatureType", false);
    get FeatureType(): Concept {
        this.ensureWiredUp();
        return this._FeatureType;
    }
    private readonly _FeatureType_kind = new Property(this._FeatureType, "kind", "Deltas-FeatureType-kind", "Deltas-FeatureType-kind");
    get FeatureType_kind(): Property {
        this.ensureWiredUp();
        return this._FeatureType_kind;
    }
    private readonly _FeatureType_container = new Reference(this._FeatureType, "container", "Deltas-FeatureType-container", "Deltas-FeatureType-container").isOptional();
    get FeatureType_container(): Reference {
        this.ensureWiredUp();
        return this._FeatureType_container;
    }

    public readonly _NodeSerialization = new Interface(this._language, "NodeSerialization", "Deltas-NodeSerialization", "Deltas-NodeSerialization");
    get NodeSerialization(): Interface {
        this.ensureWiredUp();
        return this._NodeSerialization;
    }

    public readonly _SerializeSubTree = new Concept(this._language, "SerializeSubTree", "Deltas-SerializeSubTree", "Deltas-SerializeSubTree", false);
    get SerializeSubTree(): Concept {
        this.ensureWiredUp();
        return this._SerializeSubTree;
    }
    private readonly _SerializeSubTree_fieldName = new Property(this._SerializeSubTree, "fieldName", "Deltas-SerializeSubTree-fieldName", "Deltas-SerializeSubTree-fieldName");
    get SerializeSubTree_fieldName(): Property {
        this.ensureWiredUp();
        return this._SerializeSubTree_fieldName;
    }

    public readonly _RefOnly = new Concept(this._language, "RefOnly", "Deltas-RefOnly", "Deltas-RefOnly", false);
    get RefOnly(): Concept {
        this.ensureWiredUp();
        return this._RefOnly;
    }

    public readonly _NodeType = new Concept(this._language, "NodeType", "Deltas-NodeType", "Deltas-NodeType", false);
    get NodeType(): Concept {
        this.ensureWiredUp();
        return this._NodeType;
    }
    private readonly _NodeType_serialization = new Containment(this._NodeType, "serialization", "Deltas-NodeType-serialization", "Deltas-NodeType-serialization").isOptional();
    get NodeType_serialization(): Containment {
        this.ensureWiredUp();
        return this._NodeType_serialization;
    }

    public readonly _IndexType = new Concept(this._language, "IndexType", "Deltas-IndexType", "Deltas-IndexType", false);
    get IndexType(): Concept {
        this.ensureWiredUp();
        return this._IndexType;
    }

    public readonly _PrimitiveValueType = new Concept(this._language, "PrimitiveValueType", "Deltas-PrimitiveValueType", "Deltas-PrimitiveValueType", false);
    get PrimitiveValueType(): Concept {
        this.ensureWiredUp();
        return this._PrimitiveValueType;
    }

    public readonly _CustomType = new Concept(this._language, "CustomType", "Deltas-CustomType", "Deltas-CustomType", false);
    get CustomType(): Concept {
        this.ensureWiredUp();
        return this._CustomType;
    }
    private readonly _CustomType_type = new Property(this._CustomType, "type", "Deltas-CustomType-type", "Deltas-CustomType-type");
    get CustomType_type(): Property {
        this.ensureWiredUp();
        return this._CustomType_type;
    }
    private readonly _CustomType_serializationType = new Property(this._CustomType, "serializationType", "Deltas-CustomType-serializationType", "Deltas-CustomType-serializationType");
    get CustomType_serializationType(): Property {
        this.ensureWiredUp();
        return this._CustomType_serializationType;
    }
    private readonly _CustomType_serializationExpr = new Property(this._CustomType, "serializationExpr", "Deltas-CustomType-serializationExpr", "Deltas-CustomType-serializationExpr");
    get CustomType_serializationExpr(): Property {
        this.ensureWiredUp();
        return this._CustomType_serializationExpr;
    }
    private readonly _CustomType_deserializationExpr = new Property(this._CustomType, "deserializationExpr", "Deltas-CustomType-deserializationExpr", "Deltas-CustomType-deserializationExpr");
    get CustomType_deserializationExpr(): Property {
        this.ensureWiredUp();
        return this._CustomType_deserializationExpr;
    }

    public readonly _Delta = new Concept(this._language, "Delta", "Deltas-Delta", "Deltas-Delta", false);
    get Delta(): Concept {
        this.ensureWiredUp();
        return this._Delta;
    }
    private readonly _Delta_documentation = new Property(this._Delta, "documentation", "Deltas-Delta-documentation", "Deltas-Delta-documentation").isOptional();
    get Delta_documentation(): Property {
        this.ensureWiredUp();
        return this._Delta_documentation;
    }
    private readonly _Delta_fields = new Containment(this._Delta, "fields", "Deltas-Delta-fields", "Deltas-Delta-fields").isOptional().isMultiple();
    get Delta_fields(): Containment {
        this.ensureWiredUp();
        return this._Delta_fields;
    }

    private _wiredUp: boolean = false;
    private ensureWiredUp() {
        if (this._wiredUp) {
            return;
        }
        this._language.havingEntities(this._Deltas, this._Type, this._Field, this._FeatureKinds, this._FeatureType, this._NodeSerialization, this._SerializeSubTree, this._RefOnly, this._NodeType, this._IndexType, this._PrimitiveValueType, this._CustomType, this._Delta);
        this._Deltas.havingFeatures(this._Deltas_deltas);
        this._Deltas_deltas.ofType(this._Delta);
        this._Field.implementing(LionCore_builtinsBase.INSTANCE._INamed);
        this._Field.havingFeatures(this._Field_type);
        this._Field_type.ofType(this._Type);
        this._FeatureKinds.havingLiterals(this._FeatureKinds_property, this._FeatureKinds_containment, this._FeatureKinds_reference);
        this._FeatureType.implementing(this._Type);
        this._FeatureType.havingFeatures(this._FeatureType_kind, this._FeatureType_container);
        this._FeatureType_kind.ofType(this._FeatureKinds);
        this._FeatureType_container.ofType(this._Field);
        this._SerializeSubTree.implementing(this._NodeSerialization);
        this._SerializeSubTree.havingFeatures(this._SerializeSubTree_fieldName);
        this._SerializeSubTree_fieldName.ofType(LionCore_builtinsBase.INSTANCE._String);
        this._RefOnly.implementing(this._NodeSerialization);
        this._NodeType.implementing(this._Type);
        this._NodeType.havingFeatures(this._NodeType_serialization);
        this._NodeType_serialization.ofType(this._NodeSerialization);
        this._IndexType.implementing(this._Type);
        this._PrimitiveValueType.implementing(this._Type);
        this._CustomType.implementing(this._Type);
        this._CustomType.havingFeatures(this._CustomType_type, this._CustomType_serializationType, this._CustomType_serializationExpr, this._CustomType_deserializationExpr);
        this._CustomType_type.ofType(LionCore_builtinsBase.INSTANCE._String);
        this._CustomType_serializationType.ofType(LionCore_builtinsBase.INSTANCE._String);
        this._CustomType_serializationExpr.ofType(LionCore_builtinsBase.INSTANCE._String);
        this._CustomType_deserializationExpr.ofType(LionCore_builtinsBase.INSTANCE._String);
        this._Delta.implementing(LionCore_builtinsBase.INSTANCE._INamed);
        this._Delta.havingFeatures(this._Delta_documentation, this._Delta_fields);
        this._Delta_documentation.ofType(LionCore_builtinsBase.INSTANCE._String).isOptional();
        this._Delta_fields.ofType(this._Field);
        this._wiredUp = true;
    }

    factory(handleDelta?: DeltaHandler): NodeBaseFactory {
        return (classifier: Classifier, id: LionWebId) => {
            switch (classifier.key) {
                case this._Deltas.key: return Deltas.create(id, handleDelta);
                case this._Field.key: return Field.create(id, handleDelta);
                case this._FeatureType.key: return FeatureType.create(id, handleDelta);
                case this._SerializeSubTree.key: return SerializeSubTree.create(id, handleDelta);
                case this._RefOnly.key: return RefOnly.create(id, handleDelta);
                case this._NodeType.key: return NodeType.create(id, handleDelta);
                case this._IndexType.key: return IndexType.create(id, handleDelta);
                case this._PrimitiveValueType.key: return PrimitiveValueType.create(id, handleDelta);
                case this._CustomType.key: return CustomType.create(id, handleDelta);
                case this._Delta.key: return Delta.create(id, handleDelta);
                default: {
                    const {language} = classifier;
                    throw new Error(`can't instantiate ${classifier.name} (key=${classifier.key}): classifier is not known in language ${language.name} (key=${language.key}, version=${language.version})`);
                }
            }
        }
    }

    enumLiteralFrom<EnumType>(enumerationLiteral: EnumerationLiteral): EnumType {
        const {enumeration} = enumerationLiteral;
        if (enumeration.key === this._FeatureKinds.key) {
            return enumerationLiteral.key as EnumType;
        }
        const {language} = enumeration;
        throw new Error(`enumeration with key ${enumeration.key} is not known in language ${language.name} (key=${language.key}, version=${language.version})`);
    }

    public static readonly INSTANCE = new DeltasBase();
}


export class Deltas extends NodeBase {
    static create(id: LionWebId, handleDelta?: DeltaHandler, parentInfo?: Parentage): Deltas {
        return new Deltas(DeltasBase.INSTANCE.Deltas, id, handleDelta, parentInfo);
    }

    private readonly _deltas: OptionalMultiContainmentValueManager<Delta>;
    get deltas(): Delta[] {
        return this._deltas.get();
    }
    addDeltas(newValue: Delta) {
        this._deltas.add(newValue);
    }
    removeDeltas(valueToRemove: Delta) {
        this._deltas.remove(valueToRemove);
    }
    addDeltasAtIndex(newValue: Delta, index: number) {
        this._deltas.insertAtIndex(newValue, index);
    }
    moveDeltas(oldIndex: number, newIndex: number) {
        this._deltas.move(oldIndex, newIndex);
    }
    replaceDeltasAtIndex(movedChild: Delta, newIndex: number) {
        this._deltas.replaceAtIndex(movedChild, newIndex);
    }

    public constructor(classifier: Classifier, id: LionWebId, handleDelta?: DeltaHandler, parentInfo?: Parentage) {
        super(classifier, id, handleDelta, parentInfo);
        this._deltas = new OptionalMultiContainmentValueManager<Delta>(DeltasBase.INSTANCE.Deltas_deltas, this);
    }

    getContainmentValueManager(containment: Containment): ContainmentValueManager<INodeBase> {
        if (containment.key === DeltasBase.INSTANCE.Deltas_deltas.key) {
            return this._deltas;
        }
        return super.getContainmentValueManager(containment);
    }
}

export interface Type extends INodeBase {
}

export class Field extends NodeBase implements INamed {
    static create(id: LionWebId, handleDelta?: DeltaHandler, parentInfo?: Parentage): Field {
        return new Field(DeltasBase.INSTANCE.Field, id, handleDelta, parentInfo);
    }

    private readonly _type: RequiredSingleContainmentValueManager<Type>;
    get type(): Type {
        return this._type.get();
    }
    set type(newValue: Type) {
        this._type.set(newValue);
    }
    replaceTypeWith(newValue: Type) {
        this._type.replaceWith(newValue);
    }

    private readonly _name: RequiredPropertyValueManager<string>;
    get name(): string {
        return this._name.get();
    }
    set name(newValue: string) {
        this._name.set(newValue);
    }

    public constructor(classifier: Classifier, id: LionWebId, handleDelta?: DeltaHandler, parentInfo?: Parentage) {
        super(classifier, id, handleDelta, parentInfo);
        this._type = new RequiredSingleContainmentValueManager<Type>(DeltasBase.INSTANCE.Field_type, this);
        this._name = new RequiredPropertyValueManager<string>(LionCore_builtinsBase.INSTANCE.INamed_name, this);
    }

    getPropertyValueManager(property: Property): PropertyValueManager<unknown> {
        if (property.key === LionCore_builtinsBase.INSTANCE.INamed_name.key) {
            return this._name;
        }
        return super.getPropertyValueManager(property);
    }

    getContainmentValueManager(containment: Containment): ContainmentValueManager<INodeBase> {
        if (containment.key === DeltasBase.INSTANCE.Field_type.key) {
            return this._type;
        }
        return super.getContainmentValueManager(containment);
    }
}

export enum FeatureKinds {
    property = "Deltas-FeatureKinds-property",
    containment = "Deltas-FeatureKinds-containment",
    reference = "Deltas-FeatureKinds-reference"
}

export class FeatureType extends NodeBase implements Type {
    static create(id: LionWebId, handleDelta?: DeltaHandler, parentInfo?: Parentage): FeatureType {
        return new FeatureType(DeltasBase.INSTANCE.FeatureType, id, handleDelta, parentInfo);
    }

    private readonly _kind: RequiredPropertyValueManager<FeatureKinds>;
    get kind(): FeatureKinds {
        return this._kind.get();
    }
    set kind(newValue: FeatureKinds) {
        this._kind.set(newValue);
    }

    private readonly _container: OptionalSingleReferenceValueManager<Field>;
    get container(): SingleRef<Field> | undefined {
        return this._container.get();
    }
    set container(newValue: SingleRef<Field> | undefined) {
        this._container.set(newValue);
    }

    public constructor(classifier: Classifier, id: LionWebId, handleDelta?: DeltaHandler, parentInfo?: Parentage) {
        super(classifier, id, handleDelta, parentInfo);
        this._kind = new RequiredPropertyValueManager<FeatureKinds>(DeltasBase.INSTANCE.FeatureType_kind, this);
        this._container = new OptionalSingleReferenceValueManager<Field>(DeltasBase.INSTANCE.FeatureType_container, this);
    }

    getPropertyValueManager(property: Property): PropertyValueManager<unknown> {
        if (property.key === DeltasBase.INSTANCE.FeatureType_kind.key) {
            return this._kind;
        }
        return super.getPropertyValueManager(property);
    }

    getReferenceValueManager(reference: Reference): ReferenceValueManager<INodeBase> {
        if (reference.key === DeltasBase.INSTANCE.FeatureType_container.key) {
            return this._container;
        }
        return super.getReferenceValueManager(reference);
    }
}

export interface NodeSerialization extends INodeBase {
}

export class SerializeSubTree extends NodeBase implements NodeSerialization {
    static create(id: LionWebId, handleDelta?: DeltaHandler, parentInfo?: Parentage): SerializeSubTree {
        return new SerializeSubTree(DeltasBase.INSTANCE.SerializeSubTree, id, handleDelta, parentInfo);
    }

    private readonly _fieldName: RequiredPropertyValueManager<string>;
    get fieldName(): string {
        return this._fieldName.get();
    }
    set fieldName(newValue: string) {
        this._fieldName.set(newValue);
    }

    public constructor(classifier: Classifier, id: LionWebId, handleDelta?: DeltaHandler, parentInfo?: Parentage) {
        super(classifier, id, handleDelta, parentInfo);
        this._fieldName = new RequiredPropertyValueManager<string>(DeltasBase.INSTANCE.SerializeSubTree_fieldName, this);
    }

    getPropertyValueManager(property: Property): PropertyValueManager<unknown> {
        if (property.key === DeltasBase.INSTANCE.SerializeSubTree_fieldName.key) {
            return this._fieldName;
        }
        return super.getPropertyValueManager(property);
    }
}

export class RefOnly extends NodeBase implements NodeSerialization {
    static create(id: LionWebId, handleDelta?: DeltaHandler, parentInfo?: Parentage): RefOnly {
        return new RefOnly(DeltasBase.INSTANCE.RefOnly, id, handleDelta, parentInfo);
    }
}

export class NodeType extends NodeBase implements Type {
    static create(id: LionWebId, handleDelta?: DeltaHandler, parentInfo?: Parentage): NodeType {
        return new NodeType(DeltasBase.INSTANCE.NodeType, id, handleDelta, parentInfo);
    }

    private readonly _serialization: OptionalSingleContainmentValueManager<NodeSerialization>;
    get serialization(): NodeSerialization | undefined {
        return this._serialization.get();
    }
    set serialization(newValue: NodeSerialization | undefined) {
        this._serialization.set(newValue);
    }
    replaceSerializationWith(newValue: NodeSerialization) {
        this._serialization.replaceWith(newValue);
    }

    public constructor(classifier: Classifier, id: LionWebId, handleDelta?: DeltaHandler, parentInfo?: Parentage) {
        super(classifier, id, handleDelta, parentInfo);
        this._serialization = new OptionalSingleContainmentValueManager<NodeSerialization>(DeltasBase.INSTANCE.NodeType_serialization, this);
    }

    getContainmentValueManager(containment: Containment): ContainmentValueManager<INodeBase> {
        if (containment.key === DeltasBase.INSTANCE.NodeType_serialization.key) {
            return this._serialization;
        }
        return super.getContainmentValueManager(containment);
    }
}

export class IndexType extends NodeBase implements Type {
    static create(id: LionWebId, handleDelta?: DeltaHandler, parentInfo?: Parentage): IndexType {
        return new IndexType(DeltasBase.INSTANCE.IndexType, id, handleDelta, parentInfo);
    }
}

export class PrimitiveValueType extends NodeBase implements Type {
    static create(id: LionWebId, handleDelta?: DeltaHandler, parentInfo?: Parentage): PrimitiveValueType {
        return new PrimitiveValueType(DeltasBase.INSTANCE.PrimitiveValueType, id, handleDelta, parentInfo);
    }
}

export class CustomType extends NodeBase implements Type {
    static create(id: LionWebId, handleDelta?: DeltaHandler, parentInfo?: Parentage): CustomType {
        return new CustomType(DeltasBase.INSTANCE.CustomType, id, handleDelta, parentInfo);
    }

    private readonly _type: RequiredPropertyValueManager<string>;
    get type(): string {
        return this._type.get();
    }
    set type(newValue: string) {
        this._type.set(newValue);
    }

    private readonly _serializationType: RequiredPropertyValueManager<string>;
    get serializationType(): string {
        return this._serializationType.get();
    }
    set serializationType(newValue: string) {
        this._serializationType.set(newValue);
    }

    private readonly _serializationExpr: RequiredPropertyValueManager<string>;
    get serializationExpr(): string {
        return this._serializationExpr.get();
    }
    set serializationExpr(newValue: string) {
        this._serializationExpr.set(newValue);
    }

    private readonly _deserializationExpr: RequiredPropertyValueManager<string>;
    get deserializationExpr(): string {
        return this._deserializationExpr.get();
    }
    set deserializationExpr(newValue: string) {
        this._deserializationExpr.set(newValue);
    }

    public constructor(classifier: Classifier, id: LionWebId, handleDelta?: DeltaHandler, parentInfo?: Parentage) {
        super(classifier, id, handleDelta, parentInfo);
        this._type = new RequiredPropertyValueManager<string>(DeltasBase.INSTANCE.CustomType_type, this);
        this._serializationType = new RequiredPropertyValueManager<string>(DeltasBase.INSTANCE.CustomType_serializationType, this);
        this._serializationExpr = new RequiredPropertyValueManager<string>(DeltasBase.INSTANCE.CustomType_serializationExpr, this);
        this._deserializationExpr = new RequiredPropertyValueManager<string>(DeltasBase.INSTANCE.CustomType_deserializationExpr, this);
    }

    getPropertyValueManager(property: Property): PropertyValueManager<unknown> {
        switch (property.key) {
            case DeltasBase.INSTANCE.CustomType_type.key: return this._type;
            case DeltasBase.INSTANCE.CustomType_serializationType.key: return this._serializationType;
            case DeltasBase.INSTANCE.CustomType_serializationExpr.key: return this._serializationExpr;
            case DeltasBase.INSTANCE.CustomType_deserializationExpr.key: return this._deserializationExpr;
            default: return super.getPropertyValueManager(property);
        }
    }
}

export class Delta extends NodeBase implements INamed {
    static create(id: LionWebId, handleDelta?: DeltaHandler, parentInfo?: Parentage): Delta {
        return new Delta(DeltasBase.INSTANCE.Delta, id, handleDelta, parentInfo);
    }

    private readonly _documentation: OptionalPropertyValueManager<string>;
    get documentation(): string | undefined {
        return this._documentation.get();
    }
    set documentation(newValue: string | undefined) {
        this._documentation.set(newValue);
    }

    private readonly _fields: OptionalMultiContainmentValueManager<Field>;
    get fields(): Field[] {
        return this._fields.get();
    }
    addFields(newValue: Field) {
        this._fields.add(newValue);
    }
    removeFields(valueToRemove: Field) {
        this._fields.remove(valueToRemove);
    }
    addFieldsAtIndex(newValue: Field, index: number) {
        this._fields.insertAtIndex(newValue, index);
    }
    moveFields(oldIndex: number, newIndex: number) {
        this._fields.move(oldIndex, newIndex);
    }
    replaceFieldsAtIndex(movedChild: Field, newIndex: number) {
        this._fields.replaceAtIndex(movedChild, newIndex);
    }

    private readonly _name: RequiredPropertyValueManager<string>;
    get name(): string {
        return this._name.get();
    }
    set name(newValue: string) {
        this._name.set(newValue);
    }

    public constructor(classifier: Classifier, id: LionWebId, handleDelta?: DeltaHandler, parentInfo?: Parentage) {
        super(classifier, id, handleDelta, parentInfo);
        this._documentation = new OptionalPropertyValueManager<string>(DeltasBase.INSTANCE.Delta_documentation, this);
        this._fields = new OptionalMultiContainmentValueManager<Field>(DeltasBase.INSTANCE.Delta_fields, this);
        this._name = new RequiredPropertyValueManager<string>(LionCore_builtinsBase.INSTANCE.INamed_name, this);
    }

    getPropertyValueManager(property: Property): PropertyValueManager<unknown> {
        switch (property.key) {
            case DeltasBase.INSTANCE.Delta_documentation.key: return this._documentation;
            case LionCore_builtinsBase.INSTANCE.INamed_name.key: return this._name;
            default: return super.getPropertyValueManager(property);
        }
    }

    getContainmentValueManager(containment: Containment): ContainmentValueManager<INodeBase> {
        if (containment.key === DeltasBase.INSTANCE.Delta_fields.key) {
            return this._fields;
        }
        return super.getContainmentValueManager(containment);
    }
}

