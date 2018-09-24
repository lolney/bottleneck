import React from 'react';
import PropTypes from 'prop-types';
import DraggableDefence from './DraggableDefence.jsx';

export default class SiegeItemResults extends React.Component {
    render() {
        return (
            <div className="results">
                <p> Drag and drop a defence to add it to the game </p>
                <div className="defences-grid">
                    {this.props.data.map((siegeItem) => (
                        <div key={this.props.data.name}>
                            <div className="column">
                                <DraggableDefence
                                    key={this.props.data.name}
                                    src={siegeItem.image}
                                    className="defence"
                                />
                            </div>
                            <div className="column">
                                {siegeItem.costwood}
                                <img
                                    alt="log icon"
                                    src="assets/low-log.png"
                                    height="20px"
                                    width="20px"
                                />
                                {siegeItem.coststone}
                                <img
                                    alt="rock icon"
                                    src="assets/low-rock-particle.png"
                                    height="20px"
                                    width="20px"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}

SiegeItemResults.propTypes = {
    data: PropTypes.arrayOf(PropTypes.object).isRequired
};
