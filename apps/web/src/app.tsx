import { Route, Routes } from 'react-router';
import { RootLayout } from '@/components/layout/root-layout';
import ChatPage from '@/pages/chat';
import { SmartLaunchProvider } from '@/providers/smart-launch-provider';

function App() {
  return (
    <SmartLaunchProvider>
      <RootLayout>
        <Routes>
          <Route element={<ChatPage />} path="/" />
          <Route element={<ChatPage />} path="/index.html" />
        </Routes>
      </RootLayout>
    </SmartLaunchProvider>
  );
}

export default App;
