import React from 'react';
import { Button } from 'react-bootstrap';

import './Matchmaking.scss';
import '';

export default class Matchmaking extends React.Component {
    render() {
        return (
            <div className="matchmaking">
                <div className="matchmaking-box">
                    <div className="title-box">
                        <div className="image-container">
                            {' '}
                            <img
                                className="player-img"
                                alt="player icon"
                                src="assets/PlayerFace.png"
                            />
                        </div>
                        <div className="title">Bottleneck</div>
                    </div>

                    <div className="body-box">
                        <div className="btn-cont">
                            {' '}
                            <Button
                                className="btn-1 hud-button"
                                onClick={() => window.open('/?mode=practice')}
                            >
                                {' '}
                                <img
                                    className="btn-row"
                                    alt="practice icon"
                                    src="assets/noun_boxing.png"
                                    width="50px"
                                />
                                <div className="btn-row">Practice</div>
                            </Button>
                        </div>
                        <div className="btn-cont">
                            <Button
                                className="btn-2 hud-button"
                                onClick={() => window.open('/?mode=vs')}
                            >
                                <img
                                    className="btn-row"
                                    alt="fight icon"
                                    src="assets/noun_fighting.png"
                                    width="50px"
                                />
                                <div className="btn-row">VS</div>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
