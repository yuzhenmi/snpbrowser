function Sort() {
}

Sort.compareNodeByDistance = function(a, b) {
    if (a.distance < b.distance) return -1;
    if (a.distance > b.distance) return 1;
    return 0;
};

Sort.compareNodeByName = function(a, b) {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
};

Sort.compareIsolateByName = function(a, b) {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
};

Sort.compareIsolateByCustomAttribute = function(a, b, customAttribute) {
    if (!a.customAttributes[customAttribute] && b.customAttributes[customAttribute]) {
        return -1;
    }
    if (a.customAttributes[customAttribute] && !b.customAttributes[customAttribute]) {
        return 1;
    }
    if (!a.customAttributes[customAttribute] && !b.customAttributes[customAttribute]) {
        return 0;
    }
    if (a.customAttributes[customAttribute] < b.customAttributes[customAttribute]) {
        return -1;
    }
    if (a.customAttributes[customAttribute] > b.customAttributes[customAttribute]) {
        return 1;
    }
    return 0;
}