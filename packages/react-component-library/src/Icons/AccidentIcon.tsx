import * as React from "react";

export const AccidentIcon = () => (
	<svg xmlns="http://www.w3.org/2000/svg" width="44" height="58" viewBox="0 0 22 29">
		<defs>
			<filter
				id="filter-1"
				width="161.9%"
				height="149.3%"
				x="-30.1%"
				y="-24.7%"
				filterUnits="objectBoundingBox"
			>
				<feOffset dy="1" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
				<feGaussianBlur
					in="shadowOffsetOuter1"
					result="shadowBlurOuter1"
					stdDeviation="1"
				></feGaussianBlur>
				<feColorMatrix
					in="shadowBlurOuter1"
					result="shadowMatrixOuter1"
					values="0 0 0 0 0 0 0 0 0 0.203921569 0 0 0 0 0.270588235 0 0 0 1 0"
				></feColorMatrix>
				<feMerge>
					<feMergeNode in="shadowMatrixOuter1"></feMergeNode>
					<feMergeNode in="SourceGraphic"></feMergeNode>
				</feMerge>
			</filter>
		</defs>
		<g fill="none" fillRule="evenodd" stroke="none" strokeWidth="1">
			<g fillRule="nonzero" transform="translate(-95 -110)">
				<g transform="translate(95 110)">
					<ellipse
						cx="10.809"
						cy="26.627"
						fill="#003445"
						opacity="0.5"
						rx="6.591"
						ry="2.373"
					></ellipse>
					<g filter="url(#filter-1)">
						<path
							fill="#FFF"
							d="M6.689 20.69A10.744 10.744 0 010 10.74C0 4.81 4.809 0 10.74 0c5.933 0 10.741 4.809 10.741 10.74 0 4.5-2.765 8.352-6.688 9.95l-3.239 4.534a1 1 0 01-1.627 0l-3.238-4.533z"
						></path>
						<g transform="translate(2.636 1.582)">
							<path
								fill="#003E52"
								d="M8.556 1.628a.554.554 0 00-.181-.199c-.25-.163-.573-.074-.722.199l-6.309 11.54a.619.619 0 00-.075.297c0 .318.236.576.527.576h12.617a.492.492 0 00.27-.082c.25-.163.33-.517.182-.79L8.556 1.628zm.89-.435l6.248 11.268c.443.8.202 1.838-.539 2.317-.243.157-.52.24-.803.24H1.857c-.864 0-1.564-.757-1.564-1.69 0-.305.077-.604.222-.867L6.762 1.193C7.206.393 8.166.132 8.908.61c.22.143.406.343.538.582z"
							></path>
							<path
								fill="#FF6D37"
								d="M8.556 1.628a.554.554 0 00-.181-.199c-.25-.163-.573-.074-.722.199l-6.309 11.54a.619.619 0 00-.075.297c0 .318.236.576.527.576h12.617a.492.492 0 00.27-.082c.25-.163.33-.517.182-.79L8.556 1.628z"
							></path>
							<path
								fill="#003E52"
								d="M8.104 5.253a.862.862 0 01.856.97l-.307 2.451a.553.553 0 01-1.098 0L7.25 6.222a.862.862 0 01.855-.969z"
							></path>
							<circle cx="8.104" cy="11.112" r="1" fill="#003E52"></circle>
						</g>
					</g>
				</g>
			</g>
		</g>
	</svg>
);
