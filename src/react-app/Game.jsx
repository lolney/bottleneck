import React from 'react';
import MyClientEngine from '../client/MyClientEngine';
import MyGameEngine from '../common/MyGameEngine';
import { clientDefaults } from '../config';
import resolver from './login/resolver';
import propTypes from 'prop-types';
import withAuth from './login/withAuth.jsx';
import { withRouter } from 'react-router-dom';

class Game extends React.Component {
    componentDidMount() {
        const user = this.props.firebase.auth().currentUser;
        if (!user) {
            this.props.history.push('/login', {
                return: window.location.pathname + window.location.search
            });
        } else {
            user.getIdToken(true).then((token) => {
                let options = Object.assign(clientDefaults, {
                    auth: { token },
                    matchmaker: `match?mode=${this.props.mode}`,
                    matchmakerMethod: 'POST',
                    resolver: resolver(token)
                });

                // create a client engine and a game engine
                const gameEngine = new MyGameEngine(options);
                const clientEngine = new MyClientEngine(gameEngine, options);

                gameEngine.on('cameraMoved', () => this.props.onCameraMove());

                clientEngine.start().then(({ socket, gameApi }) => {
                    this.props.onStart(socket, gameApi);
                    clientEngine.socket.on('solution', (data) => {
                        gameEngine.renderer.onReceiveSolution(
                            data.problemId,
                            data.playerId
                        );
                    });

                    // Sync server game status with client
                    socket.on('gameState', (data) => {
                        console.log(data);
                        gameEngine.setStatus(data.state);
                    });
                });
            });
        }
    }

    render() {
        return <div className="pixiContainer" />;
    }
}

Game.propTypes = {
    mode: propTypes.oneOf(['vs', 'practice']).isRequired,
    firebase: propTypes.object.isRequired,
    history: propTypes.object.isRequired,
    onStart: propTypes.func.isRequired,
    onCameraMove: propTypes.func.isRequired
};

export default withRouter(withAuth(Game));
