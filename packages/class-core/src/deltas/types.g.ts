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

// Warning: this file is generated!
// Modifying it by hand is useless at best, and sabotage at worst.

import {
    Containment,
    Property,
    Reference,
    SingleRef
} from "@lionweb/core";

import { INodeBase } from "../base-types.js";
import { IDelta } from "./base.js";


/**
 * Delta that does nothing.
 * Warning: should only be used for development purposes!
 */
export class NoOpDelta implements IDelta {
}

export class PropertyAddedDelta<T> implements IDelta {
    constructor(
        public readonly container: INodeBase,
        public readonly property: Property,
        public readonly value: T
    ) {
    }
}

export class PropertyDeletedDelta<T> implements IDelta {
    constructor(
        public readonly container: INodeBase,
        public readonly property: Property,
        public readonly oldValue: T
    ) {
    }
}

export class PropertyChangedDelta<T> implements IDelta {
    constructor(
        public readonly container: INodeBase,
        public readonly property: Property,
        public readonly oldValue: T,
        public readonly newValue: T
    ) {
    }
}

export class ChildAddedDelta implements IDelta {
    constructor(
        public readonly parent: INodeBase,
        public readonly containment: Containment,
        public readonly index: number,
        public readonly newChild: INodeBase
    ) {
    }
}

export class ChildDeletedDelta implements IDelta {
    constructor(
        public readonly parent: INodeBase,
        public readonly containment: Containment,
        public readonly index: number,
        public readonly deletedChild: INodeBase
    ) {
    }
}

export class ChildReplacedDelta implements IDelta {
    constructor(
        public readonly parent: INodeBase,
        public readonly containment: Containment,
        public readonly index: number,
        public readonly replacedChild: INodeBase,
        public readonly newChild: INodeBase
    ) {
    }
}

export class ChildMovedDelta implements IDelta {
    constructor(
        public readonly oldParent: INodeBase,
        public readonly oldContainment: Containment,
        public readonly oldIndex: number,
        public readonly newParent: INodeBase,
        public readonly newContainment: Containment,
        public readonly newIndex: number,
        public readonly child: INodeBase
    ) {
    }
}

export class ChildMovedInSameContainmentDelta implements IDelta {
    constructor(
        public readonly parent: INodeBase,
        public readonly containment: Containment,
        public readonly oldIndex: number,
        public readonly newIndex: number,
        public readonly child: INodeBase
    ) {
    }
}

export class ReferenceAddedDelta implements IDelta {
    constructor(
        public readonly container: INodeBase,
        public readonly reference: Reference,
        public readonly index: number,
        public readonly newTarget: SingleRef<INodeBase>
    ) {
    }
}

export class ReferenceDeletedDelta implements IDelta {
    constructor(
        public readonly container: INodeBase,
        public readonly reference: Reference,
        public readonly index: number,
        public readonly deletedTarget: SingleRef<INodeBase>
    ) {
    }
}

/**
 * Note: corresponds to "reference changed" in delta proposal!
 */
export class ReferenceReplacedDelta implements IDelta {
    constructor(
        public readonly container: INodeBase,
        public readonly reference: Reference,
        public readonly index: number,
        public readonly replacedTarget: SingleRef<INodeBase>,
        public readonly newTarget: SingleRef<INodeBase>
    ) {
    }
}

/**
 * Note: corresponds to "entry moved from other reference" in delta proposal!
 */
export class ReferenceMovedDelta implements IDelta {
    constructor(
        public readonly oldContainer: INodeBase,
        public readonly oldReference: Reference,
        public readonly oldIndex: number,
        public readonly newContainer: INodeBase,
        public readonly newReference: Reference,
        public readonly newIndex: number,
        public readonly target: SingleRef<INodeBase>
    ) {
    }
}

export class ReferenceMovedInSameReferenceDelta implements IDelta {
    constructor(
        public readonly container: INodeBase,
        public readonly reference: Reference,
        public readonly oldIndex: number,
        public readonly newIndex: number,
        public readonly target: SingleRef<INodeBase>
    ) {
    }
}

export class AnnotationAddedDelta implements IDelta {
    constructor(
        public readonly parent: INodeBase,
        public readonly index: number,
        public readonly newAnnotation: INodeBase
    ) {
    }
}

export class AnnotationDeletedDelta implements IDelta {
    constructor(
        public readonly parent: INodeBase,
        public readonly index: number,
        public readonly deletedAnnotation: INodeBase
    ) {
    }
}

export class AnnotationReplacedDelta implements IDelta {
    constructor(
        public readonly parent: INodeBase,
        public readonly index: number,
        public readonly replacedAnnotation: INodeBase,
        public readonly newAnnotation: INodeBase
    ) {
    }
}

export class AnnotationMovedFromOtherParentDelta implements IDelta {
    constructor(
        public readonly oldParent: INodeBase,
        public readonly oldIndex: number,
        public readonly newParent: INodeBase,
        public readonly newIndex: number,
        public readonly movedAnnotation: INodeBase
    ) {
    }
}

export class AnnotationMovedInSameParentDelta implements IDelta {
    constructor(
        public readonly parent: INodeBase,
        public readonly oldIndex: number,
        public readonly newIndex: number,
        public readonly movedAnnotation: INodeBase
    ) {
    }
}

