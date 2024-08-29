import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css'
import { StoreProvider } from './store';

const container = document.getElementById('root')
const root = createRoot(container);
const iframeSrc = "https://saferightfast.quickbase.com/db/bucbxyva3?a=dbpage&pageID=10";

root.render(
<React.StrictMode>
  <StoreProvider iframeSrc={iframeSrc}>
    <App />
  </StoreProvider>
</React.StrictMode>
);
