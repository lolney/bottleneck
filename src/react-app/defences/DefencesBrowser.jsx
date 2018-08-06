import React from 'react';
import PropTypes from 'prop-types';
import DraggableDefence from './DraggableDefence.jsx';
import { ButtonToolbar, Button } from 'react-bootstrap';
import '.././CSS/Defences.scss';
import '.././CSS/GeneralClasses.scss';

export default class DefencesBrowser extends React.Component {
    render() {
        return (
            <div className="defences">
                <div className="header">
                    <h1>Siege Tools</h1>
                </div>
                <div className="body">
                    <div className="sidebar">
                        <div className="bootstrap-styles">
                            <ButtonToolbar>
                                <Button>
                                    <div className="column">
                                        <img
                                            src="assets/noun_Sword.png"
                                            alt="sword"
                                            height="50"
                                            width="50"
                                        />
                                    </div>
                                    <h2 className="column">Offensive</h2>
                                </Button>
                                <Button>
                                    <div className="column">
                                        <img
                                            src="assets/Shield.png"
                                            alt="shield"
                                            height="50"
                                            width="50"
                                        />
                                    </div>
                                    <h2 className="column">Defensive</h2>
                                </Button>
                            </ButtonToolbar>
                        </div>
                    </div>
                    <div className="defences">
                        <p> Drag and drop a defence to add it to the game </p>
                        <div className="defences-grid">
                            {this.props.imageSrcs.map((src) => (
                                <div key={src}>
                                    <DraggableDefence
                                        src={src}
                                        className="defence"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

DefencesBrowser.propTypes = {
    imageSrcs: PropTypes.arrayOf(PropTypes.string).isRequired
};
