import * as React from "react";

interface IconProps {
	width: string;
	height: string;
	verticalOffset?: string;
}

export const PinWarningIcon = (props: IconProps) => (
	<svg
		width={props.width}
		height={props.height}
		viewBox="0 0 22 29"
		transform={`translate(0.000000, ${props.verticalOffset || 0})`}
		version="1.1"
		xmlns="http://www.w3.org/2000/svg"
	>
		<title>28CFDEF7-B098-4A44-B574-78D2A373D34C</title>
		<desc>Created with sketchtool.</desc>
		<defs>
			<filter
				x="-30.1%"
				y="-24.7%"
				width="161.9%"
				height="149.3%"
				filterUnits="objectBoundingBox"
				id="filter-1"
			>
				<feOffset dx="0" dy="1" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
				<feGaussianBlur
					stdDeviation="1"
					in="shadowOffsetOuter1"
					result="shadowBlurOuter1"
				></feGaussianBlur>
				<feColorMatrix
					values="0 0 0 0 0   0 0 0 0 0.203921569   0 0 0 0 0.270588235  0 0 0 1 0"
					type="matrix"
					in="shadowBlurOuter1"
					result="shadowMatrixOuter1"
				></feColorMatrix>
				<feMerge>
					<feMergeNode in="shadowMatrixOuter1"></feMergeNode>
					<feMergeNode in="SourceGraphic"></feMergeNode>
				</feMerge>
			</filter>
		</defs>
		<g id="Journeys" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
			<g id="Journey-Overview" transform="translate(-95.000000, -110.000000)" fillRule="nonzero">
				<g id="icon_pin_warning" transform="translate(95.000000, 110.000000)">
					<ellipse
						id="Shadow"
						fill="#003445"
						opacity="0.5"
						cx="10.8090909"
						cy="26.6272727"
						rx="6.59090909"
						ry="2.37272727"
					></ellipse>
					<g id="Pin" filter="url(#filter-1)">
						<path
							d="M6.68880642,20.6909283 C2.76535371,19.0915852 0,15.2391045 0,10.7407407 C0,4.80879343 4.80879343,0 10.7407407,0 C16.6726881,0 21.4814815,4.80879343 21.4814815,10.7407407 C21.4814815,15.2391045 18.7161278,19.0915852 14.7926751,20.6909283 L11.5544742,25.2244095 C11.2334652,25.6738221 10.6089151,25.7779138 10.1595025,25.4569048 C10.069707,25.3927651 9.99114693,25.314205 9.92700727,25.2244095 L6.68880642,20.6909283 Z"
							id="BG"
							fill="#FFFFFF"
						></path>
						<g id="Warning" transform="translate(2.636364, 1.581818)">
							<path
								d="M8.5559925,1.62793589 C8.51142892,1.54641363 8.44915617,1.47821789 8.37471433,1.42941571 C8.12527193,1.26588763 7.80200689,1.35476814 7.65268166,1.62793589 L1.34410439,13.1685164 C1.29519225,13.2579937 1.26936027,13.3603254 1.26936027,13.4646102 C1.26936027,13.7829843 1.50503737,14.0410774 1.79575981,14.0410774 L14.4129143,14.0410774 C14.5081418,14.0410774 14.6015856,14.0127885 14.6832916,13.9592241 C14.932734,13.7956961 15.013895,13.4416841 14.8645698,13.1685164 L8.5559925,1.62793589 Z M9.44609234,1.19261595 L15.6935279,12.4614614 C16.1371619,13.2616685 15.8960387,14.2986976 15.1549642,14.7777305 C14.912222,14.9346398 14.6346072,15.0175084 14.3516938,15.0175084 L1.85682258,15.0175084 C0.993108169,15.0175084 0.292929293,14.2614601 0.292929293,13.3288272 C0.292929293,13.0233392 0.369674171,12.7235727 0.514988431,12.4614614 L6.76242403,1.19261595 C7.20605802,0.392408762 8.16645404,0.132045584 8.90752858,0.611078513 C9.12868967,0.754037737 9.31369733,0.953807735 9.44609234,1.19261595 Z"
								id="Triangle-2"
								fill="#003E52"
							></path>
							<path
								d="M8.5559925,1.62793589 C8.51142892,1.54641363 8.44915617,1.47821789 8.37471433,1.42941571 C8.12527193,1.26588763 7.80200689,1.35476814 7.65268166,1.62793589 L1.34410439,13.1685164 C1.29519225,13.2579937 1.26936027,13.3603254 1.26936027,13.4646102 C1.26936027,13.7829843 1.50503737,14.0410774 1.79575981,14.0410774 L14.4129143,14.0410774 C14.5081418,14.0410774 14.6015856,14.0127885 14.6832916,13.9592241 C14.932734,13.7956961 15.013895,13.4416841 14.8645698,13.1685164 L8.5559925,1.62793589 Z"
								id="Path"
								fill="#FF6D37"
							></path>
							<path
								d="M8.1043771,5.25319865 L8.1043771,5.25319865 C8.58043325,5.25319865 8.96635301,5.63911841 8.96635301,6.11517456 C8.96635301,6.15091641 8.96412995,6.18662366 8.95969672,6.22208951 L8.65314827,8.67447713 C8.61855351,8.9512352 8.38328896,9.15892256 8.1043771,9.15892256 L8.1043771,9.15892256 C7.82546524,9.15892256 7.5902007,8.9512352 7.55560594,8.67447713 L7.24905748,6.22208951 C7.19000999,5.74970953 7.52508217,5.31890244 7.99746215,5.25985494 C8.032928,5.25542171 8.06863525,5.25319865 8.1043771,5.25319865 Z"
								id="Rectangle-4"
								fill="#003E52"
							></path>
							<circle id="Oval-3" fill="#003E52" cx="8.1043771" cy="11.1117845" r="1"></circle>
						</g>
					</g>
				</g>
			</g>
		</g>
	</svg>
);