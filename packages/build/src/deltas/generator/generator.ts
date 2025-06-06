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

import { writeFileSync } from "fs"
import { join } from "path"

import { deltas } from "../definition/definition-base.js"
import { deserializerForDeltas } from "./deserializer-generator.js"
import { serializationTypesForDeltas } from "./serialization-types-generator.js"
import { serializerForDeltas } from "./serializer-generator.js"
import { typesForDeltas } from "./types-generator.js"

export const generateDeltaCode = (genPath: string, header?: string) => {
    writeFileSync(join(genPath, "types.g.ts"), typesForDeltas(deltas.deltas, header))
    writeFileSync(join(genPath, "serialization", "deserializer.g.ts"), deserializerForDeltas(deltas.deltas, header))
    writeFileSync(join(genPath, "serialization", "serializer.g.ts"), serializerForDeltas(deltas.deltas, header))
    writeFileSync(join(genPath, "serialization", "types.g.ts"), serializationTypesForDeltas(deltas.deltas, header))
}

