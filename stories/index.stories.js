import React from 'react';

import { storiesOf } from '@storybook/react';

import BinaryTreeComponent from '../src/react-app/BinaryTreeComponent.jsx';
import ProblemComponent from '../src/react-app/ProblemComponent.jsx';
import EditorModal from '../src/react-app/EditorModal.jsx';
import ImageProblem from '../src/problem-engine/ImageProblem';

const btreeProblem = {
    title: 'title',
    description: 'description',
    type: 'btree'
};

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

storiesOf('BinaryTreeComponent', module).add('the tree', () => (
    <BinaryTreeComponent />
));

storiesOf('ProblemComponent', module).add('binary tree component', () => (
    <ProblemComponent problem={btreeProblem} />
));

let stories = storiesOf('EditorModal', module).add(
    'BinaryTreeComponent',
    () => {
        let mockedEngine = mockEngine(btreeProblem);
        return <EditorModal socket={mockedEngine.socket} />;
    }
);

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
