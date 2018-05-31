import React from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import Editor from './editor.jsx';
import ace from 'ace-builds';
import ImageComponent from './ImageComponent.jsx';


const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)'
    }
};

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            modalIsOpen: false,
            title: "No problem yet",
            problem: undefined,
            generator: function (x, y) { return 1.0 },
        };
        console.log("run");
        this.openModal = this.openModal.bind(this);
        this.afterOpenModal = this.afterOpenModal.bind(this);
        this.closeModal = this.closeModal.bind(this);

        let setSocketEvent = (() => {
            if (!this.props.clientEngine.socket) {
                window.setTimeout(() => {
                    setSocketEvent();
                }, 1000);
            } else {
                this.props.clientEngine.socket.on('problem', (data) => {
                    console.log('display', data);
                    this.setState({ problem: data })
                    this.openModal();
                });
            }
        }).bind(this);
        setSocketEvent();
    }

    setGenerator(func) {
        this.setState({ generator: func })
    }

    openModal() {
        this.setState({ modalIsOpen: true });
        this.setState({ title: "ending" });
        fetch("http://localhost:3000/problem/1")
            .then(res => {
                console.log(res);
                if (res.status == 200) {
                    res.json().then(json => {
                        this.setState({ title: json.title });
                    });
                }
            });
    }

    afterOpenModal() {
        // references are now sync'd and can be accessed.
        //this.subtitle.style.color = '#f00';
    }

    closeModal() {
        this.setState({ modalIsOpen: false });
    }

    render() {
        return (
            <div>
                <Modal
                    isOpen={this.state.modalIsOpen}
                    onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    style={customStyles}
                    contentLabel={this.title}
                >
                    {this.state.problem &&
                        <ImageComponent
                            problem={this.state.problem}
                            generator={this.state.generator}
                        />}
                    <Editor />
                </Modal>
            </div>
        );
    }
}

export default function createApp(clientEngine) {
    window.addEventListener('DOMContentLoaded', () => {
        Modal.setAppElement('#overlay');
        ReactDOM.render(<App clientEngine={clientEngine} />, document.getElementById('overlay'));
    });
}
