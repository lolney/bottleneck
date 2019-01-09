import React from 'react';

import StorybookConsole from 'react-storybook-console';
import { storiesOf } from '@storybook/react';
import AsyncComponent, { mockEngine } from './problemContainer';

import RegexProblem from '../src/problem-engine/RegexProblem';
import { loremIpsum } from './fixtures';

import '../src/react-app/CSS/Regex.scss';

storiesOf('RegexComponent', module)
    .addDecorator(StorybookConsole)
    .add('Default', () => {
        let fetchProps = async () => {
            let code = /hello|world/g;
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
    })
    .add('Lorem Ipsum', () => {
        let fetchProps = async () => {
            let problem = new RegexProblem('');
            let serialized = await problem.serialize();
            let code = '/hello|world/g';
            return {
                socket: mockEngine({
                    code,
                    problem: { ...serialized, text: loremIpsum }
                }).socket
            };
        };
        return <AsyncComponent fetchProps={fetchProps} />;
    });
