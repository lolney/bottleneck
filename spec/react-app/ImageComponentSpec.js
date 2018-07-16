import React from 'react';
import Enzyme, { mount, shallow } from 'enzyme';
import ImageComponent from '../../src/react-app/ImageComponent';
import sinon from 'sinon';
import Adapter from 'enzyme-adapter-react-16';
import ReactJSDOM from 'react-jsdom';
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

    it('uses generator to render new image', (done) => {
        // Create image problem `a` with some generator
        const wrapper = shallow(mountedImageComponent);
        Image.create(otherGenerator).then((problem) => {
            expect(wrapper.state('target')).not.toEqual(problem.original);
            // Pass that generator as props
            wrapper.setProps({ generator: otherGenerator });
            // Check that the component's target is equal to `a.original`
            setTimeout(() => {
                // to do this without timeout would I believe involve mocking the ImageProblem api
                // https://github.com/airbnb/enzyme/issues/964
                // wrapper.update();
                expect(wrapper.state('target')).toEqual(problem.original);
                expect(isDone).toEqual(false);
                expect(error).toEqual(null);
                done();
            }, 100);
        });
    });

    it('sanity check when passing props', () => {
        const wrapper = shallow(mountedImageComponent);
        const spy = sinon.spy(wrapper.instance(), 'componentDidUpdate');

        expect(spy.calledOnce).toEqual(false);
        wrapper.setProps({ prop: 2 });
        expect(spy.calledOnce).toEqual(true);
    });

    it('when generator is invalid, throw an error', (done) => {
        const wrapper = shallow(mountedImageComponent);
        Image.create(otherGenerator).then((problem) => {
            expect(error).toEqual(null);
            wrapper.setProps({ generator: invalidGenerator });
            setTimeout(() => {
                expect(error).not.toEqual(null);
                expect(isDone).toEqual(false);
                done();
            }, 100);
        });
    });

    it('when generator produces the correct image, set state to done', (done) => {
        const wrapper = shallow(mountedImageComponent);
        wrapper.setProps({ generator: goalGenerator });
        // Check that the component's target is equal to `a.original`
        setTimeout(() => {
            expect(isDone).toEqual(true);
            expect(error).toEqual(null);
            // Change the generator again
            wrapper.setProps({ generator: otherGenerator });
            setTimeout(() => {
                expect(isDone).toEqual(false);
                expect(error).toEqual(null);
                done();
            }, 100);
        }, 100);
    });
});
