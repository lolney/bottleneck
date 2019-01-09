import React from 'react';
import { mount } from 'enzyme';
import RegexComponent from '../../src/react-app/problems/RegexComponent';
import RegexProblem from '../../src/problem-engine/RegexProblem';

describe('RegexComponent', () => {
    async function createComponent(regex, generator) {
        const problem = new RegexProblem(regex);
        const serialized = await problem.serialize();
        let isDone = false;
        let error = null;

        const Component = mount(
            <RegexComponent
                problem={serialized}
                generator={generator ? generator : regex}
                setDone={(done) => (isDone = done)}
                reportError={(err) => (error = err)}
            />
        );
        return { isDone, error, Component };
    }

    it('sets done when provided the correct regex', async () => {
        for (const regex of [/dfsf/g, /sdf/g]) {
            const { isDone } = await createComponent(regex);

            expect(isDone).toEqual(true);
        }
    });

    it('if generator is not a regex, throw an error', async () => {
        const { isDone, error } = await createComponent(/dfsf/g, 'not');

        expect(error).not.toEqual(null);
        expect(isDone).toBe(false);
    });

    it('if generator is not a global regex, throw an error', async () => {
        const { isDone, error } = await createComponent(/dfsf/g, /dfsf/);

        expect(error).not.toEqual(null);
        expect(isDone).toBe(false);
    });

    it('if generator is an empty regex, terminate', async () => {
        const { isDone, error } = await createComponent(/dfsf/g, RegExp(''));

        expect(error).not.toEqual(null);
        expect(isDone).toBe(false);
    });

    /* Can't test in node - an imported module throws because canvas isn't implemented
    it('submits with the correct fields', async () => {
        const regex = /hello/;
        const problem = new RegexProblem(regex);
        const serialized = await problem.serialize();
        let submittedArgs;

        const props = {
            generator: regex,
            reportError: () => {},
            onSolution: (...args) => {
                submittedArgs = args;
            },
            problem: serialized,
            alert: { successs: () => {} }
        };
        mount(<ProblemComponent {...props} />);

        console.log(submittedArgs);

        expect(submittedArgs).toBeDefined();
    });*/
});
