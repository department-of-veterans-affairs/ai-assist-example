import { Route, Routes } from 'react-router';
import { RootLayout } from '@/components/layout/root-layout';
import ChatPage from '@/pages/chat';

function App() {
  return (
    <RootLayout>
      <Routes>
        <Route element={<ChatPage />} path="/" />
      </Routes>
    </RootLayout>
  );
}

export default App;
