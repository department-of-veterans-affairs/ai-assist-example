import { Route, Routes } from 'react-router';
import { RootLayout } from '@/components/layout/root-layout';
import ChatPage from '@/pages/chat';
import { AppProviders } from '@/providers/app-providers';

function App() {
  return (
    <AppProviders>
      <RootLayout>
        <Routes>
          <Route element={<ChatPage />} path="/" />
          <Route element={<ChatPage />} path="/index.html" />
        </Routes>
      </RootLayout>
    </AppProviders>
  );
}

export default App;
