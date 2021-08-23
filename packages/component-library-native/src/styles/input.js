export const inputStyles = (colours, fontSize) => ({
    primary: {
        backgroundColor: colours.accent,
        borderWidth: 0,
        borderRadius: 2,
        paddingHorizontal: 15,
        paddingVertical: 15,
        color: colours.greyscale50,
        ...fontSize.large,
    },
    secondary: {
        borderWidth: 0,
        borderBottomWidth: 1,
        borderBottomColor: colours.greyscale50,
        borderRadius: 2,
        paddingHorizontal: 5,
        paddingTop: 10,
        paddingBottom: 5,
        color: colours.greyscale50,
        ...fontSize.base,
    },
    focused: {
        backgroundColor: colours.secondary,
    },
    cell: {
        height: 40,
        width: 40,
        marginHorizontal: 5,
        justifyContent: "center",
        alignItems: "center",
    },
    cellText: {
        lineHeight: 32,
        fontSize: 28,
        fontWeight: "500",
        color: colours.greyscale50,
        textAlign: "center",
        textAlignVertical: "center",
        backgroundColor: "transparent",
    },
    box: {
        backgroundColor: colours.accent,
    },
    underline: {
        borderLeftWidth: 0,
        borderRightWidth: 0,
        borderTopWidth: 0,
        borderBottomWidth: 2,
    },
    number: {
        fontWeight: "800",
    },
    light: {
        color: colours.greyscale50,
    },
    dark: {
        color: colours.greyscale900,
        borderBottomColor: colours.greyscale900,
    },
});
//# sourceMappingURL=input.js.map