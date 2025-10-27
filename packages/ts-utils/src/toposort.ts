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

/**
 * Computes the topological order of the transitive closure of the graph with the given vertices and edges given by the edge function,
 * or returns {@code false} if there's a cycle.
 */
export const dependencyOrderOf = <T>(vertices: T[], edgesOf: (vertex: T) => T[]): T[] | false => {
    const ordered: T[] = []

    const visit = (current: T, chain: T[]) => {
        if (ordered.indexOf(current) > -1) {
            return false
        }
        if (chain.indexOf(current) > -1) {
            return true
        }
        const extendedChain = [ ...chain, current ]
        const hasCycle = edgesOf(current).some(
            (edge) => visit(edge, extendedChain)
        )
        ordered.push(current)
        return hasCycle
    }

    const hasCycle = vertices.some(
        (vertex) => visit(vertex, [])
    )

    return hasCycle ? false : ordered
}

