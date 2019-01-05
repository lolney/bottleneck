import React, { Fragment } from 'react';
import CancelDialog from './CancelDialog.jsx';
import TutorialStateMachine from './StateMachine.jsx';
import EventMiddleware from './eventMiddleware.js';
import createStates from './tutorialData';
import propTypes from 'prop-types';
import { withAlert } from 'react-alert';
import AlertContents from './AlertContents.jsx';
import TutorialArrow from './TutorialArrow.jsx';

class Tutorial extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            modal: null,
            arrow: null,
            isActive: true
        };

        this.openModal = this.openModal.bind(this);
        this.showArrow = this.showArrow.bind(this);
        this.endTutorial = this.endTutorial.bind(this);

        this.eventMiddleware = new EventMiddleware(this.openModal);
        this.props.socket.use(this.eventMiddleware);
    }

    componentDidMount() {
        new TutorialStateMachine({
            alert: this.props.alert,
            eventMiddleware: this.eventMiddleware,
            openModal: this.openModal,
            showArrow: this.showArrow,
            states: createStates(this.props.gameApi),
            renderWait: (props) => <AlertContents {...props} />,
            renderProceed: (props) => <AlertContents {...props} />
        })
            .run()
            .then(() => {
                this.endTutorial();
            });
    }

    endTutorial() {
        this.setState({
            isActive: false
        });
        this.eventMiddleware.active = false;
    }

    showArrow(arrowConfig) {
        this.setState({
            arrow: (
                <TutorialArrow {...arrowConfig} gameApi={this.props.gameApi} />
            )
        });
        return {
            remove: () => {
                this.setState({ arrow: null });
            }
        };
    }

    openModal(onOk, onCancel) {
        if (!this.state.modal) {
            this.setState({
                modal: (
                    <CancelDialog
                        ok={() => {
                            onOk();
                            this.setState({ modal: null });
                        }}
                        cancel={() => {
                            if (onCancel) {
                                onCancel();
                            }
                            this.setState({ modal: null });
                        }}
                    />
                )
            });
        } else {
            throw new Error('Modal is already open');
        }
    }

    render() {
        return (
            <Fragment>
                {this.state.modal}
                {this.state.arrow}
            </Fragment>
        );
    }
}

Tutorial.propTypes = {
    socket: propTypes.object.isRequired,
    alert: propTypes.object.isRequired,
    gameApi: propTypes.object.isRequired
};

export default withAlert(Tutorial);
