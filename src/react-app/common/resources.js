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

/**
 * @param {[name: string]: number} resources
 * @param {[name: string]: number} cost
 * @return - true if resources are sufficient; false otherwise
 */
export function canAfford(resources, cost) {
    for (const resourceName of Object.keys(cost)) {
        if (
            (resources[resourceName] == undefined ||
                cost[resourceName] > resources[resourceName]) &&
            cost[resourceName] != 0
        ) {
            return false;
        }
    }
    return true;
}
