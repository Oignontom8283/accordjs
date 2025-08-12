
// default package.json content
export default ((
    name: string,
    dependencies: {
        "accordjs": string,
        "discord.js": string,
        "ts-loader": string
    }
) => JSON.stringify({
    name: name,
    version: "1.0.0",
    description: "accordJS discord bot project",
    scripts: {
        start: "accordjs start",
        build: "accordjs build",
        dev: "accordjs dev",
        test: "accordjs dev",
    },
    license: "MIT",
    author: "",
    dependencies: dependencies,
}, null, 2));