export const firstValues = (fields, exceptions) => {
    return Object.fromEntries(
        Object.entries(fields).map(([key, value]) => {
            if (exceptions?.includes(key)) {
                return [key, value]
            }
            return [key, value[0]]
        })
    )
}
