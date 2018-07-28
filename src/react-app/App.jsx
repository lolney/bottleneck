import React from 'react';
import ReactDOM from 'react-dom';
import { ENGINE_METHOD_DIGESTS } from 'constants';

import EditorSocketWatcher from './EditorSocketWatcher.jsx';
import ConnectionOverlay from './ConnectionOverlay.jsx';
import Login from './Login.jsx';
import HUD from './HUD.jsx';
import Game from './Game.jsx';
import Windows from './Windows.jsx';

import DefencesBrowser from './defences/DefencesBrowser.jsx';
import './CSS/Defences.scss';

/*
\ App
    \                            ^ Session token
     ?- not logged in -> Login --|
    \
     --> Socket
     ?- attempted login and not connected -> ConnectionOverlay
    \ WindowLayer
        \
         --> Socket
         ?- displaying problem -> Modal
                                \ Editor
    \ --> Socket
      HUD
       \ Menu
       \ ResourceCounts
    \ --> Token     ^ Socket
      Game ---------|

    - Create a wrapper class for the socket for better event management?
        - Might help with re-authenticating after disconnect
*/

export class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            token: true, // TODO: initialize as null and get from login
            socket: null
        };
        this.onReceiveToken = this.onReceiveToken.bind(this);
        this.onReceiveSocket = this.onReceiveSocket.bind(this);

        this.windows = React.createRef();
    }

    onReceiveToken(token) {
        this.setState({ token: token });
    }

    onReceiveSocket(socket) {
        new EditorSocketWatcher(socket, this.windows.current.addWindow);
        this.setState({ socket: socket });
    }

    render() {
        return (
            <div>
                {!this.state.token && (
                    <Login onReceiveToken={this.onReceiveToken} />
                )}
                {this.state.token && (
                    <ConnectionOverlay
                        key={this.state.socket == null}
                        socket={this.state.socket}
                    />
                )}
                {this.state.socket && <HUD socket={this.state.socket} />}
                <Windows ref={this.windows}>
                    <DefencesBrowser imageSrcs={['assets/sprites/tree1.png']} />
                </Windows>
                {this.state.token && (
                    <Game
                        onReceiveSocket={this.onReceiveSocket}
                        token={this.state.token}
                    />
                )}
            </div>
        );
    }
}

export default function createApp() {
    window.addEventListener('DOMContentLoaded', () => {
        ReactDOM.render(<App />, document.getElementById('app'));
    });
}
