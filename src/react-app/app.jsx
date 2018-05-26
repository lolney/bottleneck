import React from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import './CSS/Modal.css';

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
    constructor() {
        super();

        this.state = {
            modalIsOpen: false,
            title: "No problem yet"
        };
        console.log("run");
        this.openModal = this.openModal.bind(this);
        this.afterOpenModal = this.afterOpenModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
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
                <button onClick={this.openModal}>Open Modal</button>
                <Modal
                    isOpen={this.state.modalIsOpen}
                    onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    style={customStyles}
                    contentLabel={this.title}
                >

                    <div className="wrapper">
                        <header className="header">Header: Fixed height</header>
                        <section className="content">
                            <div className="row-1">
                                <sidebar-1 className="sidebar-1"></sidebar-1>
                                <sidebar-2 className="sidebar-2"></sidebar-2>
                                <main className="main"></main>
                                <aside className="caption-first">Caption First</aside>
                                <aside className="caption-second">Caption Second</aside>
                            </div>
                            <div className="row-2">
                                <sidebar-1 className="sidebar-1"></sidebar-1>
                                <sidebar-2 className="sidebar-2"></sidebar-2>
                                <main className="main"></main>
                                <img src="https://source.unsplash.com/random" className="image-first"></img>
                                <img src="https://source.unsplash.com/random" className="image-second"></img>
                            </div>
                        </section>
                        <footer className="footer">Footer: Fixed height</footer>
                    </div>
                </Modal>
            </div>
        );
    }
}

export default function createApp() {
    window.addEventListener('DOMContentLoaded', () => {
        Modal.setAppElement('#overlay');
        ReactDOM.render(<App />, document.getElementById('overlay'));
    });
}
