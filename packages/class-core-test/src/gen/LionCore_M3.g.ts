/*
 * language's metadata:
 *     name:    LionCore_M3
 *     version: 2023.1
 *     key:     LionCore-M3
 *     id:      -id-LionCore-M3
 */


import * as $lwClassCore from "@lionweb/class-core";
import * as $lwCore from "@lionweb/core";
import * as $lwJson from "@lionweb/json";

export class LionCore_M3Base implements $lwClassCore.ILanguageBase {

    private readonly _language: $lwCore.Language = new $lwCore.Language("LionCore_M3", "2023.1", "-id-LionCore-M3", "LionCore-M3");
    get language(): $lwCore.Language {
        this.ensureWiredUp();
        return this._language;
    }

    public readonly _IKeyed = new $lwCore.Interface(this._language, "IKeyed", "IKeyed", "-id-IKeyed");
    get IKeyed(): $lwCore.Interface {
        this.ensureWiredUp();
        return this._IKeyed;
    }
    private readonly _IKeyed_key = new $lwCore.Property(this._IKeyed, "key", "IKeyed-key", "-id-IKeyed-key");
    get IKeyed_key(): $lwCore.Property {
        this.ensureWiredUp();
        return this._IKeyed_key;
    }

    public readonly _Feature = new $lwCore.Concept(this._language, "Feature", "Feature", "-id-Feature", $lwCore.ConceptModifier.abstract);
    get Feature(): $lwCore.Concept {
        this.ensureWiredUp();
        return this._Feature;
    }
    private readonly _Feature_optional = new $lwCore.Property(this._Feature, "optional", "Feature-optional", "-id-Feature-optional");
    get Feature_optional(): $lwCore.Property {
        this.ensureWiredUp();
        return this._Feature_optional;
    }

    public readonly _Property = new $lwCore.Concept(this._language, "Property", "Property", "-id-Property", $lwCore.ConceptModifier.concrete);
    get Property(): $lwCore.Concept {
        this.ensureWiredUp();
        return this._Property;
    }
    private readonly _Property_type = new $lwCore.Reference(this._Property, "type", "Property-type", "-id-Property-type");
    get Property_type(): $lwCore.Reference {
        this.ensureWiredUp();
        return this._Property_type;
    }

    public readonly _Link = new $lwCore.Concept(this._language, "Link", "Link", "-id-Link", $lwCore.ConceptModifier.abstract);
    get Link(): $lwCore.Concept {
        this.ensureWiredUp();
        return this._Link;
    }
    private readonly _Link_multiple = new $lwCore.Property(this._Link, "multiple", "Link-multiple", "-id-Link-multiple");
    get Link_multiple(): $lwCore.Property {
        this.ensureWiredUp();
        return this._Link_multiple;
    }
    private readonly _Link_type = new $lwCore.Reference(this._Link, "type", "Link-type", "-id-Link-type");
    get Link_type(): $lwCore.Reference {
        this.ensureWiredUp();
        return this._Link_type;
    }

    public readonly _Containment = new $lwCore.Concept(this._language, "Containment", "Containment", "-id-Containment", $lwCore.ConceptModifier.concrete);
    get Containment(): $lwCore.Concept {
        this.ensureWiredUp();
        return this._Containment;
    }

    public readonly _Reference = new $lwCore.Concept(this._language, "Reference", "Reference", "-id-Reference", $lwCore.ConceptModifier.concrete);
    get Reference(): $lwCore.Concept {
        this.ensureWiredUp();
        return this._Reference;
    }

    public readonly _LanguageEntity = new $lwCore.Concept(this._language, "LanguageEntity", "LanguageEntity", "-id-LanguageEntity", $lwCore.ConceptModifier.abstract);
    get LanguageEntity(): $lwCore.Concept {
        this.ensureWiredUp();
        return this._LanguageEntity;
    }

    public readonly _Classifier = new $lwCore.Concept(this._language, "Classifier", "Classifier", "-id-Classifier", $lwCore.ConceptModifier.abstract);
    get Classifier(): $lwCore.Concept {
        this.ensureWiredUp();
        return this._Classifier;
    }
    private readonly _Classifier_features = new $lwCore.Containment(this._Classifier, "features", "Classifier-features", "-id-Classifier-features").isOptional().isMultiple();
    get Classifier_features(): $lwCore.Containment {
        this.ensureWiredUp();
        return this._Classifier_features;
    }

    public readonly _Annotation = new $lwCore.Concept(this._language, "Annotation", "Annotation", "-id-Annotation", $lwCore.ConceptModifier.concrete);
    get Annotation(): $lwCore.Concept {
        this.ensureWiredUp();
        return this._Annotation;
    }
    private readonly _Annotation_annotates = new $lwCore.Reference(this._Annotation, "annotates", "Annotation-annotates", "-id-Annotation-annotates").isOptional();
    get Annotation_annotates(): $lwCore.Reference {
        this.ensureWiredUp();
        return this._Annotation_annotates;
    }
    private readonly _Annotation_extends = new $lwCore.Reference(this._Annotation, "extends", "Annotation-extends", "-id-Annotation-extends").isOptional();
    get Annotation_extends(): $lwCore.Reference {
        this.ensureWiredUp();
        return this._Annotation_extends;
    }
    private readonly _Annotation_implements = new $lwCore.Reference(this._Annotation, "implements", "Annotation-implements", "-id-Annotation-implements").isOptional().isMultiple();
    get Annotation_implements(): $lwCore.Reference {
        this.ensureWiredUp();
        return this._Annotation_implements;
    }

    public readonly _Concept = new $lwCore.Concept(this._language, "Concept", "Concept", "-id-Concept", $lwCore.ConceptModifier.concrete);
    get Concept(): $lwCore.Concept {
        this.ensureWiredUp();
        return this._Concept;
    }
    private readonly _Concept_abstract = new $lwCore.Property(this._Concept, "abstract", "Concept-abstract", "-id-Concept-abstract");
    get Concept_abstract(): $lwCore.Property {
        this.ensureWiredUp();
        return this._Concept_abstract;
    }
    private readonly _Concept_partition = new $lwCore.Property(this._Concept, "partition", "Concept-partition", "-id-Concept-partition");
    get Concept_partition(): $lwCore.Property {
        this.ensureWiredUp();
        return this._Concept_partition;
    }
    private readonly _Concept_extends = new $lwCore.Reference(this._Concept, "extends", "Concept-extends", "-id-Concept-extends").isOptional();
    get Concept_extends(): $lwCore.Reference {
        this.ensureWiredUp();
        return this._Concept_extends;
    }
    private readonly _Concept_implements = new $lwCore.Reference(this._Concept, "implements", "Concept-implements", "-id-Concept-implements").isOptional().isMultiple();
    get Concept_implements(): $lwCore.Reference {
        this.ensureWiredUp();
        return this._Concept_implements;
    }

    public readonly _Interface = new $lwCore.Concept(this._language, "Interface", "Interface", "-id-Interface", $lwCore.ConceptModifier.concrete);
    get Interface(): $lwCore.Concept {
        this.ensureWiredUp();
        return this._Interface;
    }
    private readonly _Interface_extends = new $lwCore.Reference(this._Interface, "extends", "Interface-extends", "-id-Interface-extends").isOptional().isMultiple();
    get Interface_extends(): $lwCore.Reference {
        this.ensureWiredUp();
        return this._Interface_extends;
    }

    public readonly _DataType = new $lwCore.Concept(this._language, "DataType", "DataType", "-id-DataType", $lwCore.ConceptModifier.abstract);
    get DataType(): $lwCore.Concept {
        this.ensureWiredUp();
        return this._DataType;
    }

    public readonly _PrimitiveType = new $lwCore.Concept(this._language, "PrimitiveType", "PrimitiveType", "-id-PrimitiveType", $lwCore.ConceptModifier.concrete);
    get PrimitiveType(): $lwCore.Concept {
        this.ensureWiredUp();
        return this._PrimitiveType;
    }

    public readonly _Enumeration = new $lwCore.Concept(this._language, "Enumeration", "Enumeration", "-id-Enumeration", $lwCore.ConceptModifier.concrete);
    get Enumeration(): $lwCore.Concept {
        this.ensureWiredUp();
        return this._Enumeration;
    }
    private readonly _Enumeration_literals = new $lwCore.Containment(this._Enumeration, "literals", "Enumeration-literals", "-id-Enumeration-literals").isOptional().isMultiple();
    get Enumeration_literals(): $lwCore.Containment {
        this.ensureWiredUp();
        return this._Enumeration_literals;
    }

    public readonly _EnumerationLiteral = new $lwCore.Concept(this._language, "EnumerationLiteral", "EnumerationLiteral", "-id-EnumerationLiteral", $lwCore.ConceptModifier.concrete);
    get EnumerationLiteral(): $lwCore.Concept {
        this.ensureWiredUp();
        return this._EnumerationLiteral;
    }

    public readonly _Language = new $lwCore.Concept(this._language, "Language", "Language", "-id-Language", $lwCore.ConceptModifier.concrete).isPartition();
    get Language(): $lwCore.Concept {
        this.ensureWiredUp();
        return this._Language;
    }
    private readonly _Language_version = new $lwCore.Property(this._Language, "version", "Language-version", "-id-Language-version");
    get Language_version(): $lwCore.Property {
        this.ensureWiredUp();
        return this._Language_version;
    }
    private readonly _Language_entities = new $lwCore.Containment(this._Language, "entities", "Language-entities", "-id-Language-entities").isOptional().isMultiple();
    get Language_entities(): $lwCore.Containment {
        this.ensureWiredUp();
        return this._Language_entities;
    }
    private readonly _Language_dependsOn = new $lwCore.Reference(this._Language, "dependsOn", "Language-dependsOn", "-id-Language-dependsOn").isOptional().isMultiple();
    get Language_dependsOn(): $lwCore.Reference {
        this.ensureWiredUp();
        return this._Language_dependsOn;
    }

    private _wiredUp: boolean = false;
    private ensureWiredUp() {
        if (this._wiredUp) {
            return;
        }
        this._language.havingEntities(this._IKeyed, this._Feature, this._Property, this._Link, this._Containment, this._Reference, this._LanguageEntity, this._Classifier, this._Annotation, this._Concept, this._Interface, this._DataType, this._PrimitiveType, this._Enumeration, this._EnumerationLiteral, this._Language);
        this._IKeyed.extending($lwClassCore.LionCore_builtinsBase.INSTANCE._INamed);
        this._IKeyed.havingFeatures(this._IKeyed_key);
        this._IKeyed_key.ofType($lwClassCore.LionCore_builtinsBase.INSTANCE._String);
        this._Feature.implementing(this._IKeyed);
        this._Feature.havingFeatures(this._Feature_optional);
        this._Feature_optional.ofType($lwClassCore.LionCore_builtinsBase.INSTANCE._Boolean);
        this._Property.extends = this._Feature;
        this._Property.havingFeatures(this._Property_type);
        this._Property_type.ofType(this._DataType);
        this._Link.extends = this._Feature;
        this._Link.havingFeatures(this._Link_multiple, this._Link_type);
        this._Link_multiple.ofType($lwClassCore.LionCore_builtinsBase.INSTANCE._Boolean);
        this._Link_type.ofType(this._Classifier);
        this._Containment.extends = this._Link;
        this._Reference.extends = this._Link;
        this._LanguageEntity.implementing(this._IKeyed);
        this._Classifier.extends = this._LanguageEntity;
        this._Classifier.havingFeatures(this._Classifier_features);
        this._Classifier_features.ofType(this._Feature);
        this._Annotation.extends = this._Classifier;
        this._Annotation.havingFeatures(this._Annotation_annotates, this._Annotation_extends, this._Annotation_implements);
        this._Annotation_annotates.ofType(this._Classifier);
        this._Annotation_extends.ofType(this._Annotation);
        this._Annotation_implements.ofType(this._Interface);
        this._Concept.extends = this._Classifier;
        this._Concept.havingFeatures(this._Concept_abstract, this._Concept_partition, this._Concept_extends, this._Concept_implements);
        this._Concept_abstract.ofType($lwClassCore.LionCore_builtinsBase.INSTANCE._Boolean);
        this._Concept_partition.ofType($lwClassCore.LionCore_builtinsBase.INSTANCE._Boolean);
        this._Concept_extends.ofType(this._Concept);
        this._Concept_implements.ofType(this._Interface);
        this._Interface.extends = this._Classifier;
        this._Interface.havingFeatures(this._Interface_extends);
        this._Interface_extends.ofType(this._Interface);
        this._DataType.extends = this._LanguageEntity;
        this._PrimitiveType.extends = this._DataType;
        this._Enumeration.extends = this._DataType;
        this._Enumeration.havingFeatures(this._Enumeration_literals);
        this._Enumeration_literals.ofType(this._EnumerationLiteral);
        this._EnumerationLiteral.implementing(this._IKeyed);
        this._Language.implementing(this._IKeyed);
        this._Language.havingFeatures(this._Language_version, this._Language_entities, this._Language_dependsOn);
        this._Language_version.ofType($lwClassCore.LionCore_builtinsBase.INSTANCE._String);
        this._Language_entities.ofType(this._LanguageEntity);
        this._Language_dependsOn.ofType(this._Language);
        this._wiredUp = true;
    }

    factory(receiveDelta?: $lwClassCore.DeltaReceiver): $lwClassCore.NodeBaseFactory {
        return (classifier: $lwCore.Classifier, id: $lwJson.LionWebId) => {
            switch (classifier.key) {
                case this._Property.key: return Property.create(id, receiveDelta);
                case this._Containment.key: return Containment.create(id, receiveDelta);
                case this._Reference.key: return Reference.create(id, receiveDelta);
                case this._Annotation.key: return Annotation.create(id, receiveDelta);
                case this._Concept.key: return Concept.create(id, receiveDelta);
                case this._Interface.key: return Interface.create(id, receiveDelta);
                case this._PrimitiveType.key: return PrimitiveType.create(id, receiveDelta);
                case this._Enumeration.key: return Enumeration.create(id, receiveDelta);
                case this._EnumerationLiteral.key: return EnumerationLiteral.create(id, receiveDelta);
                case this._Language.key: return Language.create(id, receiveDelta);
                default: {
                    const {language} = classifier;
                    throw new Error(`can't instantiate ${classifier.name} (key=${classifier.key}): classifier is not known in language ${language.name} (key=${language.key}, version=${language.version})`);
                }
            }
        }
    }

    enumLiteralFrom<EnumType>(enumerationLiteral: $lwCore.EnumerationLiteral): EnumType {
        const {enumeration} = enumerationLiteral;
        const {language} = enumeration;
        throw new Error(`enumeration with key ${enumeration.key} is not known in language ${language.name} (key=${language.key}, version=${language.version})`);
    }

    public static readonly INSTANCE = new LionCore_M3Base();
}


export interface IKeyed extends $lwClassCore.INamed {
    key: string;
}

export abstract class Feature extends $lwClassCore.NodeBase implements IKeyed {

    private readonly _optional: $lwClassCore.RequiredPropertyValueManager<boolean>;
    get optional(): boolean {
        return this._optional.get();
    }
    set optional(newValue: boolean) {
        this._optional.set(newValue);
    }

    private readonly _key: $lwClassCore.RequiredPropertyValueManager<string>;
    get key(): string {
        return this._key.get();
    }
    set key(newValue: string) {
        this._key.set(newValue);
    }

    private readonly _name: $lwClassCore.RequiredPropertyValueManager<string>;
    get name(): string {
        return this._name.get();
    }
    set name(newValue: string) {
        this._name.set(newValue);
    }

    protected constructor(classifier: $lwCore.Classifier, id: $lwJson.LionWebId, receiveDelta?: $lwClassCore.DeltaReceiver, parentInfo?: $lwClassCore.Parentage) {
        super(classifier, id, receiveDelta, parentInfo);
        this._optional = new $lwClassCore.RequiredPropertyValueManager<boolean>(LionCore_M3Base.INSTANCE.Feature_optional, this);
        this._key = new $lwClassCore.RequiredPropertyValueManager<string>(LionCore_M3Base.INSTANCE.IKeyed_key, this);
        this._name = new $lwClassCore.RequiredPropertyValueManager<string>($lwClassCore.LionCore_builtinsBase.INSTANCE.INamed_name, this);
    }

    getPropertyValueManager(property: $lwCore.Property): $lwClassCore.PropertyValueManager<unknown> {
        switch (property.key) {
            case LionCore_M3Base.INSTANCE.Feature_optional.key: return this._optional;
            case LionCore_M3Base.INSTANCE.IKeyed_key.key: return this._key;
            case $lwClassCore.LionCore_builtinsBase.INSTANCE.INamed_name.key: return this._name;
            default: return super.getPropertyValueManager(property);
        }
    }
}

export class Property extends Feature {
    static create(id: $lwJson.LionWebId, receiveDelta?: $lwClassCore.DeltaReceiver, parentInfo?: $lwClassCore.Parentage): Property {
        return new Property(LionCore_M3Base.INSTANCE.Property, id, receiveDelta, parentInfo);
    }

    private readonly _type: $lwClassCore.RequiredSingleReferenceValueManager<DataType>;
    get type(): $lwCore.SingleRef<DataType> {
        return this._type.get();
    }
    set type(newValue: $lwCore.SingleRef<DataType>) {
        this._type.set(newValue);
    }

    public constructor(classifier: $lwCore.Classifier, id: $lwJson.LionWebId, receiveDelta?: $lwClassCore.DeltaReceiver, parentInfo?: $lwClassCore.Parentage) {
        super(classifier, id, receiveDelta, parentInfo);
        this._type = new $lwClassCore.RequiredSingleReferenceValueManager<DataType>(LionCore_M3Base.INSTANCE.Property_type, this);
    }

    getReferenceValueManager(reference: $lwCore.Reference): $lwClassCore.ReferenceValueManager<$lwCore.Node> {
        if (reference.key === LionCore_M3Base.INSTANCE.Property_type.key) {
            return this._type;
        }
        return super.getReferenceValueManager(reference);
    }
}

export abstract class Link extends Feature {

    private readonly _multiple: $lwClassCore.RequiredPropertyValueManager<boolean>;
    get multiple(): boolean {
        return this._multiple.get();
    }
    set multiple(newValue: boolean) {
        this._multiple.set(newValue);
    }

    private readonly _type: $lwClassCore.RequiredSingleReferenceValueManager<Classifier>;
    get type(): $lwCore.SingleRef<Classifier> {
        return this._type.get();
    }
    set type(newValue: $lwCore.SingleRef<Classifier>) {
        this._type.set(newValue);
    }

    protected constructor(classifier: $lwCore.Classifier, id: $lwJson.LionWebId, receiveDelta?: $lwClassCore.DeltaReceiver, parentInfo?: $lwClassCore.Parentage) {
        super(classifier, id, receiveDelta, parentInfo);
        this._multiple = new $lwClassCore.RequiredPropertyValueManager<boolean>(LionCore_M3Base.INSTANCE.Link_multiple, this);
        this._type = new $lwClassCore.RequiredSingleReferenceValueManager<Classifier>(LionCore_M3Base.INSTANCE.Link_type, this);
    }

    getPropertyValueManager(property: $lwCore.Property): $lwClassCore.PropertyValueManager<unknown> {
        if (property.key === LionCore_M3Base.INSTANCE.Link_multiple.key) {
            return this._multiple;
        }
        return super.getPropertyValueManager(property);
    }

    getReferenceValueManager(reference: $lwCore.Reference): $lwClassCore.ReferenceValueManager<$lwCore.Node> {
        if (reference.key === LionCore_M3Base.INSTANCE.Link_type.key) {
            return this._type;
        }
        return super.getReferenceValueManager(reference);
    }
}

export class Containment extends Link {
    static create(id: $lwJson.LionWebId, receiveDelta?: $lwClassCore.DeltaReceiver, parentInfo?: $lwClassCore.Parentage): Containment {
        return new Containment(LionCore_M3Base.INSTANCE.Containment, id, receiveDelta, parentInfo);
    }
}

export class Reference extends Link {
    static create(id: $lwJson.LionWebId, receiveDelta?: $lwClassCore.DeltaReceiver, parentInfo?: $lwClassCore.Parentage): Reference {
        return new Reference(LionCore_M3Base.INSTANCE.Reference, id, receiveDelta, parentInfo);
    }
}

export abstract class LanguageEntity extends $lwClassCore.NodeBase implements IKeyed {

    private readonly _key: $lwClassCore.RequiredPropertyValueManager<string>;
    get key(): string {
        return this._key.get();
    }
    set key(newValue: string) {
        this._key.set(newValue);
    }

    private readonly _name: $lwClassCore.RequiredPropertyValueManager<string>;
    get name(): string {
        return this._name.get();
    }
    set name(newValue: string) {
        this._name.set(newValue);
    }

    protected constructor(classifier: $lwCore.Classifier, id: $lwJson.LionWebId, receiveDelta?: $lwClassCore.DeltaReceiver, parentInfo?: $lwClassCore.Parentage) {
        super(classifier, id, receiveDelta, parentInfo);
        this._key = new $lwClassCore.RequiredPropertyValueManager<string>(LionCore_M3Base.INSTANCE.IKeyed_key, this);
        this._name = new $lwClassCore.RequiredPropertyValueManager<string>($lwClassCore.LionCore_builtinsBase.INSTANCE.INamed_name, this);
    }

    getPropertyValueManager(property: $lwCore.Property): $lwClassCore.PropertyValueManager<unknown> {
        switch (property.key) {
            case LionCore_M3Base.INSTANCE.IKeyed_key.key: return this._key;
            case $lwClassCore.LionCore_builtinsBase.INSTANCE.INamed_name.key: return this._name;
            default: return super.getPropertyValueManager(property);
        }
    }
}

export abstract class Classifier extends LanguageEntity {

    private readonly _features: $lwClassCore.OptionalMultiContainmentValueManager<Feature>;
    get features(): Feature[] {
        return this._features.get();
    }
    addFeatures(newValue: Feature) {
        this._features.add(newValue);
    }
    removeFeatures(valueToRemove: Feature) {
        this._features.remove(valueToRemove);
    }
    addFeaturesAtIndex(newValue: Feature, index: number) {
        this._features.insertAtIndex(newValue, index);
    }
    moveFeatures(oldIndex: number, newIndex: number) {
        this._features.move(oldIndex, newIndex);
    }
    replaceFeaturesAtIndex(movedChild: Feature, newIndex: number) {
        this._features.replaceAtIndex(movedChild, newIndex);
    }
    moveFeaturesOffsetBased(oldIndex: number, indexOffset: number) {
        this._features.moveOffsetBased(oldIndex, indexOffset);
    }
    moveAndReplaceFeaturesOffsetBased(oldIndex: number, indexOffset: number) {
        this._features.moveAndReplaceOffsetBased(oldIndex, indexOffset);
    }

    protected constructor(classifier: $lwCore.Classifier, id: $lwJson.LionWebId, receiveDelta?: $lwClassCore.DeltaReceiver, parentInfo?: $lwClassCore.Parentage) {
        super(classifier, id, receiveDelta, parentInfo);
        this._features = new $lwClassCore.OptionalMultiContainmentValueManager<Feature>(LionCore_M3Base.INSTANCE.Classifier_features, this);
    }

    getContainmentValueManager(containment: $lwCore.Containment): $lwClassCore.ContainmentValueManager<$lwClassCore.INodeBase> {
        if (containment.key === LionCore_M3Base.INSTANCE.Classifier_features.key) {
            return this._features;
        }
        return super.getContainmentValueManager(containment);
    }
}

export class Annotation extends Classifier {
    static create(id: $lwJson.LionWebId, receiveDelta?: $lwClassCore.DeltaReceiver, parentInfo?: $lwClassCore.Parentage): Annotation {
        return new Annotation(LionCore_M3Base.INSTANCE.Annotation, id, receiveDelta, parentInfo);
    }

    private readonly _annotates: $lwClassCore.OptionalSingleReferenceValueManager<Classifier>;
    get annotates(): $lwCore.SingleRef<Classifier> | undefined {
        return this._annotates.get();
    }
    set annotates(newValue: $lwCore.SingleRef<Classifier> | undefined) {
        this._annotates.set(newValue);
    }

    private readonly _extends: $lwClassCore.OptionalSingleReferenceValueManager<Annotation>;
    get extends(): $lwCore.SingleRef<Annotation> | undefined {
        return this._extends.get();
    }
    set extends(newValue: $lwCore.SingleRef<Annotation> | undefined) {
        this._extends.set(newValue);
    }

    private readonly _implements: $lwClassCore.OptionalMultiReferenceValueManager<Interface>;
    get implements(): $lwCore.MultiRef<Interface> {
        return this._implements.get();
    }
    addImplements(newValue: Interface) {
        this._implements.add(newValue);
    }
    removeImplements(valueToRemove: Interface) {
        this._implements.remove(valueToRemove);
    }
    addImplementsAtIndex(newValue: Interface, index: number) {
        this._implements.insertAtIndex(newValue, index);
    }
    moveImplements(oldIndex: number, newIndex: number) {
        this._implements.move(oldIndex, newIndex);
    }

    public constructor(classifier: $lwCore.Classifier, id: $lwJson.LionWebId, receiveDelta?: $lwClassCore.DeltaReceiver, parentInfo?: $lwClassCore.Parentage) {
        super(classifier, id, receiveDelta, parentInfo);
        this._annotates = new $lwClassCore.OptionalSingleReferenceValueManager<Classifier>(LionCore_M3Base.INSTANCE.Annotation_annotates, this);
        this._extends = new $lwClassCore.OptionalSingleReferenceValueManager<Annotation>(LionCore_M3Base.INSTANCE.Annotation_extends, this);
        this._implements = new $lwClassCore.OptionalMultiReferenceValueManager<Interface>(LionCore_M3Base.INSTANCE.Annotation_implements, this);
    }

    getReferenceValueManager(reference: $lwCore.Reference): $lwClassCore.ReferenceValueManager<$lwCore.Node> {
        switch (reference.key) {
            case LionCore_M3Base.INSTANCE.Annotation_annotates.key: return this._annotates;
            case LionCore_M3Base.INSTANCE.Annotation_extends.key: return this._extends;
            case LionCore_M3Base.INSTANCE.Annotation_implements.key: return this._implements;
            default: return super.getReferenceValueManager(reference);
        }
    }
}

export class Concept extends Classifier {
    static create(id: $lwJson.LionWebId, receiveDelta?: $lwClassCore.DeltaReceiver, parentInfo?: $lwClassCore.Parentage): Concept {
        return new Concept(LionCore_M3Base.INSTANCE.Concept, id, receiveDelta, parentInfo);
    }

    private readonly _abstract: $lwClassCore.RequiredPropertyValueManager<boolean>;
    get abstract(): boolean {
        return this._abstract.get();
    }
    set abstract(newValue: boolean) {
        this._abstract.set(newValue);
    }

    private readonly _partition: $lwClassCore.RequiredPropertyValueManager<boolean>;
    get partition(): boolean {
        return this._partition.get();
    }
    set partition(newValue: boolean) {
        this._partition.set(newValue);
    }

    private readonly _extends: $lwClassCore.OptionalSingleReferenceValueManager<Concept>;
    get extends(): $lwCore.SingleRef<Concept> | undefined {
        return this._extends.get();
    }
    set extends(newValue: $lwCore.SingleRef<Concept> | undefined) {
        this._extends.set(newValue);
    }

    private readonly _implements: $lwClassCore.OptionalMultiReferenceValueManager<Interface>;
    get implements(): $lwCore.MultiRef<Interface> {
        return this._implements.get();
    }
    addImplements(newValue: Interface) {
        this._implements.add(newValue);
    }
    removeImplements(valueToRemove: Interface) {
        this._implements.remove(valueToRemove);
    }
    addImplementsAtIndex(newValue: Interface, index: number) {
        this._implements.insertAtIndex(newValue, index);
    }
    moveImplements(oldIndex: number, newIndex: number) {
        this._implements.move(oldIndex, newIndex);
    }

    public constructor(classifier: $lwCore.Classifier, id: $lwJson.LionWebId, receiveDelta?: $lwClassCore.DeltaReceiver, parentInfo?: $lwClassCore.Parentage) {
        super(classifier, id, receiveDelta, parentInfo);
        this._abstract = new $lwClassCore.RequiredPropertyValueManager<boolean>(LionCore_M3Base.INSTANCE.Concept_abstract, this);
        this._partition = new $lwClassCore.RequiredPropertyValueManager<boolean>(LionCore_M3Base.INSTANCE.Concept_partition, this);
        this._extends = new $lwClassCore.OptionalSingleReferenceValueManager<Concept>(LionCore_M3Base.INSTANCE.Concept_extends, this);
        this._implements = new $lwClassCore.OptionalMultiReferenceValueManager<Interface>(LionCore_M3Base.INSTANCE.Concept_implements, this);
    }

    getPropertyValueManager(property: $lwCore.Property): $lwClassCore.PropertyValueManager<unknown> {
        switch (property.key) {
            case LionCore_M3Base.INSTANCE.Concept_abstract.key: return this._abstract;
            case LionCore_M3Base.INSTANCE.Concept_partition.key: return this._partition;
            default: return super.getPropertyValueManager(property);
        }
    }

    getReferenceValueManager(reference: $lwCore.Reference): $lwClassCore.ReferenceValueManager<$lwCore.Node> {
        switch (reference.key) {
            case LionCore_M3Base.INSTANCE.Concept_extends.key: return this._extends;
            case LionCore_M3Base.INSTANCE.Concept_implements.key: return this._implements;
            default: return super.getReferenceValueManager(reference);
        }
    }
}

export class Interface extends Classifier {
    static create(id: $lwJson.LionWebId, receiveDelta?: $lwClassCore.DeltaReceiver, parentInfo?: $lwClassCore.Parentage): Interface {
        return new Interface(LionCore_M3Base.INSTANCE.Interface, id, receiveDelta, parentInfo);
    }

    private readonly _extends: $lwClassCore.OptionalMultiReferenceValueManager<Interface>;
    get extends(): $lwCore.MultiRef<Interface> {
        return this._extends.get();
    }
    addExtends(newValue: Interface) {
        this._extends.add(newValue);
    }
    removeExtends(valueToRemove: Interface) {
        this._extends.remove(valueToRemove);
    }
    addExtendsAtIndex(newValue: Interface, index: number) {
        this._extends.insertAtIndex(newValue, index);
    }
    moveExtends(oldIndex: number, newIndex: number) {
        this._extends.move(oldIndex, newIndex);
    }

    public constructor(classifier: $lwCore.Classifier, id: $lwJson.LionWebId, receiveDelta?: $lwClassCore.DeltaReceiver, parentInfo?: $lwClassCore.Parentage) {
        super(classifier, id, receiveDelta, parentInfo);
        this._extends = new $lwClassCore.OptionalMultiReferenceValueManager<Interface>(LionCore_M3Base.INSTANCE.Interface_extends, this);
    }

    getReferenceValueManager(reference: $lwCore.Reference): $lwClassCore.ReferenceValueManager<$lwCore.Node> {
        if (reference.key === LionCore_M3Base.INSTANCE.Interface_extends.key) {
            return this._extends;
        }
        return super.getReferenceValueManager(reference);
    }
}

export abstract class DataType extends LanguageEntity {
}

export class PrimitiveType extends DataType {
    static create(id: $lwJson.LionWebId, receiveDelta?: $lwClassCore.DeltaReceiver, parentInfo?: $lwClassCore.Parentage): PrimitiveType {
        return new PrimitiveType(LionCore_M3Base.INSTANCE.PrimitiveType, id, receiveDelta, parentInfo);
    }
}

export class Enumeration extends DataType {
    static create(id: $lwJson.LionWebId, receiveDelta?: $lwClassCore.DeltaReceiver, parentInfo?: $lwClassCore.Parentage): Enumeration {
        return new Enumeration(LionCore_M3Base.INSTANCE.Enumeration, id, receiveDelta, parentInfo);
    }

    private readonly _literals: $lwClassCore.OptionalMultiContainmentValueManager<EnumerationLiteral>;
    get literals(): EnumerationLiteral[] {
        return this._literals.get();
    }
    addLiterals(newValue: EnumerationLiteral) {
        this._literals.add(newValue);
    }
    removeLiterals(valueToRemove: EnumerationLiteral) {
        this._literals.remove(valueToRemove);
    }
    addLiteralsAtIndex(newValue: EnumerationLiteral, index: number) {
        this._literals.insertAtIndex(newValue, index);
    }
    moveLiterals(oldIndex: number, newIndex: number) {
        this._literals.move(oldIndex, newIndex);
    }
    replaceLiteralsAtIndex(movedChild: EnumerationLiteral, newIndex: number) {
        this._literals.replaceAtIndex(movedChild, newIndex);
    }
    moveLiteralsOffsetBased(oldIndex: number, indexOffset: number) {
        this._literals.moveOffsetBased(oldIndex, indexOffset);
    }
    moveAndReplaceLiteralsOffsetBased(oldIndex: number, indexOffset: number) {
        this._literals.moveAndReplaceOffsetBased(oldIndex, indexOffset);
    }

    public constructor(classifier: $lwCore.Classifier, id: $lwJson.LionWebId, receiveDelta?: $lwClassCore.DeltaReceiver, parentInfo?: $lwClassCore.Parentage) {
        super(classifier, id, receiveDelta, parentInfo);
        this._literals = new $lwClassCore.OptionalMultiContainmentValueManager<EnumerationLiteral>(LionCore_M3Base.INSTANCE.Enumeration_literals, this);
    }

    getContainmentValueManager(containment: $lwCore.Containment): $lwClassCore.ContainmentValueManager<$lwClassCore.INodeBase> {
        if (containment.key === LionCore_M3Base.INSTANCE.Enumeration_literals.key) {
            return this._literals;
        }
        return super.getContainmentValueManager(containment);
    }
}

export class EnumerationLiteral extends $lwClassCore.NodeBase implements IKeyed {
    static create(id: $lwJson.LionWebId, receiveDelta?: $lwClassCore.DeltaReceiver, parentInfo?: $lwClassCore.Parentage): EnumerationLiteral {
        return new EnumerationLiteral(LionCore_M3Base.INSTANCE.EnumerationLiteral, id, receiveDelta, parentInfo);
    }

    private readonly _key: $lwClassCore.RequiredPropertyValueManager<string>;
    get key(): string {
        return this._key.get();
    }
    set key(newValue: string) {
        this._key.set(newValue);
    }

    private readonly _name: $lwClassCore.RequiredPropertyValueManager<string>;
    get name(): string {
        return this._name.get();
    }
    set name(newValue: string) {
        this._name.set(newValue);
    }

    public constructor(classifier: $lwCore.Classifier, id: $lwJson.LionWebId, receiveDelta?: $lwClassCore.DeltaReceiver, parentInfo?: $lwClassCore.Parentage) {
        super(classifier, id, receiveDelta, parentInfo);
        this._key = new $lwClassCore.RequiredPropertyValueManager<string>(LionCore_M3Base.INSTANCE.IKeyed_key, this);
        this._name = new $lwClassCore.RequiredPropertyValueManager<string>($lwClassCore.LionCore_builtinsBase.INSTANCE.INamed_name, this);
    }

    getPropertyValueManager(property: $lwCore.Property): $lwClassCore.PropertyValueManager<unknown> {
        switch (property.key) {
            case LionCore_M3Base.INSTANCE.IKeyed_key.key: return this._key;
            case $lwClassCore.LionCore_builtinsBase.INSTANCE.INamed_name.key: return this._name;
            default: return super.getPropertyValueManager(property);
        }
    }
}

export class Language extends $lwClassCore.NodeBase implements IKeyed {
    static create(id: $lwJson.LionWebId, receiveDelta?: $lwClassCore.DeltaReceiver, parentInfo?: $lwClassCore.Parentage): Language {
        return new Language(LionCore_M3Base.INSTANCE.Language, id, receiveDelta, parentInfo);
    }

    private readonly _version: $lwClassCore.RequiredPropertyValueManager<string>;
    get version(): string {
        return this._version.get();
    }
    set version(newValue: string) {
        this._version.set(newValue);
    }

    private readonly _entities: $lwClassCore.OptionalMultiContainmentValueManager<LanguageEntity>;
    get entities(): LanguageEntity[] {
        return this._entities.get();
    }
    addEntities(newValue: LanguageEntity) {
        this._entities.add(newValue);
    }
    removeEntities(valueToRemove: LanguageEntity) {
        this._entities.remove(valueToRemove);
    }
    addEntitiesAtIndex(newValue: LanguageEntity, index: number) {
        this._entities.insertAtIndex(newValue, index);
    }
    moveEntities(oldIndex: number, newIndex: number) {
        this._entities.move(oldIndex, newIndex);
    }
    replaceEntitiesAtIndex(movedChild: LanguageEntity, newIndex: number) {
        this._entities.replaceAtIndex(movedChild, newIndex);
    }
    moveEntitiesOffsetBased(oldIndex: number, indexOffset: number) {
        this._entities.moveOffsetBased(oldIndex, indexOffset);
    }
    moveAndReplaceEntitiesOffsetBased(oldIndex: number, indexOffset: number) {
        this._entities.moveAndReplaceOffsetBased(oldIndex, indexOffset);
    }

    private readonly _dependsOn: $lwClassCore.OptionalMultiReferenceValueManager<Language>;
    get dependsOn(): $lwCore.MultiRef<Language> {
        return this._dependsOn.get();
    }
    addDependsOn(newValue: Language) {
        this._dependsOn.add(newValue);
    }
    removeDependsOn(valueToRemove: Language) {
        this._dependsOn.remove(valueToRemove);
    }
    addDependsOnAtIndex(newValue: Language, index: number) {
        this._dependsOn.insertAtIndex(newValue, index);
    }
    moveDependsOn(oldIndex: number, newIndex: number) {
        this._dependsOn.move(oldIndex, newIndex);
    }

    private readonly _key: $lwClassCore.RequiredPropertyValueManager<string>;
    get key(): string {
        return this._key.get();
    }
    set key(newValue: string) {
        this._key.set(newValue);
    }

    private readonly _name: $lwClassCore.RequiredPropertyValueManager<string>;
    get name(): string {
        return this._name.get();
    }
    set name(newValue: string) {
        this._name.set(newValue);
    }

    public constructor(classifier: $lwCore.Classifier, id: $lwJson.LionWebId, receiveDelta?: $lwClassCore.DeltaReceiver, parentInfo?: $lwClassCore.Parentage) {
        super(classifier, id, receiveDelta, parentInfo);
        this._version = new $lwClassCore.RequiredPropertyValueManager<string>(LionCore_M3Base.INSTANCE.Language_version, this);
        this._entities = new $lwClassCore.OptionalMultiContainmentValueManager<LanguageEntity>(LionCore_M3Base.INSTANCE.Language_entities, this);
        this._dependsOn = new $lwClassCore.OptionalMultiReferenceValueManager<Language>(LionCore_M3Base.INSTANCE.Language_dependsOn, this);
        this._key = new $lwClassCore.RequiredPropertyValueManager<string>(LionCore_M3Base.INSTANCE.IKeyed_key, this);
        this._name = new $lwClassCore.RequiredPropertyValueManager<string>($lwClassCore.LionCore_builtinsBase.INSTANCE.INamed_name, this);
    }

    getPropertyValueManager(property: $lwCore.Property): $lwClassCore.PropertyValueManager<unknown> {
        switch (property.key) {
            case LionCore_M3Base.INSTANCE.Language_version.key: return this._version;
            case LionCore_M3Base.INSTANCE.IKeyed_key.key: return this._key;
            case $lwClassCore.LionCore_builtinsBase.INSTANCE.INamed_name.key: return this._name;
            default: return super.getPropertyValueManager(property);
        }
    }

    getContainmentValueManager(containment: $lwCore.Containment): $lwClassCore.ContainmentValueManager<$lwClassCore.INodeBase> {
        if (containment.key === LionCore_M3Base.INSTANCE.Language_entities.key) {
            return this._entities;
        }
        return super.getContainmentValueManager(containment);
    }

    getReferenceValueManager(reference: $lwCore.Reference): $lwClassCore.ReferenceValueManager<$lwCore.Node> {
        if (reference.key === LionCore_M3Base.INSTANCE.Language_dependsOn.key) {
            return this._dependsOn;
        }
        return super.getReferenceValueManager(reference);
    }
}

