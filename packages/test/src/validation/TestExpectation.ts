/**
 * Type used to read the __ExpectedErrors.jsonm files in the integration testset directories.
 */
export type TestExpectation = {
    file: string;
    error: string;
}

export type ExpectationList = TestExpectation[]; 


