import React from 'react';
import PropTypes from 'prop-types';
import withSocket from './withSocket.jsx';

const State = Object.freeze({
    Connected: 'connected',
    Connecting: 'connecting',
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
                camera: camera
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
            />
        );
    }
};

const ConnectionOverlayContainer = function({
    connected,
    authenticated,
    camera,
    matchmaking
}) {
    let state;
    if (matchmaking) {
        state = State.Matchmaking;
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
                <div id="spinner" className="spinner">
                    <div className="loader-wrapper">
                        <div className="loader">
                            {[...Array(8).keys()].map((i) => (
                                <div key={i} />
                            ))}
                        </div>
                    </div>
                    <div className="text-container">
                        <div className="loading-text">{state}</div>
                    </div>
                </div>
            </div>
        );
    }
};

export default SocketFilter;
