import { styled } from "../config";

const StyledPlaceholderBlock = styled("div", {
	backgroundColor: "$dark",
});

export const PlaceholderBlock = ({
	height,
	width,
}: {
	height: string | number;
	width: string | number;
}): JSX.Element => <StyledPlaceholderBlock css={{ height, width }} />;
