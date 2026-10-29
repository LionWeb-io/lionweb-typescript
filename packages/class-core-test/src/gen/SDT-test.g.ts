/*
 * language's metadata:
 *     name:    SDT-test
 *     version: 1
 *     key:     SDT-test
 *     id:      SDT-test
 */


import * as $lwClassCore from "@lionweb/class-core";
import * as $lwCore from "@lionweb/core";
import * as $lwJson from "@lionweb/json";

export class SDT_testBase implements $lwClassCore.ILanguageBase {

    private readonly _language: $lwCore.Language = new $lwCore.Language("SDT_test", "1", "SDT-test", "SDT-test");
    get language(): $lwCore.Language {
        this.ensureWiredUp();
        return this._language;
    }

    public readonly _ThatSDT = new $lwCore.StructuredDataType(this._language, "ThatSDT", "SDT-test-ThatSDT", "SDT-test-ThatSDT");
    get ThatSDT(): $lwCore.StructuredDataType {
        this.ensureWiredUp();
        return this._ThatSDT;
    }

    public readonly _StructuredDataType = new $lwCore.StructuredDataType(this._language, "StructuredDataType", "SDT-test-StructuredDataType", "SDT-test-StructuredDataType");
    get StructuredDataType(): $lwCore.StructuredDataType {
        this.ensureWiredUp();
        return this._StructuredDataType;
    }
    public readonly _StructuredDataType_stringField = new $lwCore.Field(this._StructuredDataType, "stringField", "SDT-test-StructuredDataType-stringField", "SDT-test-StructuredDataType-stringField");
    get StructuredDataType_stringField(): $lwCore.Field {
        this.ensureWiredUp();
        return this._StructuredDataType_stringField;
    }
    public readonly _StructuredDataType_sdt1Field = new $lwCore.Field(this._StructuredDataType, "sdt1Field", "SDT-test-StructuredDataType-sdt1Field", "SDT-test-StructuredDataType-sdt1Field");
    get StructuredDataType_sdt1Field(): $lwCore.Field {
        this.ensureWiredUp();
        return this._StructuredDataType_sdt1Field;
    }

    public readonly _Container = new $lwCore.Concept(this._language, "Container", "SDT-test-Container", "SDT-test-Container", $lwCore.ConceptModifier.concrete);
    get Container(): $lwCore.Concept {
        this.ensureWiredUp();
        return this._Container;
    }
    private readonly _Container_sdt = new $lwCore.Property(this._Container, "sdt", "SDT-test-Container-sdt", "SDT-test-Container-sdt");
    get Container_sdt(): $lwCore.Property {
        this.ensureWiredUp();
        return this._Container_sdt;
    }

    private _wiredUp: boolean = false;
    private ensureWiredUp() {
        if (this._wiredUp) {
            return;
        }
        this._language.havingEntities(this._ThatSDT, this._StructuredDataType, this._Container);
        this._StructuredDataType_stringField.ofType($lwClassCore.LionCore_builtinsBase.INSTANCE._String);
        this._StructuredDataType_sdt1Field.ofType(this._ThatSDT);
        this._Container.havingFeatures(this._Container_sdt);
        this._Container_sdt.ofType(this._StructuredDataType);
        this._wiredUp = true;
    }

    factory(receiveDelta?: $lwClassCore.DeltaReceiver): $lwClassCore.NodeBaseFactory {
        return (classifier: $lwCore.Classifier, id: $lwJson.LionWebId) => {
            if (classifier.key === this._Container.key) {
                return Container.create(id, receiveDelta);
            }
            const {language} = classifier;
            throw new Error(`can't instantiate ${classifier.name} (key=${classifier.key}): classifier is not known in language ${language.name} (key=${language.key}, version=${language.version})`);
        }
    }

    enumLiteralFrom<EnumType>(enumerationLiteral: $lwCore.EnumerationLiteral): EnumType {
        const {enumeration} = enumerationLiteral;
        const {language} = enumeration;
        throw new Error(`enumeration with key ${enumeration.key} is not known in language ${language.name} (key=${language.key}, version=${language.version})`);
    }

    public static readonly INSTANCE = new SDT_testBase();
}


export type ThatSDT = {
}

export type StructuredDataType = {
    stringField: string;
    sdt1Field: ThatSDT;
}

export class Container extends $lwClassCore.NodeBase {
    static create(id: $lwJson.LionWebId, receiveDelta?: $lwClassCore.DeltaReceiver, parentInfo?: $lwClassCore.Parentage): Container {
        return new Container(SDT_testBase.INSTANCE.Container, id, receiveDelta, parentInfo);
    }

    private readonly _sdt: $lwClassCore.RequiredPropertyValueManager<StructuredDataType>;
    get sdt(): StructuredDataType {
        return this._sdt.get();
    }
    set sdt(newValue: StructuredDataType) {
        this._sdt.set(newValue);
    }

    public constructor(classifier: $lwCore.Classifier, id: $lwJson.LionWebId, receiveDelta?: $lwClassCore.DeltaReceiver, parentInfo?: $lwClassCore.Parentage) {
        super(classifier, id, receiveDelta, parentInfo);
        this._sdt = new $lwClassCore.RequiredPropertyValueManager<StructuredDataType>(SDT_testBase.INSTANCE.Container_sdt, this);
    }

    override getPropertyValueManager(property: $lwCore.Property): $lwClassCore.PropertyValueManager<unknown> {
        if (property.key === SDT_testBase.INSTANCE.Container_sdt.key) {
            return this._sdt;
        }
        return super.getPropertyValueManager(property);
    }
}

