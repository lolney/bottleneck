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
                            <img
                                className="player-img"
                                alt="player icon"
                                src="assets/PlayerFace.png"
                            />
                        </div>
                        <div className="title">Bottleneck</div>
                    </div>

                    <div className="body-box">
                        {[
                            {
                                title: 'Practice',
                                src: 'assets/noun_boxing.png',
                                url: '/?mode=practice'
                            },
                            {
                                title: 'VS',
                                src: 'assets/noun_fighting.png',
                                url: '/?mode=vs'
                            }
                        ].map((config, i) => ModeButton(config, i))}
                    </div>
                </div>
            </div>
        );
    }
}

const ModeButton = (config, i) => (
    <div key={config.title} className="btn-cont">
        <Button
            className={`btn-${i + 1} hud-button`}
            onClick={() => window.location.assign(config.url)}
        >
            <img
                className="btn-row"
                alt="practice icon"
                src={config.src}
                width="50px"
            />
            <div className="btn-row">{config.title}</div>
        </Button>
    </div>
);
