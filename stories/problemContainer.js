import React from 'react';

import EditorSocketWatcher from '../src/react-app/EditorSocketWatcher.jsx';

import Windows from '../src/react-app/Windows.jsx';

export const mockEngine = (data) => ({
    socket: {
        removeListener: () => {},
        on: (event, callback) => {
            window.setTimeout(() => {
                callback(data);
            }, 100);
        }
    }
});

export default class AsyncComponent extends React.Component {
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
