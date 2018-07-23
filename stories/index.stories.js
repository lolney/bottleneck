import React from 'react';

import { storiesOf } from '@storybook/react';

import { VisualTreeComponent } from '../src/react-app/BinaryTreeComponent.jsx';
import EditorSocketWatcher from '../src/react-app/EditorSocketWatcher.jsx';
import ImageProblem from '../src/problem-engine/ImageProblem';
import BinaryTreeProblem from '../src/problem-engine/BinaryTreeProblem';
import Windows from '../src/react-app/Windows.jsx';

const mockEngine = (data) => ({
    socket: {
        on: (event, callback) => {
            window.setTimeout(() => {
                callback(data);
            }, 100);
        }
    }
});

class AsyncComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: null
        };
        this.windows = React.createRef();
    }

    componentDidMount() {
        this.props.fetchProps().then((data) => {
            new EditorSocketWatcher(
                data.socket,
                this.windows.current.addWindow
            );
        });
    }

    render() {
        return <Windows ref={this.windows} />;
    }
}

let treeStories = storiesOf('VisualTree', module);

let trees = BinaryTreeProblem.getTrees();
for (const i in trees) {
    let tree = trees[i];
    treeStories.add('Tree' + i, () => <VisualTreeComponent nodes={tree} />);
}

storiesOf('BinaryTreeComponent', module).add('inorder traversal', () => {
    let fetchProps = async () => {
        let problem = new BinaryTreeProblem();
        let serialized = await problem.serialize();
        console.log(serialized);
        return { socket: mockEngine(serialized).socket };
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
            return { socket: mockEngine(serialized).socket };
        };
        return <AsyncComponent fetchProps={fetchProps} />;
    });
}
