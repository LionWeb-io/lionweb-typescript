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
 *     name:    Shapes
 *     version: 1
 *     key:     key-Shapes
 *     id:      id-Shapes
 */


import {
    Annotation,
    Classifier,
    Concept,
    Containment,
    Enumeration,
    EnumerationLiteral,
    Interface,
    Language,
    PrimitiveType,
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
    OptionalMultiReferenceValueManager,
    OptionalPropertyValueManager,
    OptionalSingleContainmentValueManager,
    OptionalSingleReferenceValueManager,
    Parentage,
    PropertyValueManager,
    ReferenceValueManager,
    RequiredMultiContainmentValueManager,
    RequiredMultiReferenceValueManager,
    RequiredPropertyValueManager,
    RequiredSingleContainmentValueManager,
    RequiredSingleReferenceValueManager
} from "@lionweb/class-core";


export class ShapesBase implements ILanguageBase {

    private readonly _language: Language = new Language("Shapes", "1", "id-Shapes", "key-Shapes");
    get language(): Language {
        this.ensureWiredUp();
        return this._language;
    }

    public readonly _Circle = new Concept(this._language, "Circle", "key-Circle", "id-Circle", false);
    get Circle(): Concept {
        this.ensureWiredUp();
        return this._Circle;
    }
    private readonly _Circle_r = new Property(this._Circle, "r", "key-r", "id-r");
    get Circle_r(): Property {
        this.ensureWiredUp();
        return this._Circle_r;
    }
    private readonly _Circle_center = new Containment(this._Circle, "center", "key-center", "id-center");
    get Circle_center(): Containment {
        this.ensureWiredUp();
        return this._Circle_center;
    }

    public readonly _Coord = new Concept(this._language, "Coord", "key-Coord", "id-Coord", false);
    get Coord(): Concept {
        this.ensureWiredUp();
        return this._Coord;
    }
    private readonly _Coord_x = new Property(this._Coord, "x", "key-x", "id-x");
    get Coord_x(): Property {
        this.ensureWiredUp();
        return this._Coord_x;
    }
    private readonly _Coord_y = new Property(this._Coord, "y", "key-y", "id-y");
    get Coord_y(): Property {
        this.ensureWiredUp();
        return this._Coord_y;
    }
    private readonly _Coord_z = new Property(this._Coord, "z", "key-z", "id-z");
    get Coord_z(): Property {
        this.ensureWiredUp();
        return this._Coord_z;
    }

    public readonly _Geometry = new Concept(this._language, "Geometry", "key-Geometry", "id-Geometry", false).isPartition();
    get Geometry(): Concept {
        this.ensureWiredUp();
        return this._Geometry;
    }
    private readonly _Geometry_shapes = new Containment(this._Geometry, "shapes", "key-shapes", "id-shapes").isOptional().isMultiple();
    get Geometry_shapes(): Containment {
        this.ensureWiredUp();
        return this._Geometry_shapes;
    }
    private readonly _Geometry_documentation = new Containment(this._Geometry, "documentation", "key-documentation", "id-documentation").isOptional();
    get Geometry_documentation(): Containment {
        this.ensureWiredUp();
        return this._Geometry_documentation;
    }

    public readonly _IShape = new Interface(this._language, "IShape", "key-IShape", "id-IShape");
    get IShape(): Interface {
        this.ensureWiredUp();
        return this._IShape;
    }
    private readonly _IShape_uuid = new Property(this._IShape, "uuid", "key-uuid", "id-uuid");
    get IShape_uuid(): Property {
        this.ensureWiredUp();
        return this._IShape_uuid;
    }
    private readonly _IShape_fixpoints = new Containment(this._IShape, "fixpoints", "key-fixpoints", "id-fixpoints").isOptional().isMultiple();
    get IShape_fixpoints(): Containment {
        this.ensureWiredUp();
        return this._IShape_fixpoints;
    }

    public readonly _Line = new Concept(this._language, "Line", "key-Line", "id-Line", false);
    get Line(): Concept {
        this.ensureWiredUp();
        return this._Line;
    }
    private readonly _Line_start = new Containment(this._Line, "start", "key-start", "id-start");
    get Line_start(): Containment {
        this.ensureWiredUp();
        return this._Line_start;
    }
    private readonly _Line_end = new Containment(this._Line, "end", "key-end", "id-end");
    get Line_end(): Containment {
        this.ensureWiredUp();
        return this._Line_end;
    }

    public readonly _OffsetDuplicate = new Concept(this._language, "OffsetDuplicate", "key-OffsetDuplicate", "id-OffsetDuplicate", false);
    get OffsetDuplicate(): Concept {
        this.ensureWiredUp();
        return this._OffsetDuplicate;
    }
    private readonly _OffsetDuplicate_offset = new Containment(this._OffsetDuplicate, "offset", "key-offset", "id-offset");
    get OffsetDuplicate_offset(): Containment {
        this.ensureWiredUp();
        return this._OffsetDuplicate_offset;
    }
    private readonly _OffsetDuplicate_source = new Reference(this._OffsetDuplicate, "source", "key-source", "id-source");
    get OffsetDuplicate_source(): Reference {
        this.ensureWiredUp();
        return this._OffsetDuplicate_source;
    }
    private readonly _OffsetDuplicate_altSource = new Reference(this._OffsetDuplicate, "altSource", "key-alt-source", "id-alt-source").isOptional();
    get OffsetDuplicate_altSource(): Reference {
        this.ensureWiredUp();
        return this._OffsetDuplicate_altSource;
    }
    private readonly _OffsetDuplicate_docs = new Containment(this._OffsetDuplicate, "docs", "key-docs", "id-docs").isOptional();
    get OffsetDuplicate_docs(): Containment {
        this.ensureWiredUp();
        return this._OffsetDuplicate_docs;
    }
    private readonly _OffsetDuplicate_secretDocs = new Containment(this._OffsetDuplicate, "secretDocs", "key-secret-docs", "id-secret-docs").isOptional();
    get OffsetDuplicate_secretDocs(): Containment {
        this.ensureWiredUp();
        return this._OffsetDuplicate_secretDocs;
    }

    public readonly _Shape = new Concept(this._language, "Shape", "key-Shape", "id-Shape", true);
    get Shape(): Concept {
        this.ensureWiredUp();
        return this._Shape;
    }
    private readonly _Shape_shapeDocs = new Containment(this._Shape, "shapeDocs", "key-shape-docs", "id-shape-docs").isOptional();
    get Shape_shapeDocs(): Containment {
        this.ensureWiredUp();
        return this._Shape_shapeDocs;
    }

    public readonly _CompositeShape = new Concept(this._language, "CompositeShape", "key-CompositeShape", "id-CompositeShape", false);
    get CompositeShape(): Concept {
        this.ensureWiredUp();
        return this._CompositeShape;
    }
    private readonly _CompositeShape_parts = new Containment(this._CompositeShape, "parts", "key-parts", "id-parts").isMultiple();
    get CompositeShape_parts(): Containment {
        this.ensureWiredUp();
        return this._CompositeShape_parts;
    }
    private readonly _CompositeShape_disabledParts = new Containment(this._CompositeShape, "disabledParts", "key-disabled-parts", "id-disabled-parts").isMultiple();
    get CompositeShape_disabledParts(): Containment {
        this.ensureWiredUp();
        return this._CompositeShape_disabledParts;
    }
    private readonly _CompositeShape_evilPart = new Containment(this._CompositeShape, "evilPart", "key-evil-part", "id-evil-part");
    get CompositeShape_evilPart(): Containment {
        this.ensureWiredUp();
        return this._CompositeShape_evilPart;
    }

    public readonly _ReferenceGeometry = new Concept(this._language, "ReferenceGeometry", "key-ReferenceGeometry", "id-ReferenceGeometry", false).isPartition();
    get ReferenceGeometry(): Concept {
        this.ensureWiredUp();
        return this._ReferenceGeometry;
    }
    private readonly _ReferenceGeometry_shapes = new Reference(this._ReferenceGeometry, "shapes", "key-shapes-references", "id-shape-references").isOptional().isMultiple();
    get ReferenceGeometry_shapes(): Reference {
        this.ensureWiredUp();
        return this._ReferenceGeometry_shapes;
    }

    public readonly _Documentation = new Annotation(this._language, "Documentation", "key-Documentation", "id-Documentation");
    get Documentation(): Annotation {
        this.ensureWiredUp();
        return this._Documentation;
    }
    private readonly _Documentation_text = new Property(this._Documentation, "text", "key-text", "id-text").isOptional();
    get Documentation_text(): Property {
        this.ensureWiredUp();
        return this._Documentation_text;
    }
    private readonly _Documentation_technical = new Property(this._Documentation, "technical", "key-technical", "id-technical").isOptional();
    get Documentation_technical(): Property {
        this.ensureWiredUp();
        return this._Documentation_technical;
    }

    public readonly _BillOfMaterials = new Annotation(this._language, "BillOfMaterials", "key-BillOfMaterials", "id-BillOfMaterials");
    get BillOfMaterials(): Annotation {
        this.ensureWiredUp();
        return this._BillOfMaterials;
    }
    private readonly _BillOfMaterials_materials = new Reference(this._BillOfMaterials, "materials", "key-materials", "id-materials").isOptional().isMultiple();
    get BillOfMaterials_materials(): Reference {
        this.ensureWiredUp();
        return this._BillOfMaterials_materials;
    }
    private readonly _BillOfMaterials_groups = new Containment(this._BillOfMaterials, "groups", "key-groups", "id-groups").isOptional().isMultiple();
    get BillOfMaterials_groups(): Containment {
        this.ensureWiredUp();
        return this._BillOfMaterials_groups;
    }
    private readonly _BillOfMaterials_altGroups = new Containment(this._BillOfMaterials, "altGroups", "key-alt-groups", "id-alt-groups").isOptional().isMultiple();
    get BillOfMaterials_altGroups(): Containment {
        this.ensureWiredUp();
        return this._BillOfMaterials_altGroups;
    }
    private readonly _BillOfMaterials_defaultGroup = new Containment(this._BillOfMaterials, "defaultGroup", "key-default-group", "id-default-group").isOptional();
    get BillOfMaterials_defaultGroup(): Containment {
        this.ensureWiredUp();
        return this._BillOfMaterials_defaultGroup;
    }

    public readonly _MaterialGroup = new Concept(this._language, "MaterialGroup", "key-MaterialGroup", "id-MaterialGroup", false);
    get MaterialGroup(): Concept {
        this.ensureWiredUp();
        return this._MaterialGroup;
    }
    private readonly _MaterialGroup_matterState = new Property(this._MaterialGroup, "matterState", "key-matter-state", "id-matter-state").isOptional();
    get MaterialGroup_matterState(): Property {
        this.ensureWiredUp();
        return this._MaterialGroup_matterState;
    }
    private readonly _MaterialGroup_materials = new Reference(this._MaterialGroup, "materials", "key-group-materials", "id-group-materials").isMultiple();
    get MaterialGroup_materials(): Reference {
        this.ensureWiredUp();
        return this._MaterialGroup_materials;
    }
    private readonly _MaterialGroup_defaultShape = new Containment(this._MaterialGroup, "defaultShape", "key-default-shape", "id-default-shape").isOptional();
    get MaterialGroup_defaultShape(): Containment {
        this.ensureWiredUp();
        return this._MaterialGroup_defaultShape;
    }

    public readonly _MatterState = new Enumeration(this._language, "MatterState", "key-MatterState", "id-MatterState");
    get MatterState(): Enumeration {
        this.ensureWiredUp();
        return this._MatterState;
    }
    private readonly _MatterState_solid = new EnumerationLiteral(this._MatterState, "solid", "key-solid", "id-solid");
    get MatterState_solid(): EnumerationLiteral {
        this.ensureWiredUp();
        return this._MatterState_solid;
    }
    private readonly _MatterState_liquid = new EnumerationLiteral(this._MatterState, "liquid", "key-liquid", "id-liquid");
    get MatterState_liquid(): EnumerationLiteral {
        this.ensureWiredUp();
        return this._MatterState_liquid;
    }
    private readonly _MatterState_gas = new EnumerationLiteral(this._MatterState, "gas", "key-gas", "id-gas");
    get MatterState_gas(): EnumerationLiteral {
        this.ensureWiredUp();
        return this._MatterState_gas;
    }

    public readonly _Time = new PrimitiveType(this._language, "Time", "key-Time", "id-Time");
    get Time(): PrimitiveType {
        this.ensureWiredUp();
        return this._Time;
    }

    private _wiredUp: boolean = false;
    private ensureWiredUp() {
        if (this._wiredUp) {
            return;
        }
        this._language.havingEntities(this._Circle, this._Coord, this._Geometry, this._IShape, this._Line, this._OffsetDuplicate, this._Shape, this._CompositeShape, this._ReferenceGeometry, this._Documentation, this._BillOfMaterials, this._MaterialGroup, this._MatterState, this._Time);
        this._Circle.extends = this._Shape;
        this._Circle.havingFeatures(this._Circle_r, this._Circle_center);
        this._Circle_r.ofType(LionCore_builtinsBase.INSTANCE._Integer);
        this._Circle_center.ofType(this._Coord);
        this._Coord.havingFeatures(this._Coord_x, this._Coord_y, this._Coord_z);
        this._Coord_x.ofType(LionCore_builtinsBase.INSTANCE._Integer);
        this._Coord_y.ofType(LionCore_builtinsBase.INSTANCE._Integer);
        this._Coord_z.ofType(LionCore_builtinsBase.INSTANCE._Integer);
        this._Geometry.havingFeatures(this._Geometry_shapes, this._Geometry_documentation);
        this._Geometry_shapes.ofType(this._IShape);
        this._Geometry_documentation.ofType(this._Documentation);
        this._IShape.havingFeatures(this._IShape_uuid, this._IShape_fixpoints);
        this._IShape_uuid.ofType(LionCore_builtinsBase.INSTANCE._String);
        this._IShape_fixpoints.ofType(this._Coord);
        this._Line.extends = this._Shape;
        this._Line.implementing(LionCore_builtinsBase.INSTANCE._INamed);
        this._Line.havingFeatures(this._Line_start, this._Line_end);
        this._Line_start.ofType(this._Coord);
        this._Line_end.ofType(this._Coord);
        this._OffsetDuplicate.extends = this._Shape;
        this._OffsetDuplicate.havingFeatures(this._OffsetDuplicate_offset, this._OffsetDuplicate_source, this._OffsetDuplicate_altSource, this._OffsetDuplicate_docs, this._OffsetDuplicate_secretDocs);
        this._OffsetDuplicate_offset.ofType(this._Coord);
        this._OffsetDuplicate_source.ofType(this._Shape);
        this._OffsetDuplicate_altSource.ofType(this._Shape);
        this._OffsetDuplicate_docs.ofType(this._Documentation);
        this._OffsetDuplicate_secretDocs.ofType(this._Documentation);
        this._Shape.implementing(LionCore_builtinsBase.INSTANCE._INamed, this._IShape);
        this._Shape.havingFeatures(this._Shape_shapeDocs);
        this._Shape_shapeDocs.ofType(this._Documentation);
        this._CompositeShape.extends = this._Shape;
        this._CompositeShape.havingFeatures(this._CompositeShape_parts, this._CompositeShape_disabledParts, this._CompositeShape_evilPart);
        this._CompositeShape_parts.ofType(this._IShape);
        this._CompositeShape_disabledParts.ofType(this._IShape);
        this._CompositeShape_evilPart.ofType(this._IShape);
        this._ReferenceGeometry.havingFeatures(this._ReferenceGeometry_shapes);
        this._ReferenceGeometry_shapes.ofType(this._IShape);
        this._Documentation.havingFeatures(this._Documentation_text, this._Documentation_technical);
        this._Documentation_text.ofType(LionCore_builtinsBase.INSTANCE._String).isOptional();
        this._Documentation_technical.ofType(LionCore_builtinsBase.INSTANCE._Boolean).isOptional();
        this._BillOfMaterials.havingFeatures(this._BillOfMaterials_materials, this._BillOfMaterials_groups, this._BillOfMaterials_altGroups, this._BillOfMaterials_defaultGroup);
        this._BillOfMaterials_materials.ofType(this._IShape);
        this._BillOfMaterials_groups.ofType(this._MaterialGroup);
        this._BillOfMaterials_altGroups.ofType(this._MaterialGroup);
        this._BillOfMaterials_defaultGroup.ofType(this._MaterialGroup);
        this._MaterialGroup.havingFeatures(this._MaterialGroup_matterState, this._MaterialGroup_materials, this._MaterialGroup_defaultShape);
        this._MaterialGroup_matterState.ofType(this._MatterState).isOptional();
        this._MaterialGroup_materials.ofType(this._IShape);
        this._MaterialGroup_defaultShape.ofType(this._IShape);
        this._MatterState.havingLiterals(this._MatterState_solid, this._MatterState_liquid, this._MatterState_gas);
        this._wiredUp = true;
    }

    factory(handleDelta?: DeltaHandler): NodeBaseFactory {
        return (classifier: Classifier, id: LionWebId) => {
            switch (classifier.key) {
                case this._Circle.key: return Circle.create(id, handleDelta);
                case this._Coord.key: return Coord.create(id, handleDelta);
                case this._Geometry.key: return Geometry.create(id, handleDelta);
                case this._Line.key: return Line.create(id, handleDelta);
                case this._OffsetDuplicate.key: return OffsetDuplicate.create(id, handleDelta);
                case this._CompositeShape.key: return CompositeShape.create(id, handleDelta);
                case this._ReferenceGeometry.key: return ReferenceGeometry.create(id, handleDelta);
                case this._Documentation.key: return Documentation.create(id, handleDelta);
                case this._BillOfMaterials.key: return BillOfMaterials.create(id, handleDelta);
                case this._MaterialGroup.key: return MaterialGroup.create(id, handleDelta);
                default: {
                    const {language} = classifier;
                    throw new Error(`can't instantiate ${classifier.name} (key=${classifier.key}): classifier is not known in language ${language.name} (key=${language.key}, version=${language.version})`);
                }
            }
        }
    }

    enumLiteralFrom<EnumType>(enumerationLiteral: EnumerationLiteral): EnumType {
        const {enumeration} = enumerationLiteral;
        if (enumeration.key === this._MatterState.key) {
            return enumerationLiteral.key as EnumType;
        }
        const {language} = enumeration;
        throw new Error(`enumeration with key ${enumeration.key} is not known in language ${language.name} (key=${language.key}, version=${language.version})`);
    }

    public static readonly INSTANCE = new ShapesBase();
}


export abstract class Shape extends NodeBase implements INamed, IShape {

    private readonly _shapeDocs: OptionalSingleContainmentValueManager<Documentation>;
    get shapeDocs(): Documentation | undefined {
        return this._shapeDocs.get();
    }
    set shapeDocs(newValue: Documentation | undefined) {
        this._shapeDocs.set(newValue);
    }

    private readonly _name: RequiredPropertyValueManager<string>;
    get name(): string {
        return this._name.get();
    }
    set name(newValue: string) {
        this._name.set(newValue);
    }

    private readonly _uuid: RequiredPropertyValueManager<string>;
    get uuid(): string {
        return this._uuid.get();
    }
    set uuid(newValue: string) {
        this._uuid.set(newValue);
    }

    private readonly _fixpoints: OptionalMultiContainmentValueManager<Coord>;
    get fixpoints(): Coord[] {
        return this._fixpoints.get();
    }
    addFixpoints(newValue: Coord) {
        this._fixpoints.add(newValue);
    }
    removeFixpoints(valueToRemove: Coord) {
        this._fixpoints.remove(valueToRemove);
    }
    addFixpointsAtIndex(newValue: Coord, index: number) {
        this._fixpoints.insertAtIndex(newValue, index);
    }
    moveFixpoints(oldIndex: number, newIndex: number) {
        this._fixpoints.move(oldIndex, newIndex);
    }

    protected constructor(classifier: Classifier, id: LionWebId, handleDelta?: DeltaHandler, parentInfo?: Parentage) {
        super(classifier, id, handleDelta, parentInfo);
        this._shapeDocs = new OptionalSingleContainmentValueManager<Documentation>(ShapesBase.INSTANCE.Shape_shapeDocs, this);
        this._name = new RequiredPropertyValueManager<string>(LionCore_builtinsBase.INSTANCE.INamed_name, this);
        this._uuid = new RequiredPropertyValueManager<string>(ShapesBase.INSTANCE.IShape_uuid, this);
        this._fixpoints = new OptionalMultiContainmentValueManager<Coord>(ShapesBase.INSTANCE.IShape_fixpoints, this);
    }

    getPropertyValueManager(property: Property): PropertyValueManager<unknown> {
        switch (property.key) {
            case LionCore_builtinsBase.INSTANCE.INamed_name.key: return this._name;
            case ShapesBase.INSTANCE.IShape_uuid.key: return this._uuid;
            default: return super.getPropertyValueManager(property);
        }
    }

    getContainmentValueManager(containment: Containment): ContainmentValueManager<INodeBase> {
        switch (containment.key) {
            case ShapesBase.INSTANCE.Shape_shapeDocs.key: return this._shapeDocs;
            case ShapesBase.INSTANCE.IShape_fixpoints.key: return this._fixpoints;
            default: return super.getContainmentValueManager(containment);
        }
    }
}

export class Circle extends Shape {
    static create(id: LionWebId, handleDelta?: DeltaHandler, parentInfo?: Parentage): Circle {
        return new Circle(ShapesBase.INSTANCE.Circle, id, handleDelta, parentInfo);
    }

    private readonly _r: RequiredPropertyValueManager<number>;
    get r(): number {
        return this._r.get();
    }
    set r(newValue: number) {
        this._r.set(newValue);
    }

    private readonly _center: RequiredSingleContainmentValueManager<Coord>;
    get center(): Coord {
        return this._center.get();
    }
    set center(newValue: Coord) {
        this._center.set(newValue);
    }

    public constructor(classifier: Classifier, id: LionWebId, handleDelta?: DeltaHandler, parentInfo?: Parentage) {
        super(classifier, id, handleDelta, parentInfo);
        this._r = new RequiredPropertyValueManager<number>(ShapesBase.INSTANCE.Circle_r, this);
        this._center = new RequiredSingleContainmentValueManager<Coord>(ShapesBase.INSTANCE.Circle_center, this);
    }

    getPropertyValueManager(property: Property): PropertyValueManager<unknown> {
        if (property.key === ShapesBase.INSTANCE.Circle_r.key) {
            return this._r;
        }
        return super.getPropertyValueManager(property);
    }

    getContainmentValueManager(containment: Containment): ContainmentValueManager<INodeBase> {
        if (containment.key === ShapesBase.INSTANCE.Circle_center.key) {
            return this._center;
        }
        return super.getContainmentValueManager(containment);
    }
}

export class Coord extends NodeBase {
    static create(id: LionWebId, handleDelta?: DeltaHandler, parentInfo?: Parentage): Coord {
        return new Coord(ShapesBase.INSTANCE.Coord, id, handleDelta, parentInfo);
    }

    private readonly _x: RequiredPropertyValueManager<number>;
    get x(): number {
        return this._x.get();
    }
    set x(newValue: number) {
        this._x.set(newValue);
    }

    private readonly _y: RequiredPropertyValueManager<number>;
    get y(): number {
        return this._y.get();
    }
    set y(newValue: number) {
        this._y.set(newValue);
    }

    private readonly _z: RequiredPropertyValueManager<number>;
    get z(): number {
        return this._z.get();
    }
    set z(newValue: number) {
        this._z.set(newValue);
    }

    public constructor(classifier: Classifier, id: LionWebId, handleDelta?: DeltaHandler, parentInfo?: Parentage) {
        super(classifier, id, handleDelta, parentInfo);
        this._x = new RequiredPropertyValueManager<number>(ShapesBase.INSTANCE.Coord_x, this);
        this._y = new RequiredPropertyValueManager<number>(ShapesBase.INSTANCE.Coord_y, this);
        this._z = new RequiredPropertyValueManager<number>(ShapesBase.INSTANCE.Coord_z, this);
    }

    getPropertyValueManager(property: Property): PropertyValueManager<unknown> {
        switch (property.key) {
            case ShapesBase.INSTANCE.Coord_x.key: return this._x;
            case ShapesBase.INSTANCE.Coord_y.key: return this._y;
            case ShapesBase.INSTANCE.Coord_z.key: return this._z;
            default: return super.getPropertyValueManager(property);
        }
    }
}

export class Geometry extends NodeBase {
    static create(id: LionWebId, handleDelta?: DeltaHandler, parentInfo?: Parentage): Geometry {
        return new Geometry(ShapesBase.INSTANCE.Geometry, id, handleDelta, parentInfo);
    }

    private readonly _shapes: OptionalMultiContainmentValueManager<IShape>;
    get shapes(): IShape[] {
        return this._shapes.get();
    }
    addShapes(newValue: IShape) {
        this._shapes.add(newValue);
    }
    removeShapes(valueToRemove: IShape) {
        this._shapes.remove(valueToRemove);
    }
    addShapesAtIndex(newValue: IShape, index: number) {
        this._shapes.insertAtIndex(newValue, index);
    }
    moveShapes(oldIndex: number, newIndex: number) {
        this._shapes.move(oldIndex, newIndex);
    }

    private readonly _documentation: OptionalSingleContainmentValueManager<Documentation>;
    get documentation(): Documentation | undefined {
        return this._documentation.get();
    }
    set documentation(newValue: Documentation | undefined) {
        this._documentation.set(newValue);
    }

    public constructor(classifier: Classifier, id: LionWebId, handleDelta?: DeltaHandler, parentInfo?: Parentage) {
        super(classifier, id, handleDelta, parentInfo);
        this._shapes = new OptionalMultiContainmentValueManager<IShape>(ShapesBase.INSTANCE.Geometry_shapes, this);
        this._documentation = new OptionalSingleContainmentValueManager<Documentation>(ShapesBase.INSTANCE.Geometry_documentation, this);
    }

    getContainmentValueManager(containment: Containment): ContainmentValueManager<INodeBase> {
        switch (containment.key) {
            case ShapesBase.INSTANCE.Geometry_shapes.key: return this._shapes;
            case ShapesBase.INSTANCE.Geometry_documentation.key: return this._documentation;
            default: return super.getContainmentValueManager(containment);
        }
    }
}

export interface IShape extends INodeBase {
    uuid: string;
    fixpoints: Coord[];
}

export class Line extends Shape implements INamed {
    static create(id: LionWebId, handleDelta?: DeltaHandler, parentInfo?: Parentage): Line {
        return new Line(ShapesBase.INSTANCE.Line, id, handleDelta, parentInfo);
    }

    private readonly _start: RequiredSingleContainmentValueManager<Coord>;
    get start(): Coord {
        return this._start.get();
    }
    set start(newValue: Coord) {
        this._start.set(newValue);
    }

    private readonly _end: RequiredSingleContainmentValueManager<Coord>;
    get end(): Coord {
        return this._end.get();
    }
    set end(newValue: Coord) {
        this._end.set(newValue);
    }

    public constructor(classifier: Classifier, id: LionWebId, handleDelta?: DeltaHandler, parentInfo?: Parentage) {
        super(classifier, id, handleDelta, parentInfo);
        this._start = new RequiredSingleContainmentValueManager<Coord>(ShapesBase.INSTANCE.Line_start, this);
        this._end = new RequiredSingleContainmentValueManager<Coord>(ShapesBase.INSTANCE.Line_end, this);
    }

    getContainmentValueManager(containment: Containment): ContainmentValueManager<INodeBase> {
        switch (containment.key) {
            case ShapesBase.INSTANCE.Line_start.key: return this._start;
            case ShapesBase.INSTANCE.Line_end.key: return this._end;
            default: return super.getContainmentValueManager(containment);
        }
    }
}

export class OffsetDuplicate extends Shape {
    static create(id: LionWebId, handleDelta?: DeltaHandler, parentInfo?: Parentage): OffsetDuplicate {
        return new OffsetDuplicate(ShapesBase.INSTANCE.OffsetDuplicate, id, handleDelta, parentInfo);
    }

    private readonly _offset: RequiredSingleContainmentValueManager<Coord>;
    get offset(): Coord {
        return this._offset.get();
    }
    set offset(newValue: Coord) {
        this._offset.set(newValue);
    }

    private readonly _source: RequiredSingleReferenceValueManager<Shape>;
    get source(): SingleRef<Shape> {
        return this._source.get();
    }
    set source(newValue: SingleRef<Shape>) {
        this._source.set(newValue);
    }

    private readonly _altSource: OptionalSingleReferenceValueManager<Shape>;
    get altSource(): SingleRef<Shape> | undefined {
        return this._altSource.get();
    }
    set altSource(newValue: SingleRef<Shape> | undefined) {
        this._altSource.set(newValue);
    }

    private readonly _docs: OptionalSingleContainmentValueManager<Documentation>;
    get docs(): Documentation | undefined {
        return this._docs.get();
    }
    set docs(newValue: Documentation | undefined) {
        this._docs.set(newValue);
    }

    private readonly _secretDocs: OptionalSingleContainmentValueManager<Documentation>;
    get secretDocs(): Documentation | undefined {
        return this._secretDocs.get();
    }
    set secretDocs(newValue: Documentation | undefined) {
        this._secretDocs.set(newValue);
    }

    public constructor(classifier: Classifier, id: LionWebId, handleDelta?: DeltaHandler, parentInfo?: Parentage) {
        super(classifier, id, handleDelta, parentInfo);
        this._offset = new RequiredSingleContainmentValueManager<Coord>(ShapesBase.INSTANCE.OffsetDuplicate_offset, this);
        this._source = new RequiredSingleReferenceValueManager<Shape>(ShapesBase.INSTANCE.OffsetDuplicate_source, this);
        this._altSource = new OptionalSingleReferenceValueManager<Shape>(ShapesBase.INSTANCE.OffsetDuplicate_altSource, this);
        this._docs = new OptionalSingleContainmentValueManager<Documentation>(ShapesBase.INSTANCE.OffsetDuplicate_docs, this);
        this._secretDocs = new OptionalSingleContainmentValueManager<Documentation>(ShapesBase.INSTANCE.OffsetDuplicate_secretDocs, this);
    }

    getContainmentValueManager(containment: Containment): ContainmentValueManager<INodeBase> {
        switch (containment.key) {
            case ShapesBase.INSTANCE.OffsetDuplicate_offset.key: return this._offset;
            case ShapesBase.INSTANCE.OffsetDuplicate_docs.key: return this._docs;
            case ShapesBase.INSTANCE.OffsetDuplicate_secretDocs.key: return this._secretDocs;
            default: return super.getContainmentValueManager(containment);
        }
    }

    getReferenceValueManager(reference: Reference): ReferenceValueManager<INodeBase> {
        switch (reference.key) {
            case ShapesBase.INSTANCE.OffsetDuplicate_source.key: return this._source;
            case ShapesBase.INSTANCE.OffsetDuplicate_altSource.key: return this._altSource;
            default: return super.getReferenceValueManager(reference);
        }
    }
}

export class CompositeShape extends Shape {
    static create(id: LionWebId, handleDelta?: DeltaHandler, parentInfo?: Parentage): CompositeShape {
        return new CompositeShape(ShapesBase.INSTANCE.CompositeShape, id, handleDelta, parentInfo);
    }

    private readonly _parts: RequiredMultiContainmentValueManager<IShape>;
    get parts(): IShape[] {
        return this._parts.get();
    }
    addParts(newValue: IShape) {
        this._parts.add(newValue);
    }
    removeParts(valueToRemove: IShape) {
        this._parts.remove(valueToRemove);
    }
    addPartsAtIndex(newValue: IShape, index: number) {
        this._parts.insertAtIndex(newValue, index);
    }
    moveParts(oldIndex: number, newIndex: number) {
        this._parts.move(oldIndex, newIndex);
    }

    private readonly _disabledParts: RequiredMultiContainmentValueManager<IShape>;
    get disabledParts(): IShape[] {
        return this._disabledParts.get();
    }
    addDisabledParts(newValue: IShape) {
        this._disabledParts.add(newValue);
    }
    removeDisabledParts(valueToRemove: IShape) {
        this._disabledParts.remove(valueToRemove);
    }
    addDisabledPartsAtIndex(newValue: IShape, index: number) {
        this._disabledParts.insertAtIndex(newValue, index);
    }
    moveDisabledParts(oldIndex: number, newIndex: number) {
        this._disabledParts.move(oldIndex, newIndex);
    }

    private readonly _evilPart: RequiredSingleContainmentValueManager<IShape>;
    get evilPart(): IShape {
        return this._evilPart.get();
    }
    set evilPart(newValue: IShape) {
        this._evilPart.set(newValue);
    }

    public constructor(classifier: Classifier, id: LionWebId, handleDelta?: DeltaHandler, parentInfo?: Parentage) {
        super(classifier, id, handleDelta, parentInfo);
        this._parts = new RequiredMultiContainmentValueManager<IShape>(ShapesBase.INSTANCE.CompositeShape_parts, this);
        this._disabledParts = new RequiredMultiContainmentValueManager<IShape>(ShapesBase.INSTANCE.CompositeShape_disabledParts, this);
        this._evilPart = new RequiredSingleContainmentValueManager<IShape>(ShapesBase.INSTANCE.CompositeShape_evilPart, this);
    }

    getContainmentValueManager(containment: Containment): ContainmentValueManager<INodeBase> {
        switch (containment.key) {
            case ShapesBase.INSTANCE.CompositeShape_parts.key: return this._parts;
            case ShapesBase.INSTANCE.CompositeShape_disabledParts.key: return this._disabledParts;
            case ShapesBase.INSTANCE.CompositeShape_evilPart.key: return this._evilPart;
            default: return super.getContainmentValueManager(containment);
        }
    }
}

export class ReferenceGeometry extends NodeBase {
    static create(id: LionWebId, handleDelta?: DeltaHandler, parentInfo?: Parentage): ReferenceGeometry {
        return new ReferenceGeometry(ShapesBase.INSTANCE.ReferenceGeometry, id, handleDelta, parentInfo);
    }

    private readonly _shapes: OptionalMultiReferenceValueManager<IShape>;
    get shapes(): SingleRef<IShape>[] {
        return this._shapes.get();
    }
    addShapes(newValue: IShape) {
        this._shapes.add(newValue);
    }
    removeShapes(valueToRemove: IShape) {
        this._shapes.remove(valueToRemove);
    }
    addShapesAtIndex(newValue: IShape, index: number) {
        this._shapes.insertAtIndex(newValue, index);
    }
    moveShapes(oldIndex: number, newIndex: number) {
        this._shapes.move(oldIndex, newIndex);
    }

    public constructor(classifier: Classifier, id: LionWebId, handleDelta?: DeltaHandler, parentInfo?: Parentage) {
        super(classifier, id, handleDelta, parentInfo);
        this._shapes = new OptionalMultiReferenceValueManager<IShape>(ShapesBase.INSTANCE.ReferenceGeometry_shapes, this);
    }

    getReferenceValueManager(reference: Reference): ReferenceValueManager<INodeBase> {
        if (reference.key === ShapesBase.INSTANCE.ReferenceGeometry_shapes.key) {
            return this._shapes;
        }
        return super.getReferenceValueManager(reference);
    }
}

export class Documentation extends NodeBase {
    static create(id: LionWebId, handleDelta?: DeltaHandler, parentInfo?: Parentage): Documentation {
        return new Documentation(ShapesBase.INSTANCE.Documentation, id, handleDelta, parentInfo);
    }

    private readonly _text: OptionalPropertyValueManager<string>;
    get text(): string | undefined {
        return this._text.get();
    }
    set text(newValue: string | undefined) {
        this._text.set(newValue);
    }

    private readonly _technical: OptionalPropertyValueManager<boolean>;
    get technical(): boolean | undefined {
        return this._technical.get();
    }
    set technical(newValue: boolean | undefined) {
        this._technical.set(newValue);
    }

    public constructor(classifier: Classifier, id: LionWebId, handleDelta?: DeltaHandler, parentInfo?: Parentage) {
        super(classifier, id, handleDelta, parentInfo);
        this._text = new OptionalPropertyValueManager<string>(ShapesBase.INSTANCE.Documentation_text, this);
        this._technical = new OptionalPropertyValueManager<boolean>(ShapesBase.INSTANCE.Documentation_technical, this);
    }

    getPropertyValueManager(property: Property): PropertyValueManager<unknown> {
        switch (property.key) {
            case ShapesBase.INSTANCE.Documentation_text.key: return this._text;
            case ShapesBase.INSTANCE.Documentation_technical.key: return this._technical;
            default: return super.getPropertyValueManager(property);
        }
    }
}

export class BillOfMaterials extends NodeBase {
    static create(id: LionWebId, handleDelta?: DeltaHandler, parentInfo?: Parentage): BillOfMaterials {
        return new BillOfMaterials(ShapesBase.INSTANCE.BillOfMaterials, id, handleDelta, parentInfo);
    }

    private readonly _materials: OptionalMultiReferenceValueManager<IShape>;
    get materials(): SingleRef<IShape>[] {
        return this._materials.get();
    }
    addMaterials(newValue: IShape) {
        this._materials.add(newValue);
    }
    removeMaterials(valueToRemove: IShape) {
        this._materials.remove(valueToRemove);
    }
    addMaterialsAtIndex(newValue: IShape, index: number) {
        this._materials.insertAtIndex(newValue, index);
    }
    moveMaterials(oldIndex: number, newIndex: number) {
        this._materials.move(oldIndex, newIndex);
    }

    private readonly _groups: OptionalMultiContainmentValueManager<MaterialGroup>;
    get groups(): MaterialGroup[] {
        return this._groups.get();
    }
    addGroups(newValue: MaterialGroup) {
        this._groups.add(newValue);
    }
    removeGroups(valueToRemove: MaterialGroup) {
        this._groups.remove(valueToRemove);
    }
    addGroupsAtIndex(newValue: MaterialGroup, index: number) {
        this._groups.insertAtIndex(newValue, index);
    }
    moveGroups(oldIndex: number, newIndex: number) {
        this._groups.move(oldIndex, newIndex);
    }

    private readonly _altGroups: OptionalMultiContainmentValueManager<MaterialGroup>;
    get altGroups(): MaterialGroup[] {
        return this._altGroups.get();
    }
    addAltGroups(newValue: MaterialGroup) {
        this._altGroups.add(newValue);
    }
    removeAltGroups(valueToRemove: MaterialGroup) {
        this._altGroups.remove(valueToRemove);
    }
    addAltGroupsAtIndex(newValue: MaterialGroup, index: number) {
        this._altGroups.insertAtIndex(newValue, index);
    }
    moveAltGroups(oldIndex: number, newIndex: number) {
        this._altGroups.move(oldIndex, newIndex);
    }

    private readonly _defaultGroup: OptionalSingleContainmentValueManager<MaterialGroup>;
    get defaultGroup(): MaterialGroup | undefined {
        return this._defaultGroup.get();
    }
    set defaultGroup(newValue: MaterialGroup | undefined) {
        this._defaultGroup.set(newValue);
    }

    public constructor(classifier: Classifier, id: LionWebId, handleDelta?: DeltaHandler, parentInfo?: Parentage) {
        super(classifier, id, handleDelta, parentInfo);
        this._materials = new OptionalMultiReferenceValueManager<IShape>(ShapesBase.INSTANCE.BillOfMaterials_materials, this);
        this._groups = new OptionalMultiContainmentValueManager<MaterialGroup>(ShapesBase.INSTANCE.BillOfMaterials_groups, this);
        this._altGroups = new OptionalMultiContainmentValueManager<MaterialGroup>(ShapesBase.INSTANCE.BillOfMaterials_altGroups, this);
        this._defaultGroup = new OptionalSingleContainmentValueManager<MaterialGroup>(ShapesBase.INSTANCE.BillOfMaterials_defaultGroup, this);
    }

    getContainmentValueManager(containment: Containment): ContainmentValueManager<INodeBase> {
        switch (containment.key) {
            case ShapesBase.INSTANCE.BillOfMaterials_groups.key: return this._groups;
            case ShapesBase.INSTANCE.BillOfMaterials_altGroups.key: return this._altGroups;
            case ShapesBase.INSTANCE.BillOfMaterials_defaultGroup.key: return this._defaultGroup;
            default: return super.getContainmentValueManager(containment);
        }
    }

    getReferenceValueManager(reference: Reference): ReferenceValueManager<INodeBase> {
        if (reference.key === ShapesBase.INSTANCE.BillOfMaterials_materials.key) {
            return this._materials;
        }
        return super.getReferenceValueManager(reference);
    }
}

export class MaterialGroup extends NodeBase {
    static create(id: LionWebId, handleDelta?: DeltaHandler, parentInfo?: Parentage): MaterialGroup {
        return new MaterialGroup(ShapesBase.INSTANCE.MaterialGroup, id, handleDelta, parentInfo);
    }

    private readonly _matterState: OptionalPropertyValueManager<MatterState>;
    get matterState(): MatterState | undefined {
        return this._matterState.get();
    }
    set matterState(newValue: MatterState | undefined) {
        this._matterState.set(newValue);
    }

    private readonly _materials: RequiredMultiReferenceValueManager<IShape>;
    get materials(): SingleRef<IShape>[] {
        return this._materials.get();
    }
    addMaterials(newValue: IShape) {
        this._materials.add(newValue);
    }
    removeMaterials(valueToRemove: IShape) {
        this._materials.remove(valueToRemove);
    }
    addMaterialsAtIndex(newValue: IShape, index: number) {
        this._materials.insertAtIndex(newValue, index);
    }
    moveMaterials(oldIndex: number, newIndex: number) {
        this._materials.move(oldIndex, newIndex);
    }

    private readonly _defaultShape: OptionalSingleContainmentValueManager<IShape>;
    get defaultShape(): IShape | undefined {
        return this._defaultShape.get();
    }
    set defaultShape(newValue: IShape | undefined) {
        this._defaultShape.set(newValue);
    }

    public constructor(classifier: Classifier, id: LionWebId, handleDelta?: DeltaHandler, parentInfo?: Parentage) {
        super(classifier, id, handleDelta, parentInfo);
        this._matterState = new OptionalPropertyValueManager<MatterState>(ShapesBase.INSTANCE.MaterialGroup_matterState, this);
        this._materials = new RequiredMultiReferenceValueManager<IShape>(ShapesBase.INSTANCE.MaterialGroup_materials, this);
        this._defaultShape = new OptionalSingleContainmentValueManager<IShape>(ShapesBase.INSTANCE.MaterialGroup_defaultShape, this);
    }

    getPropertyValueManager(property: Property): PropertyValueManager<unknown> {
        if (property.key === ShapesBase.INSTANCE.MaterialGroup_matterState.key) {
            return this._matterState;
        }
        return super.getPropertyValueManager(property);
    }

    getContainmentValueManager(containment: Containment): ContainmentValueManager<INodeBase> {
        if (containment.key === ShapesBase.INSTANCE.MaterialGroup_defaultShape.key) {
            return this._defaultShape;
        }
        return super.getContainmentValueManager(containment);
    }

    getReferenceValueManager(reference: Reference): ReferenceValueManager<INodeBase> {
        if (reference.key === ShapesBase.INSTANCE.MaterialGroup_materials.key) {
            return this._materials;
        }
        return super.getReferenceValueManager(reference);
    }
}

export enum MatterState {
    solid = "key-solid",
    liquid = "key-liquid",
    gas = "key-gas"
}

export type Time = string;

