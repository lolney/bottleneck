import React from 'react';
import PropTypes from 'prop-types';
import SelectMenu from '../common/SelectMenu.jsx';
import DraggableDefence from './DraggableDefence.jsx';
import { ButtonToolbar, Button } from 'react-bootstrap';
import buttonConfig from './buttonConfig';
import '.././CSS/Defences.scss';
import '.././CSS/GeneralClasses.scss';
import SiegeItemResults from './SiegeItemResults.jsx';

export default class DefencesBrowser extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            siegeItems: []
        };
        this.props.socket.emit('siegeItems');
        this.props.socket.on('siegeItems', (data) => {
            this.setState({ siegeItems: data });
        });
    }
    render() {
        return (
            <div className="defences">
                <div className="header">
                    <h1>Siege Tools</h1>
                </div>
                <div className="body">
                    <SelectMenu
                        key={this.state.siegeItems.length}
                        data={this.state.siegeItems}
                        getType={(siege) => siege.type}
                        buttonConfig={buttonConfig}
                    >
                        <SiegeItemResults
                            data={this.state.siegeItems}
                            key={this.state.siegeItems.length}
                        />
                    </SelectMenu>
                </div>
            </div>
        );
    }
}

DefencesBrowser.propTypes = {
    socket: PropTypes.object.isRequired
};
