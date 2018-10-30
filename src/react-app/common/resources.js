export function resourceUpdateHandler(data, state) {
    let resources = { ...state.resources };
    if (data.shouldReset == true) {
        resources[data.name] = data.count;
    } else {
        let initial = resources[data.name];
        initial = initial ? initial : 0;
        resources[data.name] = initial + data.count;
    }
    return { resources: resources };
}
