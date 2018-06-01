import React from "react";
import Enzyme, { mount, shallow } from "enzyme";
import ImageComponent from "../../src/react-app/ImageComponent";
import sinon from 'sinon';
import Adapter from 'enzyme-adapter-react-16';
import ReactJSDOM from 'react-jsdom';
import ImageProblem from '../../src/problem-engine/ImageProblem';

Enzyme.configure({ adapter: new Adapter() });
process.env.NODE_ENV = 'test';

describe('ImageComponent', () => {

    let mountedImageComponent;
    const goalGenerator = function (x, y) { return y * 255 };

    beforeEach((done) => {
        ImageProblem.create(goalGenerator)
            .then((prob) => {
                return prob.serialize();
            })
            .then((serialized) => {
                let props = {
                    generator: (x, y) => { return 0 },
                    problem: serialized
                };
                mountedImageComponent = <ImageComponent {...props} />;
                done();
            });
    });

    it('use generator to render new image', (done) => {
        // Create image problem `a` with some generator
        const wrapper = shallow(mountedImageComponent);
        const generator = (x, y) => {
            return x * 255;
        };
        ImageProblem.create(generator).then((problem) => {
            expect(wrapper.state('target')).not.toEqual(problem.original);
            // Pass that generator as props
            wrapper.setProps({ generator: generator });
            // Check that the component's target is equal to `a.original`
            process.nextTick(() => {
                wrapper.update();
                expect(wrapper.state('target')).toEqual(problem.original);
                expect(wrapper.state('done')).toEqual(false);
                done();
            });
        });
    });

    it('sanity check when passing props', () => {
        const wrapper = shallow(mountedImageComponent);
        const spy = sinon.spy(wrapper.instance(), "componentDidUpdate");

        expect(spy.calledOnce).toEqual(false);
        wrapper.setProps({ prop: 2 });
        expect(spy.calledOnce).toEqual(true);
    });

    it('when generator produces the correct image, set state to done', (done) => {
        const wrapper = shallow(mountedImageComponent);
        wrapper.setProps({ generator: goalGenerator });
        // Check that the component's target is equal to `a.original`
        process.nextTick(() => {
            wrapper.update();
            expect(wrapper.state('done')).toEqual(true);
            done();
        });
    });
});