import { Change } from "./changes/Change.js"

export class DiffResult {
    changes: Change[] = []

    change(issue: Change) {
        this.changes.push(issue)
    }

    reset() {
        this.changes = []
    }

    hasChanges(): boolean {
        return this.changes.length !== 0
    }
}
