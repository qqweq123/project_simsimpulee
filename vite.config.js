
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 3000,
        open: true,
    },
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, 'index.html'),

                // Auth
                login: path.resolve(__dirname, 'src/pages/auth/login/index.html'),

                // Tests index
                testsIndex: path.resolve(__dirname, 'src/pages/tests/index.html'),
                testList: path.resolve(__dirname, 'src/pages/tests/test_list.html'),

                // Dessert test
                dessertIndex: path.resolve(__dirname, 'src/pages/tests/dessert/index.html'),
                dessertQuestion: path.resolve(__dirname, 'src/pages/tests/dessert/question.html'),
                dessertResult: path.resolve(__dirname, 'src/pages/tests/dessert/result.html'),

                // Love test
                loveIndex: path.resolve(__dirname, 'src/pages/tests/love/index.html'),
                loveQuestion: path.resolve(__dirname, 'src/pages/tests/love/question.html'),
                loveResult: path.resolve(__dirname, 'src/pages/tests/love/result.html'),

                // Island test
                islandIndex: path.resolve(__dirname, 'src/pages/tests/island/index.html'),
                islandQuestion: path.resolve(__dirname, 'src/pages/tests/island/question.html'),
                islandResult: path.resolve(__dirname, 'src/pages/tests/island/result.html'),

                // Hormoni test
                hormoniIndex: path.resolve(__dirname, 'src/pages/tests/hormoni/index.html'),
                hormoniQuestion: path.resolve(__dirname, 'src/pages/tests/hormoni/question.html'),
                hormoniResult: path.resolve(__dirname, 'src/pages/tests/hormoni/result.html'),

                // Demon test
                demonIndex: path.resolve(__dirname, 'src/pages/tests/demon/index.html'),
                demonQuestion: path.resolve(__dirname, 'src/pages/tests/demon/question.html'),
                demonResult: path.resolve(__dirname, 'src/pages/tests/demon/result.html'),
            },
        },
    },
});
