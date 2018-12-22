import React from 'react';
import PropTypes from 'prop-types';
import withSocket from './withSocket.jsx';
import { GameStatus as Status } from '../common/types';
import 'semantic-ui-css/semantic.min.css';
import { Dimmer, Loader, Image, Segment } from 'semantic-ui-react';

const State = Object.freeze({
    Connected: 'connected',
    Connecting: 'connecting',
    OpponentConnecting: 'opponent connecting',
    Loading: 'loading',
    Authenticating: 'authenticating',
    Finishing: 'finishing',
    Matchmaking: 'matchmaking'
});

const SocketFilter = function({ socket, camera }) {
    if (socket) {
        let Wrapped = withSocket(
            ConnectionOverlayContainer,
            [
                [
                    'connect',
                    () => ({
                        connected: true
                    })
                ],
                [
                    'gameState',
                    (data) => ({
                        opponentConnected: data.state != Status.SUSPENDED
                    })
                ],
                [
                    'disconnect',
                    () => ({
                        connected: false
                    })
                ],
                [
                    'authenticated',
                    () => ({
                        authenticated: true
                    })
                ]
            ],
            () => ({
                connected: socket.connected,
                authenticated: true,
                matchmaking: false,
                camera: camera,
                opponentConnected: true
            })
        );
        return <Wrapped socket={socket} />;
    } else {
        return (
            <ConnectionOverlayContainer
                matchmaking={true}
                connected={false}
                authenticated={false}
                camera={camera}
                opponentConnected={false}
            />
        );
    }
};

// TODO: consider treating this as a state machine
const ConnectionOverlayContainer = function({
    connected,
    authenticated,
    camera,
    matchmaking,
    opponentConnected
}) {
    let state;
    if (matchmaking) {
        state = State.Matchmaking;
    } else if (!opponentConnected) {
        state = State.OpponentConnecting;
    } else if (camera && connected && authenticated) {
        state = State.Connected;
    } else if (connected && authenticated) {
        state = State.Finishing;
    } else if (connected) {
        state = State.Authenticating;
    } else if (camera) {
        state = State.Connecting; // hit this if not connected, even if authenticated
    } else {
        state = State.Loading;
    }
    return <ConnectionOverlay state={state} />;
};

const ConnectionOverlay = ({ state }) => {
    switch (state) {
    case State.Connected:
        return null;
    default:
        return (
            <div className="loading-screen">
                <Dimmer active inverted>
                    <Loader size="big" inverted content={state} />
                </Dimmer>
            </div>
        );
    }
};

export default SocketFilter;
