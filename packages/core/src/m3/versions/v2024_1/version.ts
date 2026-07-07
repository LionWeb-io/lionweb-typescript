import { lioncoreBuiltinsFacade } from "./builtins.js"
import { lioncoreFacade } from "./lioncore.js"
import { LionWebVersion } from "../../version.js"

/**
 * A representation of the 2024.1 LionWeb version.
 */
export const v2024_1 = new LionWebVersion("2024.1", lioncoreFacade, lioncoreBuiltinsFacade)

