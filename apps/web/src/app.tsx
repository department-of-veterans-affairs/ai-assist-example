import { Route, Routes } from 'react-router';
import { RootLayout } from '@/components/layout/root-layout';
import ChatPage from '@/pages/chat';
import { AppProviders } from '@/providers';

function App() {
  return (
    <AppProviders>
      <RootLayout>
        <Routes>
          <Route element={<ChatPage />} path="/" />
        </Routes>
      </RootLayout>
    </AppProviders>
  );
}

export default App;
