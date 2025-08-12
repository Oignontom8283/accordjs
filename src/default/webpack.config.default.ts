import { Configuration } from "webpack"


export default (():Configuration => ({
    mode: 'production',
    //entry: './src/index.ts',
    output: {
        //filename: 'bundle.js',
        //path: path.resolve(__dirname, 'dist'), // Dossier de sortie
        clean: true
    },
    resolve: {
        extensions: ['.ts', '.js', '.json'],
    },
    module: {
        rules: [
        {
            test: /\.ts$/,
            use: 'ts-loader',
            exclude: /node_modules/,
        },
        ],
    },
    // plugins: [
    //     new CopyWebpackPlugin({
    //     patterns: [
    //         {
    //         from: path.resolve(__dirname, 'node_modules/.prisma/client/'), // Utilise ** pour inclure tous les fichiers
    //         to: path.resolve(__dirname, 'dist/.prisma/client'), // Destination
    //         context: 'node_modules/.prisma/client/', // Utilise ce chemin comme base pour les fichiers
    //         },
    //     ],
    //     }),
    // ],
    externals: {
        'zlib-sync': 'commonjs zlib-sync',  // Exclure zlib-sync
        // D'autres modules natifs peuvent aussi être exclus ici
    },
    target: 'node',
    optimization: {
        minimize: false
    }
}))