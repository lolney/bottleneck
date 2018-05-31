import React from "react";
import Enzyme, { mount, shallow } from "enzyme";
import ImageComponent from "../../src/react-app/ImageComponent";
import sinon from 'sinon';
import Adapter from 'enzyme-adapter-react-16';
import ReactJSDOM from 'react-jsdom';
import ImageProblem from '../../src/problem-engine/ImageProblem';

Enzyme.configure({ adapter: new Adapter() });

describe('ImageComponent', () => {

    let mountedImageComponent;
    const imageComponent = (props) => {
        if (!mountedImageComponent) {
            mountedImageComponent = ReactJSDOM.render(
                <ImageComponent {...props} />
            );
        }
        return mountedImageComponent;
    }

    beforeEach((done) => {
        ImageProblem.create(function (x, y) { return y })
            .then((prob) => {
                return prob.serialize();
            })
            .then((serialized) => {
                let props = {
                    generator: (x, y) => { return y },
                    problem: serialized
                };
                mountedImageComponent = imageComponent(props);
                done();
            });
    });

    it('use generator to render new image', () => {
        const spy = sinon.spy(ImageComponent, "getDerivedStateFromProps");
        const wrapper = shallow(mountedImageComponent);

        expect(spy.calledOnce).to.equal(false);
        wrapper.setProps({ prop: 2 });
        expect(spy.calledOnce).to.equal(true);

    });

    it('when generator produces the correct image, set state to done', () => {

    });
});