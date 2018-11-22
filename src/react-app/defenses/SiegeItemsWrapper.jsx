import React from 'react';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import PropTypes from 'prop-types';
import DraggableDefense from './DraggableDefense.jsx';
import { canAfford } from '../common/resources';

const resources = [
    { name: 'wood', src: 'assets/low-log.png' },
    { name: 'stone', src: 'assets/low-rock-particle.png' }
];

export default class SiegeItemsWrapper extends React.Component {
    constructor(props) {
        super(props);
        this.state = SiegeItemsWrapper.getDerivedStateFromProps(props);
    }

    static getDerivedStateFromProps(props) {
        let combinedResources = resources.map((res) =>
            Object.assign({ count: props.resources[res.name] }, res)
        );

        return {
            resources: combinedResources
        };
    }

    render() {
        return (
            <div className="results">
                <p> Drag and drop an item to add it to the game. </p>
                <p>
                    Add defenses to block your opponent; add offenses to
                    neutralize their defenses.
                </p>
                <div className="defenses-grid">
                    {this.props.data.map((siegeItem) => (
                        <SiegeItem
                            isBuyable={canAfford(
                                this.props.resources,
                                siegeItem.cost
                            )}
                            item={siegeItem}
                            key={siegeItem.name}
                            resources={this.state.resources}
                        />
                    ))}
                </div>
            </div>
        );
    }
}

class SiegeItem extends React.Component {
    render() {
        let siegeItem = this.props.item;
        const tooltip = (
            <div
                style={{
                    position: 'absolute'
                }}
            >
                <Tooltip id="tooltip" className="tooltip">
                    <strong>Holy guacamole!</strong> Check this info.
                </Tooltip>
            </div>
        );
        return (
            <OverlayTrigger placement="top" overlay={tooltip}>
                <div>
                    <div className="column">
                        <DraggableDefense
                            key={siegeItem.id}
                            src={siegeItem.image}
                            id={siegeItem.id}
                            draggable={this.props.isBuyable}
                            className="defense"
                        />
                    </div>
                    <div className="column">
                        {this.props.resources.map((res) => (
                            <ResourceDisplay
                                isLimiting={
                                    siegeItem.cost[res.name] <= res.count
                                }
                                key={res.name}
                                src={res.src}
                                cost={siegeItem.cost[res.name]}
                            />
                        ))}
                    </div>
                </div>
            </OverlayTrigger>
        );
    }
}

class ResourceDisplay extends React.Component {
    render() {
        return (
            <div className={this.props.isLimiting ? '' : 'not-buyable'}>
                {this.props.cost}
                <img src={this.props.src} height="20px" width="20px" />
            </div>
        );
    }
}

SiegeItemsWrapper.propTypes = {
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    resources: PropTypes.shape({
        wood: PropTypes.number,
        stone: PropTypes.number
    }).isRequired
};
