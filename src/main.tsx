import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'antd-mobile/es/global';
import './styles/global.less';
import { RootStoreProvider } from './stores';
import { rootStore } from './stores/singleton';
import { setupRem } from './utils/rem';

setupRem();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootStoreProvider store={rootStore}>
      <App />
    </RootStoreProvider>
  </React.StrictMode>
);
