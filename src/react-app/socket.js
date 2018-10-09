this.state = {
    resources: {
        wood: 0,
        stone: 0
    }
};

function onResourceUpdate() {
    this.props.socket.on('resourceUpdate', (data) => {
        let resources = { ...this.state.resources };
        if (data.shouldReset == true) {
            resources[data.name] = data.count;
        } else {
            resources[data.name] = resources[data.name] + data.count;
        }
        return { resources: resources };
    });
}
