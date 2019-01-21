import camelCaseToUnderscores from 'd2-utilizr/lib/camelCaseToUnderscores';

const accesses = {
        "--------": "private",
        "r-------": "read",
        "rw------": "read-write",
};

function difference(array1, array2) {
    return array1.filter(x => !array2.includes(x));
}

function validatePublicAccess(getTranslation, parentAttributes, attributes) {
    const key = "publicAccess";

    if (!attributes[key]) {
        return null;
    } else if (accesses[parentAttributes[key]] === "private" && accesses[attributes[key]] !== "private") {
        return getTranslation("sharing_validation_public_access_must_be_private");
    } else {
        return null;
    }
}

function validateGroupAccess(getTranslation, key, parentAttributes, attributes, prevAttributes) {
    if (!attributes[key]) {
        return null;
    } else {
        const parentIds = (parentAttributes[key] || []).map(permission => permission.id);
        const parentNames = (parentAttributes[key] || []).map(permission => permission.displayName);
        const ids = attributes[key].map(permission => permission.id);
        const prevIds = (prevAttributes[key] || []).map(permission => permission.id);
        const invalidIds = difference(ids, parentIds);
        const invalidPrevIds = difference(prevIds, parentIds);

        // The interpretation sharing might have already ids (user or groups) which are allowed,
        // so we only show an error if the change incremented the number of invalid IDs, which means
        // that the current operation added an invalid value.
        if (invalidIds.length === 0 || invalidIds.length <= invalidPrevIds.length) {
            return null;
        } else {
            const i18Key = camelCaseToUnderscores(key);
            const namespace = {
                values: parentNames.join(", ") || getTranslation(`sharing_${i18Key}_not_found`),
            };
            return getTranslation(`sharing_validation_${i18Key}_must_be_subset_of_parent`, namespace);
        }
    }
}

export function validateSharing(getTranslation, parentAttributes, attributes, prevAttributes) {
    return (
        validatePublicAccess(getTranslation, parentAttributes, attributes) ||
        validateGroupAccess(getTranslation, "userAccesses", parentAttributes, attributes, prevAttributes) ||
        validateGroupAccess(getTranslation, "userGroupAccesses", parentAttributes, attributes, prevAttributes)
    );
}

const parentTypes = [
    "eventReport",
    "eventChart",
    "chart",
    "map",
    "reportTable",
];

export const interpretationsByFavoriteAccessFields =
    parentTypes.map(type => `${type}[access[read]]`).join(',');

export function filterInterpretationsByFavoriteAccess(interpretations) {
    return interpretations.
        filter(interpretation => {
            return parentTypes.some(type =>
                interpretation[type] &&
                interpretation[type].access &&
                interpretation[type].access.read
            );
        });
}
