import React from 'react';

import { storiesOf } from '@storybook/react';
import Windows from '../src/react-app/Windows.jsx';
import EditorModal from '../src/react-app/EditorModal.jsx';

import { socket } from './solutionHistory';
import SolutionHistory from '../src/react-app/solution-history/SolutionHistory.jsx';

export class WindowsContainer extends React.Component {
    constructor(props) {
        super(props);
        this.windows = React.createRef();
    }
    render() {
        return (
            <div>
                <button
                    onClick={() =>
                        this.windows.current.addWindow(<div> Hello </div>)
                    }
                    style={{ float: 'right' }}
                >
                    Add Window
                </button>
                <Windows ref={this.windows}>{this.props.children}</Windows>
            </div>
        );
    }
}

export class WindowsContainer2 extends React.Component {
    constructor(props) {
        super(props);
        this.windows = React.createRef();
    }
    render() {
        return (
            <div>
                <Windows ref={this.windows}>
                    <SolutionHistory
                        socket={socket}
                        openWindow={(code, problem) => {
                            console.log('opened');
                            this.windows.current.addWindow(
                                <EditorModal
                                    onSolution={() => {}}
                                    problem={problem}
                                    code={code}
                                />
                            );
                        }}
                    />
                </Windows>
            </div>
        );
    }
}

storiesOf('Windows', module)
    .add('Windows', () => (
        <WindowsContainer>
            <p>Window 1</p>
            <p>Window 2</p>
            <div>
                <input placeholder="Window 3" style={{ display: 'block' }} />
                <input placeholder="Window 3" />
            </div>
        </WindowsContainer>
    ))
    .add('Solution History', () => <WindowsContainer2 />);
