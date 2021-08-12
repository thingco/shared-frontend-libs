import React from "react";
import { ViewStyle } from "react-native";
import Svg, { G, Path } from "react-native-svg";
import { View } from "./Containers";

export type IconType =
	| "info-circle"
	| "key"
	| "pencil"
	| "pin"
	| "road"
	| "lock"
	| "map"
	| "speed"
	| "tick"
	| "warn-circle"
	| "warn-triangle"
	| "warn-triangle-marker"
	| "card"
	| "car-marker"
	| "person"
	| "graph"
	| "back"
	| "clock"
	| "eye"
	| "car"
	| "refer"
	| "down-arrow"
	| "video"
	| "measure"
	| "steering-wheel"
	| "up-arrow"
	| "profile"
	| "close"
	| "forward"
	| "settings"
	| "star_full"
	| "star_empty";

/**
 * @param iconType
 * @param stroke
 * @param strokeWidth
 */
function iconSelector(
	iconType: IconType,
	stroke: string,
	strokeWidth: number
): JSX.Element {
	switch (iconType) {
		case "info-circle":
			return (
				<Svg viewBox="0 0 64 64">
					<G>
						<Path
							d="M60,32A28,28,0,1,1,32,4,28,28,0,0,1,60,32Z"
							fill="none"
							stroke={stroke}
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={strokeWidth}
						/>
						<Path
							d="M32,23.72a1,1,0,0,0-.74.27.92.92,0,0,0-.27.7V50a.9.9,0,0,0,.27.7,1,1,0,0,0,1.44,0A.93.93,0,0,0,33,50V24.69a.93.93,0,0,0-1-1Z"
							fill="none"
							stroke={stroke}
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={strokeWidth}
						/>
						<Path
							d="M32,13.34c-.68,0-1,.18-1,1.11a.9.9,0,0,0,1,1.05c.54,0,.72-.18.78-.25a1.13,1.13,0,0,0,.24-.8C33,13.52,32.67,13.34,32,13.34Z"
							fill="none"
							stroke={stroke}
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={strokeWidth}
						/>
					</G>
				</Svg>
			);
		case "key":
			return (
				<Svg viewBox="0 0 64 64">
					<G>
						<Path
							d="M25.83,34.66a13.49,13.49,0,1,1,8.83-8.83L54.9,46.08l.89,9.71-9.71-.89-2.42-2.41-.93-5.88-6.42-1v-6.1H30.66Zm-.95-13.95a4.18,4.18,0,1,0-4.17,4.17A4.18,4.18,0,0,0,24.88,20.71Z"
							fill="none"
							stroke={stroke}
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={strokeWidth}
						/>
					</G>
				</Svg>
			);
		case "pencil":
			return (
				<Svg viewBox="0 0 64 64">
					<G>
						<G>
							<Path
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={strokeWidth}
								d="M16.08 55.11 L55.03 16.15 L61.13 10.05 L54.02 2.94 L47.92 9.04 L8.97 47.99 L4 60.07 L16.08 55.11 Z"
							/>
							<Path
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={strokeWidth}
								d="M47.92 9.04 L55.03 16.15"
							/>
							<Path
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={strokeWidth}
								d="M16.08 55.11 L8.97 48"
							/>
						</G>
					</G>
				</Svg>
			);
		case "pin":
			return (
				<Svg viewBox="0 0 64 64">
					<G>
						<G>
							<Path
								d="M32,60.07c-3.2,0-22.4-17.23-22.4-34.46,0-12.92,9-21.54,22.4-21.54s22.4,8.62,22.4,21.54C54.4,42.84,35.2,60.07,32,60.07Zm0-24.26a9.34,9.34,0,1,0-9.33-9.34A9.34,9.34,0,0,0,32,35.81Z"
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={strokeWidth}
							/>
						</G>
					</G>
				</Svg>
			);
		case "road":
			return (
				<Svg viewBox="0 0 64 64">
					<G>
						<G>
							<Path
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeMiterlimit="10"
								strokeWidth={strokeWidth}
								d="M36.66 3.96 L60 60.04"
							/>
							<Path
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeMiterlimit="10"
								strokeWidth={strokeWidth}
								d="M4 60.04 L27.34 3.96"
							/>
						</G>
						<G>
							<Path
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeMiterlimit="10"
								strokeWidth={strokeWidth}
								d="M32 39.01 L32 42.52 L32 46.02 L32 49.53 L32 53.03 L32 56.54"
							/>
							<Path
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeMiterlimit="10"
								strokeWidth={strokeWidth}
								d="M32 21.48 L32 24.99 L32 28.5 L32 32"
							/>
							<Path
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeMiterlimit="10"
								strokeWidth={strokeWidth}
								d="M32 7.46 L32 10.97 L32 14.47"
							/>
						</G>
					</G>
				</Svg>
			);
		case "lock":
			return (
				<Svg viewBox="0 0 64 64">
					<G>
						<G>
							<Path
								fill="none"
								stroke={stroke}
								strokeLinejoin="round"
								strokeWidth={strokeWidth}
								d="M16.24 28.68 H47.76 V51.91 H16.24 V28.68 z"
							/>
							<Path
								fill="none"
								stroke={stroke}
								strokeWidth={strokeWidth}
								d="M34.49 37.81 A2.49 2.49 0 0 1 32 40.300000000000004 A2.49 2.49 0 0 1 29.509999999999998 37.81 A2.49 2.49 0 0 1 34.49 37.81 z"
							/>
							<Path
								d="M32,45.27v-5"
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeWidth={strokeWidth}
							/>
							<Path
								d="M42,28.68V22.57A10.22,10.22,0,0,0,32,12.09a10.22,10.22,0,0,0-9.95,10.48v6.11"
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeWidth={strokeWidth}
							/>
						</G>
					</G>
				</Svg>
			);
		case "map":
			return (
				<Svg viewBox="0 0 64 64">
					<G>
						<G>
							<Path
								d="M32,39.68c-1.88,0-13.16-10.13-13.16-20.25C18.84,11.84,24.1,6.78,32,6.78s13.16,5.06,13.16,12.65C45.16,29.55,33.88,39.68,32,39.68Zm0-14.26a5.49,5.49,0,1,0-5.48-5.48A5.48,5.48,0,0,0,32,25.42Zm-12.23,8.4-14.09,8L32,57.22,58.32,41.87,44.13,33.76"
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={strokeWidth}
							/>
						</G>
					</G>
				</Svg>
			);
		case "speed":
			return (
				<Svg viewBox="0 0 64 64">
					<G>
						<G>
							<Path
								d="M60,32A28,28,0,1,1,32,4,28,28,0,0,1,60,32Z"
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={strokeWidth}
							/>
							<Path
								d="M50.85,41.26A21,21,0,0,1,34.32,52.87,19.68,19.68,0,0,1,32,53M11,32a21,21,0,0,1,42,0"
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={strokeWidth}
							/>
						</G>
						<G>
							<Path
								d="M35.8,32A3.8,3.8,0,1,1,32,28.2,3.8,3.8,0,0,1,35.8,32Z"
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={strokeWidth}
							/>
							<Path
								d="M32,19.27V28.2"
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={strokeWidth}
							/>
						</G>
					</G>
				</Svg>
			);
		case "tick":
			return (
				<Svg viewBox="0 0 64 64">
					<G>
						<Path
							fill="none"
							stroke={stroke}
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={strokeWidth}
							d="M55.39 16.61 L20.06 51.94 L4.45 36.33"
						/>
					</G>
				</Svg>
			);
		case "warn-circle":
			return (
				<Svg viewBox="0 0 64 64">
					<G>
						<Path
							d="M60,32A28,28,0,1,1,32,4,28,28,0,0,1,60,32Z"
							fill="none"
							stroke={stroke}
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={strokeWidth}
						/>
						<Path
							d="M32,50c-.72,0-1,.28-1,1s.26,1,1,1,1-.27,1-1S32.71,50,32,50Z"
							fill="none"
							stroke={stroke}
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={strokeWidth}
						/>
						<Path
							fill="none"
							stroke={stroke}
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={strokeWidth}
							d="M32.01 42.57 L33 12 L31 12 L32.01 42.57 Z"
						/>
					</G>
				</Svg>
			);
		case "warn-triangle":
			return (
				<Svg viewBox="0 0 64 64">
					<G>
						<Path
							d="M29.63,9a2,2,0,0,1,3.46,0L45.36,30.23,57.63,51.48a2,2,0,0,1-1.74,3H6.82a2,2,0,0,1-1.73-3L17.36,30.23Z"
							fill="none"
							stroke={stroke}
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={strokeWidth}
						/>
						<Path
							d="M31.36,45.74c-.54,0-.74.2-.74.76s.2.73.74.73.74-.2.74-.73S31.9,45.74,31.36,45.74Z"
							fill="none"
							stroke={stroke}
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={strokeWidth}
						/>
						<Path
							fill="none"
							stroke={stroke}
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={strokeWidth}
							d="M31.37 40.23 L32.11 20.23 L30.61 20.23 L31.37 40.23 Z"
						/>
					</G>
				</Svg>
			);
		case "warn-triangle-marker":
			return (
				<Svg viewBox="0 0 64 64">
					<G>
						<Path
							d="M30.24,15.63a1.29,1.29,0,0,1,2.24,0l7.91,13.71,7.92,13.71A1.29,1.29,0,0,1,47.19,45H15.53a1.29,1.29,0,0,1-1.12-1.93l7.92-13.71Z"
							fill="none"
							stroke={stroke}
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={strokeWidth}
						/>
						<G>
							<Path
								d="M31.36,39.34c-.35,0-.48.13-.48.49s.13.48.48.48.47-.13.47-.48S31.71,39.34,31.36,39.34Z"
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={strokeWidth}
							/>
							<Path
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={strokeWidth}
								d="M31.37 35.79 L31.84 22.88 L30.88 22.88 L31.37 35.79 Z"
							/>
						</G>
						<Path
							d="M60,32A28,28,0,1,1,32,4,28,28,0,0,1,60,32Z"
							fill="none"
							stroke={stroke}
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={strokeWidth}
						/>
					</G>
				</Svg>
			);
		case "card":
			return (
				<Svg viewBox="0 0 64 64">
					<G>
						<G>
							<Path
								fill="none"
								stroke={stroke}
								strokeWidth={strokeWidth}
								d="M7.789999999999999 12 H56.2 A2.11 2.11 0 0 1 58.31 14.11 V49.89 A2.11 2.11 0 0 1 56.2 52 H7.789999999999999 A2.11 2.11 0 0 1 5.68 49.89 V14.11 A2.11 2.11 0 0 1 7.789999999999999 12 z"
							/>
							<Path
								fill="none"
								stroke={stroke}
								strokeWidth={strokeWidth}
								d="M5.68 20.42 H58.31 V26.740000000000002 H5.68 V20.42 z"
							/>
							<Path
								d="M12,37.26H26.74"
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeWidth={strokeWidth}
							/>
							<Path
								d="M13.05,44.63H34.11"
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeWidth={strokeWidth}
							/>
							<Path
								fill="none"
								stroke={stroke}
								strokeWidth={strokeWidth}
								d="M53.050000000000004 40.42 A4.21 4.21 0 0 1 48.84 44.63 A4.21 4.21 0 0 1 44.63 40.42 A4.21 4.21 0 0 1 53.050000000000004 40.42 z"
							/>
						</G>
					</G>
				</Svg>
			);
		case "car-marker":
			return (
				<Svg viewBox="0 0 64 64">
					<G>
						<G>
							<Path
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={strokeWidth}
								d="M18.36 29.27 L21.09 21.09 L42.91 21.09 L45.64 29.27 L18.36 29.27 Z"
							/>
							<Path
								d="M49.73,45.64v-14a6.79,6.79,0,0,0-.29-2L46.22,18.94A2.73,2.73,0,0,0,43.61,17H20.39a2.73,2.73,0,0,0-2.61,1.94L14.56,29.68a6.79,6.79,0,0,0-.29,2v14A1.36,1.36,0,0,0,15.64,47h2.72a1.36,1.36,0,0,0,1.37-1.36V42.91H44.27v2.73A1.36,1.36,0,0,0,45.64,47h2.72A1.36,1.36,0,0,0,49.73,45.64Z"
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={strokeWidth}
							/>
							<Path
								d="M40.18,36.09a2.73,2.73,0,1,1,2.73,2.73A2.73,2.73,0,0,1,40.18,36.09Z"
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={strokeWidth}
							/>
							<Path
								d="M18.36,36.09a2.73,2.73,0,1,1,2.73,2.73A2.73,2.73,0,0,1,18.36,36.09Z"
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={strokeWidth}
							/>
						</G>
						<Path
							d="M60,32A28,28,0,1,1,32,4,28,28,0,0,1,60,32Z"
							fill="none"
							stroke={stroke}
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={strokeWidth}
						/>
					</G>
				</Svg>
			);
		case "person":
			return (
				<Svg viewBox="0 0 64 64">
					<G>
						<G>
							<Path
								d="M51.73,51.73C48.81,44.41,40.36,40.17,32,40.17S15.13,44.51,12.2,51.8Z"
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={strokeWidth}
							/>
							<Path
								d="M40.17,25A8.17,8.17,0,1,1,32,16.83,8.16,8.16,0,0,1,40.17,25Z"
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={strokeWidth}
							/>
						</G>
					</G>
				</Svg>
			);
		case "graph":
			return (
				<Svg viewBox="0 0 64 64">
					<G>
						<G>
							<Path
								strokeWidth={strokeWidth}
								stroke={stroke}
								strokeLinecap="round"
								strokeLinejoin="round"
								fill="none"
								d="M4 4.07 H60 V60.07 H4 V4.07 z"
							/>
							<Path
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={strokeWidth}
								d="M12 34.07 L12 52.07"
							/>
							<Path
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={strokeWidth}
								d="M25.33 12.07 L25.33 52.07"
							/>
							<Path
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={strokeWidth}
								d="M38.67 25.41 L38.67 52.07"
							/>
							<Path
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={strokeWidth}
								d="M52 18.07 L52 52.07"
							/>
						</G>
					</G>
				</Svg>
			);
		case "back":
			return (
				<Svg viewBox="0 0 64 64">
					<G>
						<Path
							fill="none"
							stroke={stroke}
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={strokeWidth}
							d="M36 12 L16 32 L36 52"
						/>
					</G>
				</Svg>
			);
		case "clock":
			return (
				<Svg viewBox="0 0 64 64">
					<G>
						<G>
							<Path
								d="M60,32A28,28,0,1,1,32,4,28,28,0,0,1,60,32Z"
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={strokeWidth}
							/>
							<Path
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={strokeWidth}
								d="M32 12 L32 32 L41.94 41.86"
							/>
						</G>
					</G>
				</Svg>
			);
		case "eye":
			return (
				<Svg viewBox="0 0 64 64">
					<G>
						<Path
							d="M4,32s8.41-20,28-20S60,32,60,32,51.59,52,32,52,4,32,4,32Z"
							fill="none"
							stroke={stroke}
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={strokeWidth}
						/>
						<Path
							fill="none"
							stroke={stroke}
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={strokeWidth}
							d="M44.92 32 A12.92 12.92 0 0 1 32 44.92 A12.92 12.92 0 0 1 19.08 32 A12.92 12.92 0 0 1 44.92 32 z"
						/>
					</G>
				</Svg>
			);
		case "car":
			return (
				<Svg viewBox="0 0 64 64">
					<G>
						<G>
							<Path
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={strokeWidth}
								d="M10.46 27.69 L14.77 14.77 L49.23 14.77 L53.54 27.69 L10.46 27.69 Z"
							/>
							<Path
								d="M60,53.54V31.43a10.86,10.86,0,0,0-.45-3.1L54.46,11.38a4.31,4.31,0,0,0-4.13-3.07H13.67a4.31,4.31,0,0,0-4.13,3.07L4.45,28.33A10.86,10.86,0,0,0,4,31.43V53.54a2.15,2.15,0,0,0,2.15,2.15h4.31a2.16,2.16,0,0,0,2.16-2.15V49.23H51.38v4.31a2.16,2.16,0,0,0,2.16,2.15h4.31A2.15,2.15,0,0,0,60,53.54Z"
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={strokeWidth}
							/>
							<Path
								d="M44.92,38.46a4.31,4.31,0,1,1,4.31,4.31A4.31,4.31,0,0,1,44.92,38.46Z"
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={strokeWidth}
							/>
							<Path
								d="M10.46,38.46a4.31,4.31,0,1,1,4.31,4.31A4.31,4.31,0,0,1,10.46,38.46Z"
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={strokeWidth}
							/>
						</G>
					</G>
				</Svg>
			);
		case "refer":
			return (
				<Svg viewBox="0 0 64 64">
					<G>
						<G>
							<Path
								d="M7.92,55.94A18.38,18.38,0,0,1,42.17,56C42.23,56.14,7.87,56.08,7.92,55.94Z"
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={strokeWidth}
							/>
							<Path
								d="M33.46,30.31A8.26,8.26,0,1,1,25.2,22,8.29,8.29,0,0,1,33.46,30.31Z"
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={strokeWidth}
							/>
							<Path
								d="M47.52,7.92V25.21"
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={strokeWidth}
							/>
							<Path
								d="M39,16.57H56.08"
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={strokeWidth}
							/>
						</G>
					</G>
				</Svg>
			);
		case "down-arrow":
			return (
				<Svg viewBox="0 0 64 64">
					<G>
						<G>
							<G>
								<Path
									d="M39.66,33.9h7.86L32,52,16.48,33.9h7.86V12H39.66Z"
									fill="none"
									stroke={stroke}
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={strokeWidth}
								/>
							</G>
						</G>
					</G>
				</Svg>
			);
		case "video":
			return (
				<Svg viewBox="0 0 64 64">
					<G>
						<G>
							<Path
								d="M7.92,17.56H41V46.44h-33Z"
								fill="none"
								stroke={stroke}
								strokeLinejoin="round"
								strokeWidth={strokeWidth}
							/>
							<Path
								d="M47.32,26.42l8.74-4.26V41.84l-8.74-4.26Z"
								fill="none"
								stroke={stroke}
								strokeLinejoin="round"
								strokeWidth={strokeWidth}
							/>
						</G>
					</G>
				</Svg>
			);
		case "measure":
			return (
				<Svg viewBox="0 0 64 64">
					<G>
						<G>
							<Path
								strokeWidth={strokeWidth}
								transform="translate(-13.25 32) rotate(-45)"
								stroke={stroke}
								strokeLinecap="round"
								strokeLinejoin="round"
								fill="none"
								d="M25.61 3.23 H38.4 V60.76 H25.61 V3.23 z"
							/>
							<Path
								d="M21.51,19.89l3-3"
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeWidth={strokeWidth}
							/>
							<Path
								d="M17,15.37l3-3"
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeWidth={strokeWidth}
							/>
							<Path
								d="M26,24.41l3-3"
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeWidth={strokeWidth}
							/>
							<Path
								d="M30.55,28.93l3-3"
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeWidth={strokeWidth}
							/>
							<Path
								d="M35.07,33.45l3-3"
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeWidth={strokeWidth}
							/>
							<Path
								d="M39.59,38l3-3"
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeWidth={strokeWidth}
							/>
							<Path
								d="M44.11,42.49l3-3"
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeWidth={strokeWidth}
							/>
							<Path
								d="M48.63,47l3-3"
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeWidth={strokeWidth}
							/>
						</G>
					</G>
				</Svg>
			);
		case "steering-wheel":
			return (
				<Svg viewBox="0 0 64 64">
					<G>
						<Path
							fill="none"
							stroke={stroke}
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={strokeWidth}
							d="M60 32 A28 28 0 0 1 32 60 A28 28 0 0 1 4 32 A28 28 0 0 1 60 32 z"
						/>
						<Path
							d="M29,23.53V9.2A23,23,0,0,0,9.2,29H23.53A9,9,0,0,1,29,23.53Z"
							fill="none"
							stroke={stroke}
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={strokeWidth}
						/>
						<Path
							d="M40.47,29H54.8A23,23,0,0,0,35,9.2V23.52A9,9,0,0,1,40.47,29Z"
							fill="none"
							stroke={stroke}
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={strokeWidth}
						/>
						<Path
							d="M32,41a9,9,0,0,1-8.48-6H9.2a23,23,0,0,0,45.6,0H40.48A9,9,0,0,1,32,41Z"
							fill="none"
							stroke={stroke}
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={strokeWidth}
						/>
					</G>
				</Svg>
			);
		case "up-arrow":
			return (
				<Svg viewBox="0 0 64 64">
					<G>
						<G>
							<G>
								<Path
									d="M24.34,30.1H16.48L32,12,47.52,30.1H39.66V52H24.34Z"
									fill="none"
									stroke={stroke}
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={strokeWidth}
								/>
							</G>
						</G>
					</G>
				</Svg>
			);
		case "profile":
			return (
				<Svg viewBox="0 0 64 64">
					<G>
						<G>
							<Path
								d="M60,32A28,28,0,1,1,32,4,28,28,0,0,1,60,32Z"
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={strokeWidth}
							/>
							<Path
								d="M12.2,51.8C15.13,44.51,23.66,40.17,32,40.17s16.81,4.24,19.73,11.56"
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={strokeWidth}
							/>
							<Path
								d="M40.17,25A8.17,8.17,0,1,1,32,16.83,8.16,8.16,0,0,1,40.17,25Z"
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={strokeWidth}
							/>
						</G>
					</G>
				</Svg>
			);
		case "close":
			return (
				<Svg viewBox="0 0 64 64">
					<G>
						<G>
							<Path
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={strokeWidth}
								d="M12 52 L52 12"
							/>
							<Path
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={strokeWidth}
								d="M12 12 L52 52"
							/>
						</G>
					</G>
				</Svg>
			);
		case "forward":
			return (
				<Svg viewBox="0 0 64 64">
					<Path
						fill="none"
						stroke={stroke}
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={strokeWidth}
						d="M28 12 L48 32 L28 52"
					/>
				</Svg>
			);
		case "settings":
			return (
				<Svg viewBox="0 0 64 64">
					<Path
						fill="none"
						stroke={stroke}
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={strokeWidth}
						d="M4.57 4.57h4.575v9.145H4.57zm0 0M29.715 4.57h4.57V32h-4.57zm0 0M54.855 4.57h4.575v18.285h-4.575zm0 0M64 27.43H50.285V32h4.57v27.43h4.575V32H64zm0 0M25.145 41.145h4.57V59.43h4.57V41.145h4.57V36.57h-13.71zm0 0M0 22.855h4.57V59.43h4.575V22.855h4.57v-4.57H0zm0 0"
					/>
				</Svg>
			);
		case "star_full":
			return (
				<Svg viewBox="0 0 64 64">
					<Path
						fill={stroke}
						stroke={stroke}
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={strokeWidth}
						d="M30.62,8.75c-.37.54-2.09,3.88-3.88,7.48l-3.26,6.56-5.23.71C6.85,25.13,7.14,25,7,26.38c-.12,1.09.55,1.92,5.56,6.94L18.25,39l-1.33,7.77a64.59,64.59,0,0,0-1.09,8.48c.58,1.51,1.71,1.22,8.94-2.55L32,49l7.23,3.71c7.23,3.77,8.36,4.06,8.94,2.55a64.59,64.59,0,0,0-1.09-8.48L45.75,39l5.68-5.68c5-5,5.68-5.85,5.56-6.94-.13-1.34.16-1.25-11.24-2.88l-5.23-.71-3.76-7.4C33.84,9.58,32.84,8,32.13,7.91A1.51,1.51,0,0,0,30.62,8.75Z"
					/>
				</Svg>
			);
		case "star_empty":
			return (
				<Svg viewBox="0 0 64 64">
					<Path
						fill="none"
						stroke={stroke}
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={strokeWidth}
						d="M30.62,8.75c-.37.54-2.09,3.88-3.88,7.48l-3.26,6.56-5.23.71C6.85,25.13,7.14,25,7,26.38c-.12,1.09.55,1.92,5.56,6.94L18.25,39l-1.33,7.77a64.59,64.59,0,0,0-1.09,8.48c.58,1.51,1.71,1.22,8.94-2.55L32,49l7.23,3.71c7.23,3.77,8.36,4.06,8.94,2.55a64.59,64.59,0,0,0-1.09-8.48L45.75,39l5.68-5.68c5-5,5.68-5.85,5.56-6.94-.13-1.34.16-1.25-11.24-2.88l-5.23-.71-3.76-7.4C33.84,9.58,32.84,8,32.13,7.91A1.51,1.51,0,0,0,30.62,8.75Z"
					/>
				</Svg>
			);
		default:
			throw new Error(`Unknown icon type of ${iconType}`);
	}
}

interface LineIconProps {
	iconType: IconType;
	size: number | string;
	stroke: string;
	strokeWidth?: number;
	style?: ViewStyle;
}

export const LineIcon = ({
	iconType,
	size,
	stroke,
	strokeWidth = 2,
	style = {},
}: LineIconProps): JSX.Element => (
	<View style={{ height: size, width: size, ...style }}>
		{iconSelector(iconType as IconType, stroke, strokeWidth)}
	</View>
);
