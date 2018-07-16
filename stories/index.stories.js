import React from 'react';

import { storiesOf } from '@storybook/react';

import { VisualTreeComponent } from '../src/react-app/BinaryTreeComponent.jsx';
import EditorModal from '../src/react-app/EditorModal.jsx';
import ImageProblem from '../src/problem-engine/ImageProblem';
import BinaryTreeProblem from '../src/problem-engine/BinaryTreeProblem';
import VisualTree from '../src/react-app/VisualTree';

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
    }

    componentDidMount() {
        this.props.fetchProps().then((data) => this.setState({ data }));
    }

    render() {
        if (this.state.data) {
            let elem = React.cloneElement(this.props.children, this.state.data);
            console.log(elem);
            return elem;
        } else {
            return <div> Loading </div>;
        }
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
    return (
        <AsyncComponent fetchProps={fetchProps}>
            <EditorModal />
        </AsyncComponent>
    );
});

let stories = storiesOf('ImageComponent', module);

let generators = ImageProblem.getGenerators();
for (const i in generators) {
    let generator = generators[i];
    stories.add('ImageComponent' + i, () => {
        let fetchProps = async () => {
            let problem = await ImageProblem.create(generator);
            let serialized = await problem.serialize();
            return { socket: mockEngine(serialized).socket };
        };
        return (
            <AsyncComponent fetchProps={fetchProps}>
                <EditorModal />
            </AsyncComponent>
        );
    });
}
