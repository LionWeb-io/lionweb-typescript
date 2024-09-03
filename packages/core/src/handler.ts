/**
 * A simplistic handler to which problems that arise during deserialization,
 * are reported as plain text by calling the `reportProblem` function.
 */
export interface SimplisticHandler {
    reportProblem: (message: string) => void
}

/**
 * A default simplistic handler that just outputs everything of the console.
 */
export const defaultSimplisticHandler: SimplisticHandler = {
    reportProblem: (message) => {
        console.log(message)
    }
}


/**
 * A simplistic handler that just accumulates problems (in terms of their messages).
 */
export class AccumulatingSimplisticHandler implements SimplisticHandler {
    private _allProblems: string[] = []
    reportProblem(message: string) {
        this._allProblems.push(message)
    }
    get allProblems() {
        return this._allProblems
    }
}


/**
 * A simplistic handler that aggregates problems by their message.
 * This is convenient for problems that arise many times during deserialization
 * but produce the exact same message every time.
 */
export class AggregatingSimplisticHandler implements SimplisticHandler {
    private messageByCount: { [message: string]: number } = {}
    reportProblem(message: string) {
        this.messageByCount[message] = (this.messageByCount[message] ?? 0) + 1
    }
    reportAllProblemsOnConsole(asTable = false) {
        if (asTable) {
            console.table(this.messageByCount)
        } else {
            Object.entries(this.messageByCount)
                .forEach(([message, count]) => {
                    console.log(`${message} (${count})`)
                })
        }
    }
    allProblems() {
        return { ...this.messageByCount }
    }
}

