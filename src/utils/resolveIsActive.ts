export const resolveIsActive = (
    value: unknown
): boolean | undefined => {

    if (value === "all") {

        return undefined;

    }

    if (value === undefined) {

        return true;

    }

    return value === "true";

};
