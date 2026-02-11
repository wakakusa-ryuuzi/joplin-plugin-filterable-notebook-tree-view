const VITE_DEV_SERVER = 'http://localhost:5173';

const loadModule = (src) => new Promise((resolve, reject) => {
  const script = document.createElement('script');
  script.type = 'module';
  script.src = src;
  script.onload = () => resolve();
  script.onerror = () => reject(new Error(`Failed to load ${src}`));
  document.head.appendChild(script);
});

const bootstrap = async () => {
  try {
    await loadModule(`${VITE_DEV_SERVER}/@vite/client`);
    await loadModule(`${VITE_DEV_SERVER}/webview.ts`);
  } catch (error) {
    console.error('Vite dev server load failed:', error);
  }
};

bootstrap();
