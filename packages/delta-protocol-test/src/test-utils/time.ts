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

type StringNumberPair = [str: string, num: number]
const unitAndNextDividers: StringNumberPair[] = [
    ["ms", 1000],
    ["s", 60],
    ["m", 60],
    ["h", 24],
    ["y", 365]
]

/**
 * @return the given number of `ms` in the format `<y>y<d>d<h>h<m>m<s>s<ms>ms`,
 * but without leading 0's.
 */
export const prettyPrintedMs = (ms: number) =>
    unitAndNextDividers.reduce(([str, currentNum], [currentUnit, nextDivider]) => {
        if (currentNum === 0) {
            return [str, currentNum]
        }
        const ofCurrentUnit = currentNum%nextDivider
        const nextNumber = (currentNum - ofCurrentUnit)/nextDivider
        return [`${ofCurrentUnit}${currentUnit}${str}`, nextNumber]
    }, ["", ms] as StringNumberPair)[0]

