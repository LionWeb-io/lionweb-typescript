/*
 * language's metadata:
 *     name:    io.lionweb.mps.specific
 *     version: 2024-01
 *     key:     io-lionweb-mps-specific
 *     id:      io-lionweb-mps-specific
 */


import * as $lwClassCore from "@lionweb/class-core";
import * as $lwCore from "@lionweb/core";
import * as $lwJson from "@lionweb/json";

export class io_lionweb_mps_specificBase implements $lwClassCore.ILanguageBase {

    private readonly _language: $lwCore.Language = new $lwCore.Language("io_lionweb_mps_specific", "2024-01", "io-lionweb-mps-specific", "io-lionweb-mps-specific");
    get language(): $lwCore.Language {
        this.ensureWiredUp();
        return this._language;
    }

    public readonly _ConceptDescription = new $lwCore.Annotation(this._language, "ConceptDescription", "ConceptDescription", "ConceptDescription");
    get ConceptDescription(): $lwCore.Annotation {
        this.ensureWiredUp();
        return this._ConceptDescription;
    }
    private readonly _ConceptDescription_conceptAlias = new $lwCore.Property(this._ConceptDescription, "conceptAlias", "ConceptDescription-conceptAlias", "ConceptDescription-conceptAlias").isOptional();
    get ConceptDescription_conceptAlias(): $lwCore.Property {
        this.ensureWiredUp();
        return this._ConceptDescription_conceptAlias;
    }
    private readonly _ConceptDescription_conceptShortDescription = new $lwCore.Property(this._ConceptDescription, "conceptShortDescription", "ConceptDescription-conceptShortDescription", "ConceptDescription-conceptShortDescription").isOptional();
    get ConceptDescription_conceptShortDescription(): $lwCore.Property {
        this.ensureWiredUp();
        return this._ConceptDescription_conceptShortDescription;
    }
    private readonly _ConceptDescription_helpUrl = new $lwCore.Property(this._ConceptDescription, "helpUrl", "ConceptDescription-helpUrl", "ConceptDescription-helpUrl").isOptional();
    get ConceptDescription_helpUrl(): $lwCore.Property {
        this.ensureWiredUp();
        return this._ConceptDescription_helpUrl;
    }

    public readonly _Deprecated = new $lwCore.Annotation(this._language, "Deprecated", "Deprecated", "Deprecated");
    get Deprecated(): $lwCore.Annotation {
        this.ensureWiredUp();
        return this._Deprecated;
    }
    private readonly _Deprecated_comment = new $lwCore.Property(this._Deprecated, "comment", "Deprecated-comment", "Deprecated-comment").isOptional();
    get Deprecated_comment(): $lwCore.Property {
        this.ensureWiredUp();
        return this._Deprecated_comment;
    }
    private readonly _Deprecated_build = new $lwCore.Property(this._Deprecated, "build", "Deprecated-build", "Deprecated-build").isOptional();
    get Deprecated_build(): $lwCore.Property {
        this.ensureWiredUp();
        return this._Deprecated_build;
    }

    public readonly _KeyedDescription = new $lwCore.Annotation(this._language, "KeyedDescription", "KeyedDescription", "KeyedDescription");
    get KeyedDescription(): $lwCore.Annotation {
        this.ensureWiredUp();
        return this._KeyedDescription;
    }
    private readonly _KeyedDescription_documentation = new $lwCore.Property(this._KeyedDescription, "documentation", "KeyedDescription-documentation", "KeyedDescription-documentation").isOptional();
    get KeyedDescription_documentation(): $lwCore.Property {
        this.ensureWiredUp();
        return this._KeyedDescription_documentation;
    }
    private readonly _KeyedDescription_seeAlso = new $lwCore.Reference(this._KeyedDescription, "seeAlso", "KeyedDescription-seeAlso", "KeyedDescription-seeAlso").isOptional().isMultiple();
    get KeyedDescription_seeAlso(): $lwCore.Reference {
        this.ensureWiredUp();
        return this._KeyedDescription_seeAlso;
    }

    public readonly _ShortDescription = new $lwCore.Annotation(this._language, "ShortDescription", "ShortDescription", "ShortDescription");
    get ShortDescription(): $lwCore.Annotation {
        this.ensureWiredUp();
        return this._ShortDescription;
    }
    private readonly _ShortDescription_description = new $lwCore.Property(this._ShortDescription, "description", "ShortDescription-description", "ShortDescription-description").isOptional();
    get ShortDescription_description(): $lwCore.Property {
        this.ensureWiredUp();
        return this._ShortDescription_description;
    }

    public readonly _VirtualPackage = new $lwCore.Annotation(this._language, "VirtualPackage", "VirtualPackage", "VirtualPackage");
    get VirtualPackage(): $lwCore.Annotation {
        this.ensureWiredUp();
        return this._VirtualPackage;
    }

    private _wiredUp: boolean = false;
    private ensureWiredUp() {
        if (this._wiredUp) {
            return;
        }
        this._language.havingEntities(this._ConceptDescription, this._Deprecated, this._KeyedDescription, this._ShortDescription, this._VirtualPackage);
        this._ConceptDescription.havingFeatures(this._ConceptDescription_conceptAlias, this._ConceptDescription_conceptShortDescription, this._ConceptDescription_helpUrl);
        this._ConceptDescription_conceptAlias.ofType($lwClassCore.LionCore_builtinsBase.INSTANCE._String).isOptional();
        this._ConceptDescription_conceptShortDescription.ofType($lwClassCore.LionCore_builtinsBase.INSTANCE._String).isOptional();
        this._ConceptDescription_helpUrl.ofType($lwClassCore.LionCore_builtinsBase.INSTANCE._String).isOptional();
        this._Deprecated.havingFeatures(this._Deprecated_comment, this._Deprecated_build);
        this._Deprecated_comment.ofType($lwClassCore.LionCore_builtinsBase.INSTANCE._String).isOptional();
        this._Deprecated_build.ofType($lwClassCore.LionCore_builtinsBase.INSTANCE._String).isOptional();
        this._KeyedDescription.havingFeatures(this._KeyedDescription_documentation, this._KeyedDescription_seeAlso);
        this._KeyedDescription_documentation.ofType($lwClassCore.LionCore_builtinsBase.INSTANCE._String).isOptional();
        this._KeyedDescription_seeAlso.ofType($lwClassCore.LionCore_builtinsBase.INSTANCE._Node);
        this._ShortDescription.havingFeatures(this._ShortDescription_description);
        this._ShortDescription_description.ofType($lwClassCore.LionCore_builtinsBase.INSTANCE._String).isOptional();
        this._VirtualPackage.implementing($lwClassCore.LionCore_builtinsBase.INSTANCE._INamed);
        this._wiredUp = true;
    }

    factory(receiveDelta?: $lwClassCore.DeltaReceiver): $lwClassCore.NodeBaseFactory {
        return (classifier: $lwCore.Classifier, id: $lwJson.LionWebId) => {
            switch (classifier.key) {
                case this._ConceptDescription.key: return ConceptDescription.create(id, receiveDelta);
                case this._Deprecated.key: return Deprecated.create(id, receiveDelta);
                case this._KeyedDescription.key: return KeyedDescription.create(id, receiveDelta);
                case this._ShortDescription.key: return ShortDescription.create(id, receiveDelta);
                case this._VirtualPackage.key: return VirtualPackage.create(id, receiveDelta);
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

    public static readonly INSTANCE = new io_lionweb_mps_specificBase();
}


export class ConceptDescription extends $lwClassCore.NodeBase {
    static create(id: $lwJson.LionWebId, receiveDelta?: $lwClassCore.DeltaReceiver, parentInfo?: $lwClassCore.Parentage): ConceptDescription {
        return new ConceptDescription(io_lionweb_mps_specificBase.INSTANCE.ConceptDescription, id, receiveDelta, parentInfo);
    }

    private readonly _conceptAlias: $lwClassCore.OptionalPropertyValueManager<string>;
    get conceptAlias(): string | undefined {
        return this._conceptAlias.get();
    }
    set conceptAlias(newValue: string | undefined) {
        this._conceptAlias.set(newValue);
    }

    private readonly _conceptShortDescription: $lwClassCore.OptionalPropertyValueManager<string>;
    get conceptShortDescription(): string | undefined {
        return this._conceptShortDescription.get();
    }
    set conceptShortDescription(newValue: string | undefined) {
        this._conceptShortDescription.set(newValue);
    }

    private readonly _helpUrl: $lwClassCore.OptionalPropertyValueManager<string>;
    get helpUrl(): string | undefined {
        return this._helpUrl.get();
    }
    set helpUrl(newValue: string | undefined) {
        this._helpUrl.set(newValue);
    }

    public constructor(classifier: $lwCore.Classifier, id: $lwJson.LionWebId, receiveDelta?: $lwClassCore.DeltaReceiver, parentInfo?: $lwClassCore.Parentage) {
        super(classifier, id, receiveDelta, parentInfo);
        this._conceptAlias = new $lwClassCore.OptionalPropertyValueManager<string>(io_lionweb_mps_specificBase.INSTANCE.ConceptDescription_conceptAlias, this);
        this._conceptShortDescription = new $lwClassCore.OptionalPropertyValueManager<string>(io_lionweb_mps_specificBase.INSTANCE.ConceptDescription_conceptShortDescription, this);
        this._helpUrl = new $lwClassCore.OptionalPropertyValueManager<string>(io_lionweb_mps_specificBase.INSTANCE.ConceptDescription_helpUrl, this);
    }

    getPropertyValueManager(property: $lwCore.Property): $lwClassCore.PropertyValueManager<unknown> {
        switch (property.key) {
            case io_lionweb_mps_specificBase.INSTANCE.ConceptDescription_conceptAlias.key: return this._conceptAlias;
            case io_lionweb_mps_specificBase.INSTANCE.ConceptDescription_conceptShortDescription.key: return this._conceptShortDescription;
            case io_lionweb_mps_specificBase.INSTANCE.ConceptDescription_helpUrl.key: return this._helpUrl;
            default: return super.getPropertyValueManager(property);
        }
    }
}

export class Deprecated extends $lwClassCore.NodeBase {
    static create(id: $lwJson.LionWebId, receiveDelta?: $lwClassCore.DeltaReceiver, parentInfo?: $lwClassCore.Parentage): Deprecated {
        return new Deprecated(io_lionweb_mps_specificBase.INSTANCE.Deprecated, id, receiveDelta, parentInfo);
    }

    private readonly _comment: $lwClassCore.OptionalPropertyValueManager<string>;
    get comment(): string | undefined {
        return this._comment.get();
    }
    set comment(newValue: string | undefined) {
        this._comment.set(newValue);
    }

    private readonly _build: $lwClassCore.OptionalPropertyValueManager<string>;
    get build(): string | undefined {
        return this._build.get();
    }
    set build(newValue: string | undefined) {
        this._build.set(newValue);
    }

    public constructor(classifier: $lwCore.Classifier, id: $lwJson.LionWebId, receiveDelta?: $lwClassCore.DeltaReceiver, parentInfo?: $lwClassCore.Parentage) {
        super(classifier, id, receiveDelta, parentInfo);
        this._comment = new $lwClassCore.OptionalPropertyValueManager<string>(io_lionweb_mps_specificBase.INSTANCE.Deprecated_comment, this);
        this._build = new $lwClassCore.OptionalPropertyValueManager<string>(io_lionweb_mps_specificBase.INSTANCE.Deprecated_build, this);
    }

    getPropertyValueManager(property: $lwCore.Property): $lwClassCore.PropertyValueManager<unknown> {
        switch (property.key) {
            case io_lionweb_mps_specificBase.INSTANCE.Deprecated_comment.key: return this._comment;
            case io_lionweb_mps_specificBase.INSTANCE.Deprecated_build.key: return this._build;
            default: return super.getPropertyValueManager(property);
        }
    }
}

export class KeyedDescription extends $lwClassCore.NodeBase {
    static create(id: $lwJson.LionWebId, receiveDelta?: $lwClassCore.DeltaReceiver, parentInfo?: $lwClassCore.Parentage): KeyedDescription {
        return new KeyedDescription(io_lionweb_mps_specificBase.INSTANCE.KeyedDescription, id, receiveDelta, parentInfo);
    }

    private readonly _documentation: $lwClassCore.OptionalPropertyValueManager<string>;
    get documentation(): string | undefined {
        return this._documentation.get();
    }
    set documentation(newValue: string | undefined) {
        this._documentation.set(newValue);
    }

    private readonly _seeAlso: $lwClassCore.OptionalMultiReferenceValueManager<$lwCore.Node>;
    get seeAlso(): $lwCore.MultiRef<$lwCore.Node> {
        return this._seeAlso.get();
    }
    addSeeAlso(newValue: $lwCore.Node) {
        this._seeAlso.add(newValue);
    }
    removeSeeAlso(valueToRemove: $lwCore.Node) {
        this._seeAlso.remove(valueToRemove);
    }
    addSeeAlsoAtIndex(newValue: $lwCore.Node, index: number) {
        this._seeAlso.insertAtIndex(newValue, index);
    }
    moveSeeAlso(oldIndex: number, newIndex: number) {
        this._seeAlso.move(oldIndex, newIndex);
    }

    public constructor(classifier: $lwCore.Classifier, id: $lwJson.LionWebId, receiveDelta?: $lwClassCore.DeltaReceiver, parentInfo?: $lwClassCore.Parentage) {
        super(classifier, id, receiveDelta, parentInfo);
        this._documentation = new $lwClassCore.OptionalPropertyValueManager<string>(io_lionweb_mps_specificBase.INSTANCE.KeyedDescription_documentation, this);
        this._seeAlso = new $lwClassCore.OptionalMultiReferenceValueManager<$lwCore.Node>(io_lionweb_mps_specificBase.INSTANCE.KeyedDescription_seeAlso, this);
    }

    getPropertyValueManager(property: $lwCore.Property): $lwClassCore.PropertyValueManager<unknown> {
        if (property.key === io_lionweb_mps_specificBase.INSTANCE.KeyedDescription_documentation.key) {
            return this._documentation;
        }
        return super.getPropertyValueManager(property);
    }

    getReferenceValueManager(reference: $lwCore.Reference): $lwClassCore.ReferenceValueManager<$lwCore.Node> {
        if (reference.key === io_lionweb_mps_specificBase.INSTANCE.KeyedDescription_seeAlso.key) {
            return this._seeAlso;
        }
        return super.getReferenceValueManager(reference);
    }
}

export class ShortDescription extends $lwClassCore.NodeBase {
    static create(id: $lwJson.LionWebId, receiveDelta?: $lwClassCore.DeltaReceiver, parentInfo?: $lwClassCore.Parentage): ShortDescription {
        return new ShortDescription(io_lionweb_mps_specificBase.INSTANCE.ShortDescription, id, receiveDelta, parentInfo);
    }

    private readonly _description: $lwClassCore.OptionalPropertyValueManager<string>;
    get description(): string | undefined {
        return this._description.get();
    }
    set description(newValue: string | undefined) {
        this._description.set(newValue);
    }

    public constructor(classifier: $lwCore.Classifier, id: $lwJson.LionWebId, receiveDelta?: $lwClassCore.DeltaReceiver, parentInfo?: $lwClassCore.Parentage) {
        super(classifier, id, receiveDelta, parentInfo);
        this._description = new $lwClassCore.OptionalPropertyValueManager<string>(io_lionweb_mps_specificBase.INSTANCE.ShortDescription_description, this);
    }

    getPropertyValueManager(property: $lwCore.Property): $lwClassCore.PropertyValueManager<unknown> {
        if (property.key === io_lionweb_mps_specificBase.INSTANCE.ShortDescription_description.key) {
            return this._description;
        }
        return super.getPropertyValueManager(property);
    }
}

export class VirtualPackage extends $lwClassCore.NodeBase implements $lwClassCore.INamed {
    static create(id: $lwJson.LionWebId, receiveDelta?: $lwClassCore.DeltaReceiver, parentInfo?: $lwClassCore.Parentage): VirtualPackage {
        return new VirtualPackage(io_lionweb_mps_specificBase.INSTANCE.VirtualPackage, id, receiveDelta, parentInfo);
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
        this._name = new $lwClassCore.RequiredPropertyValueManager<string>($lwClassCore.LionCore_builtinsBase.INSTANCE.INamed_name, this);
    }

    getPropertyValueManager(property: $lwCore.Property): $lwClassCore.PropertyValueManager<unknown> {
        if (property.key === $lwClassCore.LionCore_builtinsBase.INSTANCE.INamed_name.key) {
            return this._name;
        }
        return super.getPropertyValueManager(property);
    }
}

