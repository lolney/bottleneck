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
                            <DraggableDefence
                                key={this.props.data.name}
                                src={siegeItem.image}
                                //className="defence"
                            />
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
