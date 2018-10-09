import React from 'react';
import PropTypes from 'prop-types';
import DraggableDefence from './DraggableDefence.jsx';

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

    isBuyable(siegeItem) {
        for (const resource of this.state.resources) {
            if (siegeItem.cost[resource.name] > resource.count) {
                return false;
            }
        }
        return true;
    }

    render() {
        return (
            <div className="results">
                <p> Drag and drop a defence to add it to the game </p>
                <div className="defences-grid">
                    {this.props.data.map((siegeItem) => (
                        <SiegeItem
                            isBuyable={this.isBuyable(siegeItem)}
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
        return (
            <div>
                <div className="column">
                    <DraggableDefence
                        key={siegeItem.id}
                        src={siegeItem.image}
                        id={siegeItem.id}
                        draggable={this.props.isBuyable}
                        className="defence"
                    />
                </div>
                <div className="column">
                    {this.props.resources.map((res) => (
                        <ResourceDisplay
                            isLimiting={siegeItem.cost[res.name] <= res.count}
                            key={res.name}
                            src={res.src}
                            cost={siegeItem.cost[res.name]}
                        />
                    ))}
                </div>
            </div>
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
