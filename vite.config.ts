// vite.config.ts
import { defineConfig, UserConfig } from 'vite'; // 导入 UserConfig 类型
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';
import path from 'path'; // 确保导入 path

export default defineConfig(({ command, mode }): UserConfig => {
  // 可以添加类型到函数参数
  const isServe = command === 'serve';
  const isBuild = command === 'build';
  const sourcemap = isServe || !!process.env.VSCODE_DEBUG;

  return {
    plugins: [
      react(),
      electron([
        {
          // Main-Process entry file
          entry: 'electron/main.ts', // 更新为 .ts
          onstart(options) {
            const inspectArg = '--inspect-brk=5858';
            if (process.env.VSCODE_DEBUG) {
              options.startup(['.', inspectArg]); // Pass inspect argument
            } else {
              options.startup();
            }
          },
          vite: {
            // 可以为这个特定的 Electron 入口配置 Vite
            build: {
              sourcemap,
              minify: isBuild,
              outDir: 'dist-electron/main', // 主进程输出目录
              rollupOptions: {
                // external: Object.keys('dependencies' in pkg ? pkg.dependencies : {}),
              },
            },
          },
        },
        {
          entry: 'electron/preload.ts', // 更新为 .ts
          onstart(options) {
            options.reload();
          },
          vite: {
            build: {
              sourcemap: sourcemap ? 'inline' : undefined,
              minify: isBuild,
              outDir: 'dist-electron/preload', // 预加载脚本输出目录
              rollupOptions: {
                // external: Object.keys('dependencies' in pkg ? pkg.dependencies : {}),
              },
            },
          },
        },
      ]),
      renderer({
        // Optional: Add options here if needed for the renderer process
        // For example, if you need to specify multiple HTML entry points or other renderer-specific configurations.
      }),
    ],
    // 定义别名
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    // 如果需要，可以为渲染进程的 Vite build 进行更细致的配置
    build: {
      outDir: 'dist-electron/renderer', // 渲染进程输出目录 (相对于 dist-electron)
      rollupOptions: {
        input: {
          app: path.resolve(__dirname, 'index.html'), // 确保路径正确
        },
        // external: Object.keys('dependencies' in pkg ? pkg.dependencies : {}),
      },
    },
    clearScreen: false, // 避免 Vite 清除 Electron 的输出
  };
});
