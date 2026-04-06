import {ILanguageBase, LionCore_builtinsBase} from "@lionweb/class-core";

import * as LionCore_builtins from "./LionCore_builtins.g.js";
import * as LionCore_M3 from "./LionCore_M3.g.js";
import * as io_lionweb_mps_specific from "./io.lionweb.mps.specific.g.js";

// ensure that all languages get wired up by triggering that through their first entity:
LionCore_builtinsBase.INSTANCE.String;
LionCore_builtins.LionCore_builtinsBase.INSTANCE.String;
LionCore_M3.LionCore_M3Base.INSTANCE.IKeyed;
io_lionweb_mps_specific.io_lionweb_mps_specificBase.INSTANCE.ConceptDescription;

export const allLanguageBases: ILanguageBase[] = [
    LionCore_builtins.LionCore_builtinsBase.INSTANCE,
    LionCore_M3.LionCore_M3Base.INSTANCE,
    io_lionweb_mps_specific.io_lionweb_mps_specificBase.INSTANCE
];

export {
    LionCore_builtins,
    LionCore_M3,
    io_lionweb_mps_specific
};

