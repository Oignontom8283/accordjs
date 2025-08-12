import { webpack } from "webpack";
import webpackCompilerComfiguration from "./default/webpack.config.default";

export async function compile(
    entry:string,
    outputFolder:string,
    outputMainFileName:`${string}.js`='bundle.js'
) {

    const configuration = webpackCompilerComfiguration;
    configuration.entry = entry;
    // @ts-ignore
    configuration.output.path = outputFolder;
    // @ts-ignore
    configuration.output.filename = outputMainFileName;

    const compiler = webpack(configuration);

    compiler.run((err, stats) => {
        if (err) {
            console.error("❌ Build failed:", err);
            return;
        }

        if (stats?.hasErrors()) {
            console.error("❌ Build completed with errors:", stats.toJson().errors);
            return;
        }

        if (stats?.hasWarnings()) {
            console.warn("⚠️ Build completed with warnings:", stats.toJson().warnings);
        }
    })
}