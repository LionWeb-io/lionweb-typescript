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
    Node,
    Property,
    Reference,
    SingleRef
} from "@lionweb/core";

import { INodeBase } from "../base-types.js";
import { IDelta } from "./base.js";


export class PartitionAddedDelta implements IDelta {
    constructor(
        public readonly newPartition: INodeBase
    ) {
    }
}

export class PartitionDeletedDelta implements IDelta {
    constructor(
        public readonly deletedPartition: INodeBase
    ) {
    }
}

export class PropertyAddedDelta<T> implements IDelta {
    constructor(
        public readonly node: INodeBase,
        public readonly property: Property,
        public readonly value: T
    ) {
    }
}

export class PropertyDeletedDelta<T> implements IDelta {
    constructor(
        public readonly node: INodeBase,
        public readonly property: Property,
        public readonly oldValue: T
    ) {
    }
}

export class PropertyChangedDelta<T> implements IDelta {
    constructor(
        public readonly node: INodeBase,
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

export class ChildMovedFromOtherContainmentDelta implements IDelta {
    constructor(
        public readonly oldParent: INodeBase,
        public readonly oldContainment: Containment,
        public readonly oldIndex: number,
        public readonly newParent: INodeBase,
        public readonly newContainment: Containment,
        public readonly newIndex: number,
        public readonly movedChild: INodeBase
    ) {
    }
}

export class ChildMovedFromOtherContainmentInSameParentDelta implements IDelta {
    constructor(
        public readonly parent: INodeBase,
        public readonly oldContainment: Containment,
        public readonly oldIndex: number,
        public readonly movedChild: INodeBase,
        public readonly newContainment: Containment,
        public readonly newIndex: number
    ) {
    }
}

export class ChildMovedInSameContainmentDelta implements IDelta {
    constructor(
        public readonly parent: INodeBase,
        public readonly containment: Containment,
        public readonly oldIndex: number,
        public readonly newIndex: number,
        public readonly movedChild: INodeBase
    ) {
    }
}

export class ChildMovedAndReplacedFromOtherContainmentDelta implements IDelta {
    constructor(
        public readonly newParent: INodeBase,
        public readonly newContainment: Containment,
        public readonly newIndex: number,
        public readonly movedChild: INodeBase,
        public readonly oldParent: INodeBase,
        public readonly oldContainment: Containment,
        public readonly oldIndex: number,
        public readonly replacedChild: INodeBase
    ) {
    }
}

export class ChildMovedAndReplacedFromOtherContainmentInSameParentDelta implements IDelta {
    constructor(
        public readonly parent: INodeBase,
        public readonly oldContainment: Containment,
        public readonly oldIndex: number,
        public readonly newContainment: Containment,
        public readonly newIndex: number,
        public readonly movedChild: INodeBase,
        public readonly replacedChild: INodeBase
    ) {
    }
}

export class ChildMovedAndReplacedInSameContainmentDelta implements IDelta {
    constructor(
        public readonly parent: INodeBase,
        public readonly containment: Containment,
        public readonly oldIndex: number,
        public readonly newIndex: number,
        public readonly movedChild: INodeBase,
        public readonly replacedChild: INodeBase
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

export class AnnotationMovedAndReplacedFromOtherParentDelta implements IDelta {
    constructor(
        public readonly oldParent: INodeBase,
        public readonly oldIndex: number,
        public readonly replacedAnnotation: INodeBase,
        public readonly newParent: INodeBase,
        public readonly newIndex: number,
        public readonly movedAnnotation: INodeBase
    ) {
    }
}

export class AnnotationMovedAndReplacedInSameParentDelta implements IDelta {
    constructor(
        public readonly parent: INodeBase,
        public readonly oldIndex: number,
        public readonly newIndex: number,
        public readonly replacedAnnotation: INodeBase,
        public readonly movedAnnotation: INodeBase
    ) {
    }
}

export class ReferenceAddedDelta implements IDelta {
    constructor(
        public readonly parent: INodeBase,
        public readonly reference: Reference,
        public readonly index: number,
        public readonly newReference: SingleRef<Node>
    ) {
    }
}

export class ReferenceDeletedDelta implements IDelta {
    constructor(
        public readonly parent: INodeBase,
        public readonly reference: Reference,
        public readonly index: number,
        public readonly deletedReference: SingleRef<Node>
    ) {
    }
}

export class ReferenceChangedDelta implements IDelta {
    constructor(
        public readonly parent: INodeBase,
        public readonly reference: Reference,
        public readonly index: number,
        public readonly newReference: SingleRef<Node>,
        public readonly oldReference: SingleRef<Node>
    ) {
    }
}

/**
 * Delta that does nothing.
 */
export class NoOpDelta implements IDelta {
}

