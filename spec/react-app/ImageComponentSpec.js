import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import ImageComponent from '../../src/react-app/problems/ImageComponent';
import sinon from 'sinon';
import Adapter from 'enzyme-adapter-react-16';
import ImageProblem, { Image } from '../../src/problem-engine/ImageProblem';

Enzyme.configure({ adapter: new Adapter() });
process.env.NODE_ENV = 'test';

describe('ImageComponent', () => {
    let mountedImageComponent;
    let isDone;
    let error;
    const goalGenerator = function(x, y) {
        return Math.round(y * 255);
    };
    const otherGenerator = function(x, y) {
        return Math.round(x * 255);
    };
    const invalidGenerator = function(x, y) {
        return Math.round(x * 1000);
    };
    const blankGenerator = function(x, y) {
        return 0;
    };

    beforeEach((done) => {
        isDone = false;
        error = null;
        ImageProblem.create(goalGenerator)
            .then((prob) => {
                return prob.serialize();
            })
            .then((serialized) => {
                let props = {
                    generator: blankGenerator,
                    problem: serialized,
                    reportError: (e) => {
                        error = e;
                    },
                    setDone: (done) => {
                        isDone = done;
                    }
                };
                mountedImageComponent = <ImageComponent {...props} />;
                done();
            });
    });

    it('uses generator to render new image', async () => {
        // Create image problem `a` with some generator
        const wrapper = shallow(mountedImageComponent);
        const problem = await Image.create(otherGenerator);

        expect(wrapper.state('target')).not.toEqual(problem.original);
        wrapper.setProps({ generator: otherGenerator });
        await wrapper.instance().componentDidUpdate(wrapper.props());

        expect(wrapper.state('target')).toEqual(problem.original);
        expect(isDone).toEqual(false);
        expect(error).toEqual(null);
    });

    it('sanity check when passing props', () => {
        const wrapper = shallow(mountedImageComponent);
        const spy = sinon.spy(wrapper.instance(), 'componentDidUpdate');

        expect(spy.calledOnce).toEqual(false);
        wrapper.setProps({ prop: 2 });

        expect(spy.calledOnce).toEqual(true);
    });

    it('when generator is invalid, throw an error', async () => {
        const wrapper = shallow(mountedImageComponent);

        expect(error).toEqual(null);

        wrapper.setProps({ generator: invalidGenerator });
        await wrapper.instance().componentDidUpdate(wrapper.props());

        expect(error).not.toEqual(null);
        expect(isDone).toEqual(false);
    });

    it('when generator produces the correct image, set state to done', async () => {
        const wrapper = shallow(mountedImageComponent);
        wrapper.setProps({ generator: goalGenerator });
        await wrapper.instance().componentDidUpdate(wrapper.props());

        expect(isDone).toEqual(true);
        expect(error).toEqual(null);

        wrapper.setProps({ generator: otherGenerator });
        await wrapper.instance().componentDidUpdate(wrapper.props());

        expect(isDone).toEqual(false);
        expect(error).toEqual(null);
    });
});
