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

import { TextualLogger } from "@lionweb/delta-protocol-common"
import { LowLevelClientLogger } from "@lionweb/delta-protocol-client"

/**
 * @return a {@link LowLevelClientLogger low-level client logger implementation} that just logs the {@link TextualLogItem}s using the given {@link TextualLogger}.
 */
export const asLowLevelClientLogger = <TMessageForClient, TMessageForServer>(textualLogger: TextualLogger): LowLevelClientLogger<TMessageForClient, TMessageForServer> =>
    (logItem) => {
        if ("message" in logItem) {
            textualLogger(logItem.message, logItem.error)
        }
    }

