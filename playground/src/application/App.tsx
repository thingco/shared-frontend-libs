import { Caption, DesignTool, Text, Title } from "@thingco/component-lib-v2";

export const App = (): JSX.Element => (
	<>
		<DesignTool />
		<div>
			<Title size="large">Title</Title>
			<Text size="large">Some large text, maybe a quote or something.</Text>
			<Caption>
				Caption: Sit est adipisicing Lorem laboris dolor officia eu Lorem officia ad adipisicing
				cillum sit.
			</Caption>
			<Title size="body">Body title</Title>
			<Text>
				Body text: Nostrud velit sit eu exercitation sint sunt. Exercitation sint proident sit eu
				enim sint mollit voluptate. Cillum exercitation anim Lorem ut deserunt duis ut adipisicing
				occaecat sint.
			</Text>
			<Text size="small">
				Small body text: Qui cillum aliquip cupidatat id pariatur consequat reprehenderit ipsum
				fugiat est. Officia fugiat consequat nisi id est velit ea. Deserunt proident aliquip mollit
				mollit exercitation. Culpa reprehenderit aute nulla adipisicing excepteur commodo irure
				ipsum.
			</Text>
			<Text>
				Body text: Nostrud velit sit eu exercitation sint sunt. Exercitation sint proident sit eu
				enim sint mollit voluptate. Cillum exercitation anim Lorem ut deserunt duis ut adipisicing
				occaecat sint.
			</Text>
			<Caption size="small">SMALL CAPTION</Caption>
		</div>
	</>
);
