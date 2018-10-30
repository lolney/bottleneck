import React from 'react';
import PropTypes from 'prop-types';
import SelectMenu from '../common/SelectMenu.jsx';
import buttonConfig from './buttonConfig';
import SiegeItemsWrapper from './SiegeItemsWrapper.jsx';
import withSocketFetch from '../withSocketFetch.jsx';
import { resourceUpdateHandler } from '../common/resources';

class DefensesBrowser extends React.Component {
    render() {
        let siegeItems = this.props.loading ? [] : this.props.siegeItems;
        let resources = this.props.loading ? {} : this.props.resources;
        return (
            <div className="defenses">
                <div className="header">
                    <h1>Siege Tools</h1>
                </div>
                <div className="body">
                    <SelectMenu
                        data={siegeItems}
                        getType={(siege) => siege.type}
                        buttonConfig={buttonConfig}
                    >
                        <SiegeItemsWrapper
                            data={siegeItems}
                            resources={resources}
                        />
                    </SelectMenu>
                </div>
            </div>
        );
    }
}

export default withSocketFetch(
    DefensesBrowser,
    [['resourceUpdate', resourceUpdateHandler]],
    [
        ['resourceInitial', (data) => ({ resources: data })],
        ['siegeItems', (data) => ({ siegeItems: data })]
    ]
);

DefensesBrowser.propTypes = {
    socket: PropTypes.object.isRequired
};
