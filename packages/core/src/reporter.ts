/**
 * Problems that arise during deserialization, are reported as plain text by calling the `reportProblem` function.
 * This type is an interface rather than, say, a function definition
 */
export interface ProblemReporter {
    reportProblem: (message: string) => void
}

/**
 * Legacy alias for {@link ProblemReporter}, kept for backward compatibility, and to be deprecated and removed later.
 */
export type SimplisticHandler = ProblemReporter


/**
 * A default {@link ProblemReporter} that just outputs everything of the console.
 */
export const consoleProblemReporter: ProblemReporter = {
    reportProblem: (message) => {
        console.log(message)
    }
}

/**
 * Legacy alias for {@link consoleProblemReporter}, kept for backward compatibility, and to be deprecated and removed later.
 */
export const defaultSimplisticHandler = consoleProblemReporter


/**
 * A {@link ProblemReporter} that just accumulates problems (in terms of their messages).
 */
export class AccumulatingProblemReporter implements ProblemReporter {
    private _allProblems: string[] = []
    reportProblem(message: string) {
        this._allProblems.push(message)
    }
    get allProblems() {
        return this._allProblems
    }
}

/**
 * Legacy alias for {@link AccumulatingProblemReporter}, kept for backward compatibility, and to be deprecated and removed later.
 */
export const AccumulatingSimplisticHandler = AccumulatingProblemReporter


/**
 * A {@link ProblemReporter} that aggregates problems by their message.
 * This is convenient for problems that arise many times during deserialization
 * but produce the exact same message every time.
 */
export class AggregatingProblemReporter implements ProblemReporter {
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

/**
 * Legacy alias for {@link AggregatingProblemReporter}, kept for backward compatibility, and to be deprecated and removed later.
 */
export type AggregatingSimplisticHandler = AggregatingProblemReporter

