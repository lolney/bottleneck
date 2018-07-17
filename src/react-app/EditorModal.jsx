import React from 'react';
import Modal from 'react-modal';
import Editor from './Editor.jsx';
import ace from 'ace-builds';
import ProblemComponent from './ProblemComponent.jsx';

import './CSS/Modal.scss';

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        width: '500px',
        height: '75vh',
        maxHeight: '1000px'
    }
};

export default class EditorModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            generatorError: null,
            modalIsOpen: false,
            problem: null,
            code: '',
            generator: function(x, y) {
                return 0;
            }
        };
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.setGenerator = this.setGenerator.bind(this);
        this.reportError = this.reportError.bind(this);
        this.onSolution = this.onSolution.bind(this);
    }

    componentDidMount() {
        Modal.setAppElement('#overlay');
        this.props.socket.on('problem', (data) => {
            console.log('display', data);
            this.setState({ problem: data, code: data.code });
            this.openModal();
        });
    }

    setGenerator(code) {
        try {
            let func = eval(code);
            if (!func) {
                throw new Error('Output is undefined');
            }
            if (typeof func != 'function')
                throw new Error('Must enter a function');
            this.setState({ generator: func, code: code });
        } catch (error) {
            this.setState({ generatorError: error });
        }
    }

    onSolution(problemId) {
        if (!problemId)
            throw new TypeError('Argument `problemId` is undefined');
        this.props.socket.emit('solution', {
            problemId: problemId,
            code: this.state.code
        });
    }

    openModal() {
        this.setState({ modalIsOpen: true });
    }

    closeModal() {
        this.setState({ modalIsOpen: false });
    }

    reportError(error) {
        this.setState({ generatorError: error });
    }

    render() {
        return (
            <div id="overlay">
                <Modal
                    isOpen={this.state.modalIsOpen}
                    onRequestClose={this.closeModal}
                    style={customStyles}
                >
                    {this.state.problem && (
                        <ProblemComponent
                            problem={this.state.problem}
                            generator={this.state.generator}
                            reportError={this.reportError}
                            onSolution={this.onSolution}
                        />
                    )}
                    <Editor
                        onChange={this.setGenerator}
                        value={this.state.code}
                        generatorError={this.state.generatorError}
                    />
                </Modal>
            </div>
        );
    }
}
