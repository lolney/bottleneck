import React from 'react';

import { storiesOf } from '@storybook/react';
import Window from '../src/react-app/Window.jsx';
import Windows from '../src/react-app/Windows.jsx';

class WindowsContainer extends React.Component {
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
                    {' '}
                    Add Window{' '}
                </button>
                <Windows ref={this.windows}>{this.props.children}</Windows>
            </div>
        );
    }
}
storiesOf('Windows', module).add('Windows', () => (
    <WindowsContainer>
        <p>Window 1</p>
        <p>Window 2</p>
    </WindowsContainer>
));
