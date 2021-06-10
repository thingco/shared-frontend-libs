import {
	AppDashboard,
	AppScreen,
	Button,
	Caption,
	Card,
	CardStack,
	Checkbox,
	DesignTool,
	LineIcon,
	PasswordInput,
	PlaceholderBlock,
	Text,
	TextInput,
	TextInputGroup,
	Title,
} from "@thingco/component-lib-v2";

export const App = (): JSX.Element => (
	<AppScreen>
		<DesignTool />
		<AppDashboard>
			<Card columns={4}>
				<Card.Header>
					<Title>Typography</Title>
				</Card.Header>
				<Card.Body>
					<Title size="large">
						<LineIcon icontype="InformationCircle" sizing="inline" title="Just an example" />
						Title
					</Title>
					<Title>
						<LineIcon icontype="WarningTriangle" sizing="inline" title="Just an example" /> Default
						title with an inline icon
					</Title>
					<Text size="large">Some large text, maybe a quote or something.</Text>
					<Caption>
						Caption: Sit est adipisicing Lorem laboris dolor officia eu Lorem officia ad adipisicing
						cillum sit.
					</Caption>
					<Title css={{}} size="body">
						Body title
					</Title>
					<Text>
						Body text: Nostrud velit sit eu exercitation sint sunt. Exercitation sint proident sit
						eu enim sint mollit voluptate. Cillum exercitation anim Lorem ut deserunt duis ut
						adipisicing occaecat sint.
					</Text>
					<Text size="small">
						Small body text: Qui cillum aliquip cupidatat id pariatur consequat reprehenderit ipsum
						fugiat est. Officia fugiat consequat nisi id est velit ea. Deserunt proident aliquip
						mollit mollit exercitation. Culpa reprehenderit aute nulla adipisicing excepteur commodo
						irure ipsum.
					</Text>
					<Text>
						Body text: Nostrud velit sit eu exercitation sint sunt. Exercitation sint proident sit
						eu enim sint mollit voluptate. Cillum exercitation anim Lorem ut deserunt duis ut
						adipisicing occaecat sint.
					</Text>
					<Caption size="small">SMALL CAPTION</Caption>
				</Card.Body>
				<Card.Footer>
					<Text>Some footer text.</Text>
				</Card.Footer>
			</Card>
			<CardStack columns={2}>
				<Card orientation="horizontal">
					<PlaceholderBlock height="auto" width="6rem" />
					<Card.Body>
						<Caption>07/06/2021 at 12:15</Caption>
						<Text>Somewhere to Lower Elsewhere</Text>
						<Caption>10.3Km 00:18</Caption>
					</Card.Body>
				</Card>
				<Card orientation="horizontal">
					<PlaceholderBlock height="auto" width="6rem" />
					<Card.Body>
						<Caption>07/06/2021 at 12:15</Caption>
						<Text>Somewhere to Lower Elsewhere</Text>
						<Caption>10.3Km 00:18</Caption>
					</Card.Body>
				</Card>
				<Card orientation="horizontal">
					<PlaceholderBlock height="auto" width="6rem" />
					<Card.Body>
						<Caption>07/06/2021 at 12:15</Caption>
						<Text>Somewhere to Lower Elsewhere</Text>
						<Caption>10.3Km 00:18</Caption>
					</Card.Body>
				</Card>
				<Card orientation="horizontal">
					<PlaceholderBlock height="auto" width="6rem" />
					<Card.Body>
						<Caption>07/06/2021 at 12:15</Caption>
						<Text>Somewhere to Lower Elsewhere</Text>
						<Caption>10.3Km 00:18</Caption>
					</Card.Body>
				</Card>
				<Card orientation="horizontal">
					<PlaceholderBlock height="auto" width="6rem" />
					<Card.Body>
						<Caption>07/06/2021 at 12:15</Caption>
						<Text>Somewhere to Lower Elsewhere</Text>
						<Caption>10.3Km 00:18</Caption>
					</Card.Body>
				</Card>
			</CardStack>
			<Card columns={2}>
				<Card.Header>
					<Title>Buttons</Title>
				</Card.Header>
				<Card.Body layout="flexWrap">
					<Button>Secondary</Button>
					<Button buttonRole="primary" appearance="filled">
						Primary
					</Button>
					<Button appearance="filled" buttonRole="cta" rounded="both">
						Call to action
					</Button>
					<Button appearance="filled" rounded="left">
						On the left...
					</Button>
					<Button rounded="right" buttonRole="primary">
						&amp; on the Right...
					</Button>
				</Card.Body>
			</Card>
			<Card columns={2}>
				<Card.Header>
					<Title>Inputs</Title>
				</Card.Header>
				<Card.Body>
					<CardStack>
						<TextInput type="text" placeholder="I'm a placeholder" />
						<TextInput type="text" placeholder="I've been disabled" disabled />
						<TextInputGroup
							label="I'm a text input group"
							type="text"
							placeholder="type some text..."
						/>
						<PasswordInput />
					</CardStack>
				</Card.Body>
			</Card>
			<Card columns={2}>
				<Card.Header>
					<Title>Checkboxes and toggles</Title>
				</Card.Header>
				<Card.Body>
					<Checkbox />
					<Checkbox boxSize="medium" />
					<Checkbox boxSize="large" />
				</Card.Body>
			</Card>
		</AppDashboard>
	</AppScreen>
);
