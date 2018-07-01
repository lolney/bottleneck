import React from 'react';

export default class BinaryTreeComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const nodes = [
            10,
            [5, [3, 2, 4], [8, 7, 9]],
            [15, [12, '-', 14], [18, 19, [20, 21, [22, 23, 24]]]]
        ];
        const tree = createTree(nodes);
        new VisualTree(tree, document.getElementById('myCanvas'), false);
    }

    render() {
        return (
            <section class="content">
                <div class="row-1">
                    <canvas id="myCanvas" resize />
                </div>
                <div class="row-2">
                    <p>{this.props.array.toString()}</p>
                </div>
            </section>
        );
    }
}
