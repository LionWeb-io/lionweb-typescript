// Copyright 2026 TRUMPF Laser SE and other contributors
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
// SPDX-FileCopyrightText: 2026 TRUMPF Laser SE and other contributors
// SPDX-License-Identifier: Apache-2.0

import { LionWebVersion, LionWebVersions } from "./m3/index.js"
import { PrimitiveValueDeserializerRegistry, PrimitiveValueSerializerRegistry } from "./data-types/index.js"
import { consoleProblemReporter, ProblemReporter } from "./reporter.js"


/**
 * Type def. to capture all variability of (de-)serialization.
 */
export type CompleteSerializationConfiguration = {

    /**
     * The version of the LionWeb serialization format to serialize to, and deserialize from.
     * Default: {@link LionWebVersions.v2023_1}.
     */
    lionWebVersion: LionWebVersion

    /**
     * The {@link PrimitiveValueDeserializerRegistry} that governs how values of (which) {@link PrimitiveType}s are deserialized.
     * Default: `(lionWebVersion ?? LionWebVersions.v2023_1).builtinsFacade.primitiveValueDeserializerRegistry`.
     */
    primitiveValueDeserializerRegistry: PrimitiveValueDeserializerRegistry

    /**
     * The {@link PrimitiveValueSerializerRegistry} that governs how values of (which) {@link PrimitiveType}s are serialized.
     * Default: `(lionWebVersion ?? LionWebVersions.v2023_1).builtinsFacade.primitiveValueSerializerRegistry`.
     */
    primitiveValueSerializerRegistry: PrimitiveValueSerializerRegistry

    /**
     * A {@link ProblemReporter} to report problems with.
     * Default: {@link consoleProblemReporter}.
     */
    problemReporter: ProblemReporter

}


/**
 * @return a copy of the given partial {@link CompleteSerializationConfiguration}, completed with defaults.
 */
export const completeSerializationConfigurationWithDefaults = (partialConfiguration: Partial<CompleteSerializationConfiguration>): CompleteSerializationConfiguration => {
    const lionWebVersion = partialConfiguration.lionWebVersion ?? LionWebVersions.v2023_1
    const primitiveValueDeserializerRegistry = partialConfiguration.primitiveValueDeserializerRegistry ?? lionWebVersion.builtinsFacade.primitiveValueDeserializerRegistry
    const primitiveValueSerializerRegistry = partialConfiguration.primitiveValueSerializerRegistry ?? lionWebVersion.builtinsFacade.primitiveValueSerializerRegistry
    const problemReporter = partialConfiguration.problemReporter ?? consoleProblemReporter
    return {
        lionWebVersion,
        primitiveValueDeserializerRegistry,
        primitiveValueSerializerRegistry,
        problemReporter
    }
}

