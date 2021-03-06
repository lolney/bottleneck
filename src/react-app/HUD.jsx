import React, { Fragment } from 'react';
import { ButtonToolbar, Button } from 'react-bootstrap';
import TooltipWrapper from './common/TooltipWrapper.jsx';
import DefensesBrowser from './defenses/DefensesBrowser.jsx';
import SolutionHistory from './solution-history/SolutionHistory.jsx';
import PropTypes from 'prop-types';
import ControlledButton from './ControlledButton.jsx';
import { resourceIcons, assaultBot, formatResourceCost } from '../config';
import AnimateOnChange from 'react-animate-on-change';
import withSocketFetch from './withSocketFetch.jsx';
import withSocketReq from './withSocketReq.jsx';
import { resourceUpdateHandler, canAfford } from './common/resources';

class HUD extends React.Component {
    render() {
        return (
            <div className="hud-buttons bootstrap-styles">
                <ButtonToolbar>
                    <WrappedMiniButtons
                        resources={this.props.resources}
                        initialLoading={this.props.loading}
                        socket={this.props.socket}
                    />

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
                            <div className="column-interior">
                                <img
                                    alt="defense icon"
                                    src="assets/noun_rook_638920.svg"
                                    height="20px"
                                    width="20px"
                                />
                            </div>
                        </div>
                        <div className="hud-column-2">
                            <div className="column-interior">Siege Tools</div>
                        </div>
                    </ControlledButton>

                    <ControlledButton
                        className="hud-button"
                        addWindow={(callback) =>
                            this.props.addWindow(
                                <SolutionHistory
                                    socket={this.props.socket}
                                    openWindow={(code, id) => {
                                        this.props.socket.emit(
                                            'solvedProblem',
                                            {
                                                id: id
                                            }
                                        );
                                    }}
                                />,
                                'solutionHistory',
                                callback
                            )
                        }
                        removeWindow={() =>
                            this.props.removeWindow('solutionHistory')
                        }
                    >
                        <div className="hud-column">
                            <div className="column-interior">
                                <img
                                    alt="history icon"
                                    //src="assets/noun_clock_2157047.svg"
                                    src="assets/noun_History_1666964.svg"
                                    height="20px"
                                    width="20px"
                                />
                            </div>
                        </div>
                        <div className="hud-column-2">
                            <div className="column-interior">
                                Solution History
                            </div>
                        </div>
                    </ControlledButton>

                    <WrappedAssaultButton
                        resources={this.props.resources}
                        initialLoading={this.props.loading}
                        socket={this.props.socket}
                    />

                    <ControlledButton
                        id="btm-btn-mrgn"
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

const MiniButtons = (props) => (
    <div className="mini-btns">
        {resourceIcons.map((resource) => (
            <IndicatorResource
                key={resource.name}
                {...resource}
                count={
                    props.initialLoading ? null : props.resources[resource.name]
                }
            />
        ))}

        <TooltipWrapper
            triggerProps={{ placement: 'left' }}
            text={'Active collection bots'}
        >
            <Button className="mini-btn">
                <IndicatorBot count={props.collectionBotCount} />
            </Button>
        </TooltipWrapper>
    </div>
);

const IndicatorResource = ({ name, src, height, width, count }) => (
    <TooltipWrapper
        triggerProps={{ placement: 'left' }}
        text={`Amount of ${name} you have collected`}
        disabled={false}
    >
        <Button className="mini-btn" id="btn-mrgn">
            <div className="hud-row">
                <img alt={name} src={src} height={height} width={width} />
            </div>
            {count == null ? (
                'loading'
            ) : (
                <AnimateOnChange
                    className="hud-row-2"
                    baseClassName="hud-row-2"
                    animationClassName="updateable"
                    animate={true}
                >
                    {count}
                </AnimateOnChange>
            )}
        </Button>
    </TooltipWrapper>
);

const IndicatorBot = ({ count }) => (
    <Fragment>
        <div className="hud-row">
            <img
                alt="botface"
                src="assets/botface2.png"
                height="21px"
                width="16px"
            />
        </div>
        <div className="hud-row-2">{count}</div>
    </Fragment>
);

const AssaultBotButton = (props) => (
    <TooltipWrapper
        triggerProps={{ placement: 'left' }}
        disabled={
            props.initialLoading ||
            props.loading ||
            !canAfford(props.resources, assaultBot.cost)
        }
        text={`Buy an assault creep for ${formatResourceCost(assaultBot.cost)}`}
    >
        <Button
            className="hud-button"
            onClick={() => {
                props.fetch('makeAssaultBot', {}, ({ botCount }) => ({
                    assaultBotCount: botCount
                }));
            }}
            disabled={
                props.initialLoading ||
                props.loading ||
                !canAfford(props.resources, assaultBot.cost)
            }
            id="btn-assault-bot"
        >
            <div className="hud-column">
                <div className="column-interior">
                    <img
                        alt="assault-botface"
                        //src="assets/noun_Legion_814530.svg"
                        src="assets/noun_Helmet_307500.svg"
                        height="20px"
                        width="20px"
                    />
                </div>
            </div>
            <div className="hud-column-2">
                <div className="column-interior">{props.assaultBotCount}</div>
            </div>
        </Button>
    </TooltipWrapper>
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
    collectionBotCount: PropTypes.number.isRequired,
    resources: PropTypes.object
};

const WrappedMiniButtons = withSocketReq(
    MiniButtons,
    [
        [
            'collectionBotCount',
            ({ botCount }) => ({
                collectionBotCount: botCount
            })
        ]
    ],
    () => ({ collectionBotCount: 0 })
);

const WrappedAssaultButton = withSocketReq(
    AssaultBotButton,
    [
        [
            'assaultBotCount',
            ({ botCount }) => ({
                assaultBotCount: botCount
            })
        ]
    ],
    () => ({ assaultBotCount: 0 })
);

export default withSocketFetch(
    HUD,
    [['resourceUpdate', resourceUpdateHandler]],
    [['resourceInitial', (data) => ({ resources: data })]]
);
