import React from 'react';

import StorybookConsole from 'react-storybook-console';
import { storiesOf } from '@storybook/react';
import AsyncComponent, { mockEngine } from './problemContainer';

import RegexProblem from '../src/problem-engine/RegexProblem';
import { regexes, loremIpsum } from './fixtures';

import '../src/react-app/CSS/Regex.scss';

const stories = storiesOf('RegexComponent', module).addDecorator(
    StorybookConsole
);

const createProblemFromRegex = async (regex) => {
    let problem = new RegexProblem(regex);
    let serialized = await problem.serialize();

    return {
        socket: mockEngine({
            code: regex.toString(),
            problem: serialized
        }).socket
    };
};

stories.add('Default', () => {
    let fetchProps = async () => {
        let code = /hello|world/;
        let problem = new RegexProblem(code);
        let serialized = await problem.serialize();

        return {
            socket: mockEngine({
                code: code.toString(),
                problem: serialized
            }).socket
        };
    };
    return <AsyncComponent fetchProps={fetchProps} />;
});

stories.add('Spaces', () => {
    const regex = /hello +world/;
    let fetchProps = async () => {
        return createProblemFromRegex(regex);
    };
    return <AsyncComponent fetchProps={fetchProps} />;
});

let i = 0;
for (const regex of regexes) {
    stories.add('Regex' + i++, () => {
        let fetchProps = async () => {
            return createProblemFromRegex(regex);
        };
        return <AsyncComponent fetchProps={fetchProps} />;
    });
}
