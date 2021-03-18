const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const webpack = require("webpack");

module.exports = {
	mode: "development",
	devServer: {
		historyApiFallback: true,
		contentBase: path.resolve(__dirname, "./dist"),
		open: true,
		compress: true,
		hot: true,
		port: 8080,
	},
	entry: {
		main: path.resolve(__dirname, "./src/index.tsx"),
	},
	output: {
		path: path.resolve(__dirname, "./dist"),
		filename: "app.js",
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: "ts-loader",
				exclude: /node_modules/,
			},
		],
	},
	resolve: {
		extensions: [".mjs", ".tsx", ".ts", ".js", ".jsx"],
	},
	plugins: [
		new HtmlWebpackPlugin({
			title: "Shared frontend libraries playground",
			template: path.resolve(__dirname, "./src/template.html"),
			filename: "index.html",
		}),
		new CleanWebpackPlugin(),
		new webpack.HotModuleReplacementPlugin(),
	],
};
