import { lioncoreBuiltinsFacade } from "./builtins.js"
import { lioncoreFacade } from "./lioncore.js"
import { LionWebVersion } from "../../version.js"

/**
 * A representation of the 2026.1 LionWeb version.
 */
export const v2026_1 = new LionWebVersion("2026.1", lioncoreFacade, lioncoreBuiltinsFacade)

