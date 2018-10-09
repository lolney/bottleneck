import React from 'react';
import PropTypes from 'prop-types';
import SelectMenu from '../common/SelectMenu.jsx';
import DraggableDefence from './DraggableDefence.jsx';
import { ButtonToolbar, Button } from 'react-bootstrap';
import buttonConfig from './buttonConfig';
import SiegeItemsWrapper from './SiegeItemsWrapper.jsx';

export default class DefencesBrowser extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            siegeItems: [],
            resources: {
                wood: 0,
                stone: 0
            }
        };
        this.props.socket.on('siegeItems', (data) => {
            this.setState({ siegeItems: data });
        });
        this.props.socket.emit('siegeItems');
        // Listen for initial update first
        this.props.socket.once('resourceInitial', (data) => {
            this.setState({ ...this.state, resources: data });

            this.props.socket.on('resourceUpdate', (data) => {
                let resources = { ...this.state.resources };
                if (data.shouldReset == true) {
                    resources[data.name] = data.count;
                } else {
                    resources[data.name] = resources[data.name] + data.count;
                }
                this.setState({ ...this.state, resources: resources });
            });
        });
        this.props.socket.emit('resourceInitial');
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
                        <SiegeItemsWrapper
                            data={this.state.siegeItems}
                            resources={this.state.resources}
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
