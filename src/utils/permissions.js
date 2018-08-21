const accesses = {
        "--------": "private",
        "r-------": "read",
        "rw------": "read-write",
};

function isSubset(array1, array2) {
    return array1.every(x => array2.includes(x));
}

function validatePublicAccess(parentAttributes, attributes) {
    const key = "publicAccess";

    if (!attributes[key]) {
        return true;
    } else {
        return !(
            accesses[parentAttributes[key]] === "private" &&
            accesses[attributes[key]] !== "private"
        );
    }
}

function validateGroupAccess(key, parentAttributes, attributes) {
    if (!attributes[key]) {
        return true;
    } else {
        const parentIds = (parentAttributes[key] || []).map(permission => permission.id);
        const ids = attributes[key].map(permission => permission.id);
        return isSubset(ids, parentIds);
    }
}

export function validateSharing(parentAttributes, attributes) {
    return (
        validatePublicAccess(parentAttributes, attributes) &&
        validateGroupAccess("userAccesses", parentAttributes, attributes) &&
        validateGroupAccess("userGroupAccesses", parentAttributes, attributes)
    );
}
