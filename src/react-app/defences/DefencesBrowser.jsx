import React from 'react';
import PropTypes from 'prop-types';
import DraggableDefence from './DraggableDefence.jsx';

export default class DefencesBrowser extends React.Component {
    render() {
        return (
            <div className="defences">
                <h1> Drag and drop a defence to add it to the game </h1>
                {this.props.imageSrcs.map((src) => (
                    <div key={src}>
                        <DraggableDefence src={src} />
                    </div>
                ))}
            </div>
        );
    }
}

DefencesBrowser.propTypes = {
    imageSrcs: PropTypes.arrayOf(PropTypes.string).isRequired
};
