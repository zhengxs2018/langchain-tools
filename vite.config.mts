import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import dts from 'vite-plugin-dts';
import { externalizeDeps as external } from 'vite-plugin-externalize-deps';

/**
 * vite config
 * @see https://vitejs.dev/
 */
export default defineConfig(env => {
  return {
    plugins: [
      checker({ typescript: true }),
      external(),
      dts({ rollupTypes: env.mode === 'production' }),
    ],
    build: {
      minify: env.mode === 'production',
      sourcemap: env.mode === 'development',
      copyPublicDir: false,
      lib: {
        entry: ['src/index.ts'],
        formats: ['es', 'cjs'],
      },
    },
  };
});
