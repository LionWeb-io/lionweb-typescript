/*
 * language's metadata:
 *     name:    Meta-test
 *     version: 1
 *     key:     Meta-test
 *     id:      Meta-test
 */


import * as $lwClassCore from "@lionweb/class-core";
import * as $lwCore from "@lionweb/core";
import * as $lwJson from "@lionweb/json";

export class Meta_testBase implements $lwClassCore.ILanguageBase {

    private readonly _language: $lwCore.Language = new $lwCore.Language("Meta_test", "1", "Meta-test", "Meta-test");
    get language(): $lwCore.Language {
        this.ensureWiredUp();
        return this._language;
    }

    public readonly _Class = new $lwCore.Concept(this._language, "Class", "Meta-test-Class", "Meta-test-Class", $lwCore.ConceptModifier.concrete);
    get Class(): $lwCore.Concept {
        this.ensureWiredUp();
        return this._Class;
    }
    private readonly _Class_property = new $lwCore.Containment(this._Class, "property", "Meta-test-Class-property", "Meta-test-Class-property");
    get Class_property(): $lwCore.Containment {
        this.ensureWiredUp();
        return this._Class_property;
    }

    public readonly _Property = new $lwCore.Concept(this._language, "Property", "Meta-test-Property", "Meta-test-Property", $lwCore.ConceptModifier.concrete);
    get Property(): $lwCore.Concept {
        this.ensureWiredUp();
        return this._Property;
    }

    private _wiredUp: boolean = false;
    private ensureWiredUp() {
        if (this._wiredUp) {
            return;
        }
        this._language.havingEntities(this._Class, this._Property);
        this._Class.implementing($lwClassCore.LionCore_builtinsBase.INSTANCE._INamed);
        this._Class.havingFeatures(this._Class_property);
        this._Class_property.ofType(this._Property);
        this._Property.implementing($lwClassCore.LionCore_builtinsBase.INSTANCE._INamed);
        this._wiredUp = true;
    }

    factory(receiveDelta?: $lwClassCore.DeltaReceiver): $lwClassCore.NodeBaseFactory {
        return (classifier: $lwCore.Classifier, id: $lwJson.LionWebId) => {
            switch (classifier.key) {
                case this._Class.key: return Class.create(id, receiveDelta);
                case this._Property.key: return Property.create(id, receiveDelta);
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

    public static readonly INSTANCE = new Meta_testBase();
}


export class Class extends $lwClassCore.NodeBase implements $lwClassCore.INamed {
    static create(id: $lwJson.LionWebId, receiveDelta?: $lwClassCore.DeltaReceiver, parentInfo?: $lwClassCore.Parentage): Class {
        return new Class(Meta_testBase.INSTANCE.Class, id, receiveDelta, parentInfo);
    }

    private readonly _property: $lwClassCore.RequiredSingleContainmentValueManager<Property>;
    get property(): Property {
        return this._property.get();
    }
    set property(newValue: Property) {
        this._property.set(newValue);
    }
    replacePropertyWith(newValue: Property) {
        this._property.replaceWith(newValue);
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
        this._property = new $lwClassCore.RequiredSingleContainmentValueManager<Property>(Meta_testBase.INSTANCE.Class_property, this);
        this._name = new $lwClassCore.RequiredPropertyValueManager<string>($lwClassCore.LionCore_builtinsBase.INSTANCE.INamed_name, this);
    }

    getPropertyValueManager(property: $lwCore.Property): $lwClassCore.PropertyValueManager<unknown> {
        if (property.key === $lwClassCore.LionCore_builtinsBase.INSTANCE.INamed_name.key) {
            return this._name;
        }
        return super.getPropertyValueManager(property);
    }

    getContainmentValueManager(containment: $lwCore.Containment): $lwClassCore.ContainmentValueManager<$lwClassCore.INodeBase> {
        if (containment.key === Meta_testBase.INSTANCE.Class_property.key) {
            return this._property;
        }
        return super.getContainmentValueManager(containment);
    }
}

export class Property extends $lwClassCore.NodeBase implements $lwClassCore.INamed {
    static create(id: $lwJson.LionWebId, receiveDelta?: $lwClassCore.DeltaReceiver, parentInfo?: $lwClassCore.Parentage): Property {
        return new Property(Meta_testBase.INSTANCE.Property, id, receiveDelta, parentInfo);
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

