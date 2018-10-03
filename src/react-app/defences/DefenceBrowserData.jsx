import React from 'react';
import '.././CSS/Solutions.scss';
import DefencesBrowser from './DefencesBrowser.jsx';
import PropTypes from 'prop-types';

export default class DefenceBrowserData extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            siegeITems: []
        };
        this.props.socket.emit('siegeItems');
        this.props.socket.on('siegeItems', (data) => {
            this.setState({ siegeItems: data });
        });
    }

    render() {
        return (
            <DefencesBrowser
                key={this.state.siegeItems.length}
                siegeItems={this.state.siegeItems}
            />
        );
    }
}

DefenceBrowserData.propTypes = {
    socket: PropTypes.object.isRequired
};
