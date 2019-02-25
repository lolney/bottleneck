import regex from './regexes.json';
import safe from 'safe-regex';
import RandExp from 'randexp';
import { problemTypes } from '../src/constants.js';

export const solvedProblems = [
    { problem: { name: 'image0', type: problemTypes.IMAGE }, code: 'code' },
    { problem: { name: 'image1', type: problemTypes.IMAGE }, code: 'code' },
    {
        problem: { name: 'This is a long name', type: problemTypes.BTREE },
        code: 'code'
    },
    {
        problem: {
            name: 'image2',
            type: problemTypes.IMAGE,
            subproblem: { type: 'gradient' }
        },
        code: 'code'
    },
    {
        problem: {
            name: 'image3',
            type: problemTypes.IMAGE,
            subproblem: { type: 'sin' }
        },
        code: 'code'
    }
];

export const loremIpsum =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.                                                                                                      ';

export const regexes = regex
    .map((obj) => new RegExp(obj.regex))
    .filter((regex) => safe(regex))
    .filter((regex) => !!new RandExp(regex).gen())
    .filter((regex) => !regex.test(''));
