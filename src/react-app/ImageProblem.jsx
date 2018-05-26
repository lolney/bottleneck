import React from 'react';
import { renderToString } from 'react-dom/server';
import './CSS/Modal.css';

export default class ImageProblem extends React.Component {
    // Passes props title, description, original and  to ProblemComponent
    // Passing JSX:
    // https://stackoverflow.com/questions/25797048/how-to-pass-in-a-react-component-into-another-react-component-to-transclude-the?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
    render() {
        return (
            <div className="wrapper">
                <header className="header">{this.props.problem.title}</header>
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
                <footer className="footer">{this.props.problem.description}</footer>
            </div>
        )
    }

}

export function rendered() {
    return renderToString(<ImageProblem />);
}