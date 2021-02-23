!function(i,n){"object"==typeof exports&&"undefined"!=typeof module?n(exports):"function"==typeof define&&define.amd?define(["exports"],n):n((i||self).graphviz={})}(this,function(i){function n(i,n,t){return i/(t-n)}function t(i,n,t){return(t-n)*i}function e(i){var n=i.xAxisMin,t=i.xAxisMax,e=i.xAxisStep,r=[];if(n>0){for(var x=n;x<=t;x+=e)r.push(x);return r}r.push(0);for(var s=0-e;s>=n;s-=e)r.unshift(s);for(var o=0+e;o<=t;o+=e)r.push(o);return r}function r(i){var n=i.yAxisMin,t=i.yAxisMax,e=i.yAxisStep,r=[];if(n>0){for(var x=n;x<=t;x+=e)r.push(x);return r}r.push(0);for(var s=0-e;s>=n;s-=e)r.unshift(s);for(var o=0+e;o<=t;o+=e)r.push(o);return r}function x(i,n){return(n-i.xAxisMin)*i.xAxisScale}var s=x;function o(i,n){return i.yAxisSize-(n-i.yAxisMin)*i.yAxisScale}var u=o;function a(i,n){return{x1:s(i,n),x2:s(i,n),y1:0,y2:i.yAxisSize}}function A(i,n){return{x1:0,x2:i.xAxisSize,y1:u(i,n),y2:u(i,n)}}i.calculateScale=n,i.calculateSize=t,i.createGraph=function(i){var e,r,x=i.xAxisMax,s=i.xAxisMin,o=void 0===s?0:s,u=i.xAxisSize,a=i.xAxisScale,A=i.xAxisStep,f=void 0===A?1:A,l=i.xAxisValues,c=i.yAxisMax,p=i.yAxisMin,y=void 0===p?0:p,h=i.yAxisSize,d=i.yAxisScale,v=i.yAxisStep,M=void 0===v?1:v,S=i.yAxisValues;if(!l&&!S)throw new Error("ONE OR BOTH x- or y-axis value arrays MUST be provided to create the graph.");if(S&&!l?l=Array.from({length:S.length},function(i,n){return n+o}):l&&!S&&(S=Array.from({length:l.length},function(i,n){return n+y})),x=null!=(e=x)?e:Math.max.apply(Math,l),c=null!=(r=c)?r:Math.max.apply(Math,S),!u&&!a||u&&a)throw new Error("EITHER the x-axis size OR the x-axis scale must be provided up-front or this graph axis cannot be plotted.");if(u&&!a?a=n(u,o,x):!u&&a&&(u=t(a,o,x)),!h&&!d||h&&d)throw new Error("EITHER the y-axis size OR the y-axis scale must be provided up-front or this graph axis cannot be plotted.");h&&!d?d=n(h,y,c):!h&&d&&(h=t(d,y,c));var m={xAxisMax:x,xAxisMin:o,xAxisScale:a,xAxisSize:u,xAxisStep:f,xAxisValues:l,yAxisMax:c,yAxisMin:y,yAxisScale:d,yAxisSize:h,yAxisStep:M,yAxisValues:S};return console.log(m),m},i.dotPoints=function(i){return i.yAxisValues.map(function(n,t){return{x:s(i,i.xAxisValues[t]),y:u(i,n)}})},i.horizontalGridLines=function(i){return r(i).map(function(n){return A(i,n)})},i.horizontalLineBarPoints=function(i){return i.xAxisValues.map(function(n,t){return{x1:s(i,0),x2:s(i,n),y1:u(i,i.yAxisValues[t]),y2:u(i,i.yAxisValues[t])}})},i.horizontalLineFullWidth=A,i.linePoints=function(i){return i.yAxisValues.map(function(n,t){return s(i,i.xAxisValues[t])+","+u(i,n)}).join(" ")},i.projectXCoordToSVG=x,i.projectYCoordToSVG=o,i.px=s,i.py=u,i.steppedXAxisValues=e,i.steppedYAxisValues=r,i.verticalGridlines=function(i){return e(i).map(function(n){return a(i,n)})},i.verticalLineBarPoints=function(i){return i.yAxisValues.map(function(n,t){return{x1:s(i,i.xAxisValues[t]),x2:s(i,i.xAxisValues[t]),y1:u(i,0),y2:u(i,n)}})},i.verticalLineFullHeight=a,i.xAxis=function(i,n){return void 0===n&&(n="bottom"),A(i,"top"===n?i.yAxisMax:0)},i.xAxisAnnotations=function(i,n){return void 0===n&&(n="bottom"),e(i).map(function(t){return{x:s(i,t),y:u(i,"top"===n?i.yAxisMax:0)}})},i.xAxisSteps=function(i,n){return e(i).map(function(t){return{x1:s(i,t),x2:s(i,t),y1:u(i,"top"===n?i.yAxisMax:0),y2:"top"===n?u(i,i.yAxisMax)-2:u(i,0)+2}})},i.yAxis=function(i){return a(i,i.xAxisMin>0?i.xAxisMin:0)},i.yAxisAnnotations=function(i){var n=i.xAxisMin>0?i.xAxisMin:0;return r(i).map(function(t){return{x:s(i,n),y:u(i,t)}})},i.yAxisSteps=function(i){return r(i).map(function(n){return{x1:s(i,0),x2:s(i,0)-2,y1:u(i,n),y2:u(i,n)}})}});
//# sourceMappingURL=index.umd.js.map
