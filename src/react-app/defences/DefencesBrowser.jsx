import React from 'react';
import PropTypes from 'prop-types';
import DraggableDefence from './DraggableDefence.jsx';

export default class DefencesBrowser extends React.Component {
    render() {
        return (
            <div>
                {this.props.imageSrcs.map((src) => (
                    <div key={src}>
                        <DraggableDefence
                            src={src}
                            onDragEnd={this.props.onDragEnd}
                            onDragOver={this.props.onDragOver}
                        />
                    </div>
                ))}
            </div>
        );
    }
}

DefencesBrowser.propTypes = {
    imageSrcs: PropTypes.arrayOf(PropTypes.string).isRequired,
    onDragEnd: PropTypes.func.isRequired,
    onDragOver: PropTypes.func.isRequired
};
