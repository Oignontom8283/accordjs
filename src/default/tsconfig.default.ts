
// tsconfig.json default content
export default ((strict:boolean=true, sourceDir:string="src") => (JSON.stringify({
    compilerOptions: {
        BaseUrl: "./",
        target: "ES2022",
        module: "CommonJS",
        moduleResolution: "Node",
        strict: strict,
        noImplicitAny: true,
        strictNullChecks: true,
        resolveJsonModule: true,
        esModuleInterop: true,
        skipLibCheck: true
    },
    include: [sourceDir],
    exclude: ["node_modules", "dist"]
}, null, 2)))