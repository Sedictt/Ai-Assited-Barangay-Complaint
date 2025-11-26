import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
<<<<<<< HEAD
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
/*dsa*/ 
=======
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
>>>>>>> ca1aa7a1cd7910c54f8391fedea708b863049a82
