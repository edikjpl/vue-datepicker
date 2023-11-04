import { fileURLToPath, URL } from 'url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import minimist from 'minimist';

const { f } = minimist(process.argv.slice(2));

function removeDataTestAttrs(node: any) {
    if (node.type === 1) {
        node.props = node.props.filter((prop: any) => {
            if (prop.name === 'data-test') return false;
            return !(prop.name === 'bind' && prop.arg && prop.arg.content && prop.arg.content === 'data-test');
        });
    }
}
export default defineConfig({
    plugins: [
        vue({
            template: {
                compilerOptions: {
                    nodeTransforms: process.env.NODE_ENV === 'production' ? [removeDataTestAttrs] : [],
                },
            },
        }),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src/VueDatePicker', import.meta.url)),
        },
    },
    server: {
        host: true,
        port: 8080,
    },
    build: {
        emptyOutDir: false,
        lib: {
            formats: f === 'iife' ? ['iife'] : ['es', 'umd'],
            entry: resolve(__dirname, 'src', 'entry.ts'),
            name: 'VueDatePicker',
            fileName: 'vue-datepicker',
        },
        rollupOptions: {
            external: f === 'iife' ? /^vue$/ : /^(vue$|date-fns\/|date-fns-tz\/)/,
            output: {
                globals: (name) => {
                    if (name === 'vue') return 'Vue';
                    if (name.startsWith('date-fns/')) return 'dateFns' + name.substring(9);
                    if (name.startsWith('date-fns-tz/')) return 'dateFnsTz' + name.substring(12);
                    return name;
                },
            },
        },
    },
});
