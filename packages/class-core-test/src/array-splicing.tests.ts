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

import {deepEqual, isTrue} from "./assertions.js";

describe("array splicing (with code duplication, not using the value managers)", () => {

    const move = <T, L extends Array<T>>(list_: L, oldIndex: number, newIndex: number) => {
        // this code essentially duplicates the important bits of code in the move methods in the Multi{Containment|Reference}ValueManager classes:
        const list = list_.slice();
        const [entry] = list.splice(oldIndex, 1);
        list.splice(newIndex, 0, entry);
        return list
    };

    it("oldIndex < newIndex", () => {
        isTrue(3 < 5);
        deepEqual(
            move(["A", "B", "C", "X", "D", "E", "F"], 3, 5),
            ["A", "B", "C", "D", "E", "X", "F"]
            //0,   1,   2,   4,   5,   3,   6
        );
    });

    it("oldIndex > newIndex", () => {
        isTrue(3 > 1);
        deepEqual(
            move(["A", "B", "C", "X", "D", "E", "F"], 3, 1),
            ["A", "X", "B", "C", "D", "E", "F"]
            //0,   3,   1,   2,   4,   5,   6
        );
    });

});

