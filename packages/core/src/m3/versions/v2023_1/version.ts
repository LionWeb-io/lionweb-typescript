import { lioncoreBuiltinsFacade } from "./builtins.js"
import { lioncoreFacade } from "./lioncore.js"
import { LionWebVersion } from "../../version.js"

/**
 * A representation of the 2023.1 LionWeb version.
 */
export const v2023_1 = new LionWebVersion("2023.1", lioncoreFacade, lioncoreBuiltinsFacade)

