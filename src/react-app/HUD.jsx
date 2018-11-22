import React from 'react';
import ReactDOM from 'react-dom';
import { ButtonToolbar, Button } from 'react-bootstrap';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import DefensesBrowser from './defenses/DefensesBrowser.jsx';
import PropTypes from 'prop-types';
import ControlledButton from './ControlledButton.jsx';
import { resourceIcons, assaultBot } from '../config';
import AnimateOnChange from 'react-animate-on-change';
import withSocketFetch from './withSocketFetch.jsx';
import withSocketReq from './withSocketReq.jsx';
import { resourceUpdateHandler, canAfford } from './common/resources';

class HUD extends React.Component {
    render() {
        return (
            <div className="hud-buttons bootstrap-styles">
                <ButtonToolbar>
                    {resourceIcons.map((resource) => (
                        <ResourceButton
                            key={resource.name}
                            {...resource}
                            count={
                                this.props.loading
                                    ? null
                                    : this.props.resources[resource.name]
                            }
                        />
                    ))}
                    <ControlledButton
                        className="hud-button"
                        addWindow={(callback) =>
                            this.props.addWindow(
                                <DefensesBrowser
                                    imageSrcs={['assets/sprites/tree1.png']}
                                    socket={this.props.socket}
                                />,
                                'defensesBrowser',
                                callback
                            )
                        }
                        removeWindow={() =>
                            this.props.removeWindow('defensesBrowser')
                        }
                    >
                        <div className="hud-column">
                            <img
                                alt="defense icon"
                                src="assets/noun_rook_3679.svg"
                                height="20px"
                                width="20px"
                            />
                        </div>
                        <div className="hud-column-2">Siege Tools</div>
                    </ControlledButton>
                    <MiniButtons
                        resources={this.props.resources}
                        initialLoading={this.props.loading}
                        socket={this.props.socket}
                    />

                    <ControlledButton
                        className="btm-btn hud-button"
                        addWindow={(callback) =>
                            this.props.addMenu(callback, this.props.socket)
                        }
                        removeWindow={(key) => this.props.removeMenu()}
                    >
                        Menu
                    </ControlledButton>
                </ButtonToolbar>
            </div>
        );
    }
}

//const tooltip = (
//    <Tooltip id="tooltip" className="bootstrap-styles">
//        <strong>Holy guacamole!</strong> Check this info.
//    </Tooltip>
//);

const MiniButtons = withSocketReq(
    class MiniButtons extends React.Component {
        constructor(props) {
            super(props);
            this.container = React.createRef();
        }
<<<<<<< HEAD

        componentDidMount() {
            //ReactDOM.findDOMNode(this.ref.current).getBoundingClientRect();
            //            this.toolTip.current.style.left = '875px'; //or positionLeft?
            //           this.toolTip.current.style.top = '180px';
        }

        render() {
            const props = this.props;
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
                <div className="mini-btns">
                    <OverlayTrigger
                        placement="left"
                        overlay={tooltip}
                        delayHide="0"
                        container={this.container.current}
                    >
                        <Button
                            ref={this.container}
                            className="mini-btn hud-button"
                            onClick={() => {
                                props.fetch('makeAssaultBot');
                            }}
                            disabled={
                                props.initialLoading ||
                                props.loading ||
                                !canAfford(props.resources, assaultBot.cost)
                            }
                        >
                            <div className="hud-row">
                                <img
                                    alt="assault-botface"
                                    src="assets/assault-botface.png"
                                    height="21px"
                                    width="16px"
                                />
                            </div>
                            <div className="hud-row-2">{props.botCount}</div>
                        </Button>
                    </OverlayTrigger>

=======

        render() {
            const props = this.props;
            return (
                <div ref={this.container} className="mini-btns">
                    <Button
                        className="mini-btn hud-button"
                        onClick={() => {
                            props.fetch('makeAssaultBot');
                        }}
                        disabled={
                            props.initialLoading ||
                            props.loading ||
                            !canAfford(props.resources, assaultBot.cost)
                        }
                    >
                        <div className="hud-row">
                            <img
                                alt="assault-botface"
                                src="assets/assault-botface.png"
                                height="21px"
                                width="16px"
                            />
                        </div>
                        <div className="hud-row-2">{props.botCount}</div>
                    </Button>

>>>>>>> origin/dev
                    <Button className="mini-btn hud-button" />
                    <Button className="mini-btn hud-button" />
                </div>
            );
        }
    },
    () => ({ botCount: 0 })
);

const ResourceButton = ({ name, src, height, width, count }) => (
    <Button className="hud-button">
        <div className="hud-column">
            <img alt={name} src={src} height={height} width={width} />
        </div>
        {count == null ? (
            'loading'
        ) : (
            <AnimateOnChange
                baseClassName="hud-column-2"
                animationClassName="updateable"
                animate={true}
            >
                {count}
            </AnimateOnChange>
        )}
    </Button>
);

HUD.propTypes = {
    addMenu: PropTypes.func.isRequired,
    addWindow: PropTypes.func.isRequired,
    removeWindow: PropTypes.func.isRequired,
    removeMenu: PropTypes.func.isRequired,
    socket: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    resources: PropTypes.object
};

MiniButtons.propTypes = {
    initialLoading: PropTypes.bool.isRequired,
    botCount: PropTypes.number.isRequired,
    resources: PropTypes.object
};

export default withSocketFetch(
    HUD,
    [['resourceUpdate', resourceUpdateHandler]],
    [['resourceInitial', (data) => ({ resources: data })]]
);
