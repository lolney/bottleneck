import paper from 'paper';

class BinaryTree {
    constructor(el) {
        this.element = el;
        this.left = null;
        this.right = null;
        this.node = null;
    }

    getHeight() {
        if (this == null) return 0;
        return Math.max(getHeight(tree.left) + 1, getHeight(tree.right) + 1);
    }

    static createTree(nodes) {
        // it is kind of preorder style, because we have node itself first then its children

        function datum(tree) {
            return tree[0];
        }
        function leftChild(tree) {
            return tree[1];
        }
        function rightChild(tree) {
            return tree[2];
        }

        if (nodes == null || nodes == '-') return null;

        let tree = new BinaryTree(datum(nodes) || nodes);
        tree.left = createTree(leftChild(nodes));
        tree.right = createTree(rightChild(nodes));

        return tree;
    }
}

class BinaryNode {
    constructor(tree, depth, x, config) {
        let { dW, dH } = config;
        let pos = new Point(origin[0] + x * dW, origin[1] + depth * dH);

        function drawEdge(pos1, pos2) {
            return new Path.Line({
                from: pos1,
                to: pos2,
                strokeColor: 'black',
                strokeWidth: 2
            }).sendToBack();
        }

        if (tree.left)
            // if left exists, the right child also exists
            this.leftEdge = drawEdge(
                pos,
                pos.add([-(1 / Math.pow(2, depth)) * dW, dH])
            );
        if (tree.right)
            this.rightEdge = drawEdge(
                pos,
                pos.add([(1 / Math.pow(2, depth)) * dW, dH])
            );

        this.circle = new Path.Circle({
            radius: 20,
            strokeWidth: 2,
            fillColor: 'white',
            strokeColor: 'black',
            center: pos
        });
        this.text = new PointText({
            position: new Point(
                tree.element >= 10 ? pos.x - 15 : pos.x - 8,
                pos.y + 9
            ),
            fontSize: '26px',
            fillColor: 'black',
            content: '' + tree.element
        });
        this.text.bringToFront();
    }
}

export default class VisualTree {
    constructor(tree, canvas, animation) {
        paper.install(window);
        paper.install(window);
        paper.setup('myCanvas');

        this.staticConfig = {
            height: tree.getHeight(),
            dH: 6,
            sideMargin: 20
        };
        this.canvas = canvas;

        canvas.height = height * this.staticConfig.dH + 10;

        window.onresize = () => {
            this.draw();
        };

        this.draw();
    }

    getConfig() {
        const canvasWidth = this.canvas.width;
        return {
            canvasWidth: canvasWidth,
            origin: [canvasWidth / 2, 35],
            dW: (canvasWidth - staticConfig.sideMargin) / 4,
            height: this.staticConfig.height,
            dH: this.staticConfig.dH,
            sideMargin: this.staticConfig.sideMargin
        };
    }

    draw() {
        this.t = 0;
        VisualTree.drawPreOrder(this.getCOnfig(), tree, 0, 0);
    }

    drawPreOrder(tree, depth, x) {
        // depth: depth of the current node, x: x-coordinate of the current node
        if (tree == null) return;

        if (animation)
            setTimeout(function() {
                tree.node = new BinaryNode(tree, depth, x);
            }, 500 * this.t++);
        else tree.node = new BinaryNode(tree, depth, x);

        drawPreOrder(tree.left, depth + 1, x - 1 / Math.pow(2, depth));
        drawPreOrder(tree.right, depth + 1, x + 1 / Math.pow(2, depth));
    }
}
