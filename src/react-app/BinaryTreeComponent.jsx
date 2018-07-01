import React from 'react';
import VisualTree from './VisualTree';
import { BinaryTree } from './VisualTree';
import './CSS/BinaryTree.scss';

export default class BinaryTreeComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            nodes: [
                10,
                [5, [3, 2, 4], [8, 7, 9]],
                [15, [12, '-', 14], [18, 19, [20, 21, [22, 23, 24]]]]
            ]
        };
    }

    componentDidMount() {
        const tree = BinaryTree.createTree(this.state.nodes);
        new VisualTree(tree, document.getElementById('myCanvas'), false);
    }

    render() {
        return (
            <section class="content">
                <div class="row-1">
                    <canvas id="myCanvas" resize />
                </div>
                <div class="row-2">
                    <p>{this.state.nodes.toString()}</p>
                </div>
            </section>
        );
    }
}
