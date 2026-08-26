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

/**
 * Type def. for functions that serialize values represented at runtime by the generic type parameter `VT`.
 */
export type ValueSerializer<RT> = (value: RT) => string

/**
 * Type def. for functions that deserialize values to their runtime encoding represented by the generic type parameter `VT`.
 */
export type ValueDeserializer<RT> = (serialization: string) => RT

