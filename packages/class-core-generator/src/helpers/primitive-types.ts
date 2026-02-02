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

import { defaultLionWebVersion, PrimitiveType } from "@lionweb/core"


const { primitiveTypes } = defaultLionWebVersion.builtinsFacade

export const tsTypeForPrimitiveType = (primitiveType: PrimitiveType): string => {
    switch (primitiveType.key) {
        case primitiveTypes.booleanDataType.key:
            return `boolean`
        case primitiveTypes.stringDataType.key:
            return `string`
        case primitiveTypes.integerDataType.key:
            return `number`
        case primitiveTypes.jsonDataType.key:
            return `unknown`
        default:
            return `string`
    }
}

