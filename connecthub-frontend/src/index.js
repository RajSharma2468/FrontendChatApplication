import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store/store';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';  // This imports both index.css and global.css
// Add to your index.js or App.js
const originalError = console.error;
console.error = (...args) => {
    if (args[0]?.includes?.('ResizeObserver')) return;
    originalError(...args);
};
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Provider store={store}>
        <App />
    </Provider>
);