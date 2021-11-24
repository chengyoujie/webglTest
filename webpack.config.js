var path = require("path");
var HtmlwebpackPlugin = require("html-webpack-plugin")
var webpack = require("webpack")

var RootPath = path.resolve(__dirname);
var AppPath = path.join(RootPath, "src/Test.ts")
var BuildPath = path.join(RootPath, "build")
module.exports = {
    mode: "development",
    entry: {
        app: AppPath,
    },
    output: {
        path: BuildPath,
        filename: "bundle.js"
    },
    module: {
        rules: [{
            test: /\.tsx?$/,
            use: "ts-loader",
            exclude: /node_modules/
        }, 
        {
            test:/\.(txt|vex|frag)$/,
            use:"raw-loader"
        },
        {
            test:/\.css$/,
            use:['style-loader', 'css-loader']
        }
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
    devServer: {

        port: 8978,
        liveReload: true,
        static: {
            directory: BuildPath
        }
    },
    plugins: [
        new HtmlwebpackPlugin({
            template: "./index.html"
        }),
        new webpack.HotModuleReplacementPlugin()
    ]
}