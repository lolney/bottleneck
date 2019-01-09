import React from 'react';

import { storiesOf } from '@storybook/react';

import { VisualTreeComponent } from '../src/react-app/problems/BinaryTreeComponent.jsx';
import ImageProblem from '../src/problem-engine/ImageProblem';
import BinaryTreeProblem from '../src/problem-engine/BinaryTreeProblem';
import AsyncComponent, { mockEngine } from './problemContainer';

let treeStories = storiesOf('VisualTree', module);

let trees = BinaryTreeProblem.getTrees();
for (const i in trees) {
    let tree = trees[i];
    treeStories.add('Tree' + i, () => <VisualTreeComponent nodes={tree} />);
}

storiesOf('BinaryTreeComponent', module)
    .add('inorder traversal', () => {
        let fetchProps = async () => {
            let problem = new BinaryTreeProblem();
            let serialized = await problem.serialize();
            return {
                socket: mockEngine({
                    code: '(node) => []',
                    problem: serialized
                }).socket
            };
        };
        return <AsyncComponent fetchProps={fetchProps} />;
    })
    .add('inorder traversal solved', () => {
        let fetchProps = async () => {
            let problem = new BinaryTreeProblem();
            let serialized = await problem.serialize();
            let code = `
                (node) => {
                    let result = [];
                    let _traverse = (node) => {
                        if (Array.isArray(node)) {
                            _traverse(node[1]);
                            result.push(node[0]);
                            _traverse(node[2]);
                        } else if (typeof node == 'number') result.push(node);
                    };
                    _traverse(node);
                    return result;
            };`;
            return {
                socket: mockEngine({
                    isSolved: true,
                    code,
                    problem: serialized
                }).socket
            };
        };
        return <AsyncComponent fetchProps={fetchProps} />;
    });

let stories = storiesOf('ImageComponent', module);

let generators = ImageProblem.getGenerators();
for (const i in generators) {
    let generator = generators[i].generator;
    stories.add(generators[i].name, () => {
        let fetchProps = async () => {
            let problem = await ImageProblem.create(generator);
            let serialized = await problem.serialize();
            return { socket: mockEngine({ problem: serialized }).socket };
        };
        return <AsyncComponent fetchProps={fetchProps} />;
    });
}
