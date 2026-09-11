/**
 * Type used to read the __TestExpectation.json files in the directories under testset,
 * which is cloned from the `lionweb-integration-testing` repository.
 */
export type TestExpectation = {
    /** A file to validate. */
    file: string;
    /** The expected error *type*. */
    error: string;
}

export type ExpectationList = TestExpectation[]; 

