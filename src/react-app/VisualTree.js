import paper from 'paper';
import Validator, { Type } from '../problem-engine/Validator';

export class BinaryTree {
    constructor(el) {
        this.element = el;
        this.left = null;
        this.right = null;
        this.node = null;
    }

    static getHeight(tree) {
        if (tree == null) return 0;
        return Math.max(
            BinaryTree.getHeight(tree.left) + 1,
            BinaryTree.getHeight(tree.right) + 1
        );
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
        tree.left = BinaryTree.createTree(leftChild(nodes));
        tree.right = BinaryTree.createTree(rightChild(nodes));

        return tree;
    }

    static wrapGenerator(generator) {
        return (...args) => {
            let returnValidator = new Validator(
                [Type.is('object'), Type.isArray()],
                1
            );
            return returnValidator.callGeneratorWithValidator(generator, args);
        };
    }
}

class BinaryNode {
    constructor(tree, depth, x, config) {
        let { dW, dH, scale } = config;
        let pos = new Point(
            config.origin[0] + x * dW,
            config.origin[1] + depth * dH
        );

        function drawEdge(pos1, pos2) {
            return new Path.Line({
                from: pos1,
                to: pos2,
                strokeColor: 'black',
                strokeWidth: 2 * scale
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

        const radius = 20 * scale;
        this.circle = new Path.Circle({
            radius: radius,
            strokeWidth: 2 * scale,
            fillColor: 'white',
            strokeColor: 'black',
            center: pos
        });
        this.text = new PointText({
            position: new Point(
                tree.element >= 10
                    ? pos.x - (3 / 4) * radius
                    : pos.x - (1 / 2) * radius,
                pos.y + 9 * scale
            ),
            fontSize: 26 * scale + 'px',
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
        paper.setup(canvas.id);
        this.animation = animation;

        const scale = 0.5;
        this.staticConfig = {
            height: BinaryTree.getHeight(tree),
            dH: 60 * scale,
            sideMargin: 50 * scale,
            scale: scale,
            originY: 30 * scale
        };
        this.canvas = canvas;

        canvas.height =
            this.staticConfig.height * this.staticConfig.dH +
            this.staticConfig.originY;
        canvas.style = '';

        window.onresize = () => {
            this.deleteTreeVisual(tree);
            this.draw(tree);
        };

        this.draw(tree);
    }

    getConfig() {
        const canvasWidth = this.canvas.width;
        return {
            ...this.staticConfig,
            canvasWidth: canvasWidth,
            origin: [canvasWidth / 2, this.staticConfig.originY],
            dW: (canvasWidth - this.staticConfig.sideMargin) / 4
        };
    }

    draw(tree) {
        this.t = 0;
        this.drawPreOrder(tree, 0, 0);
    }

    drawPreOrder(tree, depth, x) {
        // depth: depth of the current node, x: x-coordinate of the current node
        if (tree == null) return;

        if (this.animation)
            setTimeout(() => {
                tree.node = new BinaryNode(tree, depth, x, this.getConfig());
            }, 500 * this.t++);
        else {
            tree.node = new BinaryNode(tree, depth, x, this.getConfig());
            view.update();
        }

        this.drawPreOrder(tree.left, depth + 1, x - 1 / Math.pow(2, depth));
        this.drawPreOrder(tree.right, depth + 1, x + 1 / Math.pow(2, depth));
    }

    deleteTreeVisual(tree) {
        if (tree == null) return;

        this.deleteTreeVisual(tree.left);
        this.deleteTreeVisual(tree.right);

        if (tree.node.leftEdge) tree.node.leftEdge.remove();

        if (tree.node.rightEdge) tree.node.rightEdge.remove();

        tree.node.circle.remove();
        tree.node.text.remove();
    }
}
