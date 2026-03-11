import { useEffect, useState, Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Loading } from './components/common/Loading';
import { router } from './app/router';

const USE_MOCK = (import.meta.env.VITE_USE_MOCK ?? 'true') !== 'false';

function App() {
  const [mockReady, setMockReady] = useState(!USE_MOCK);

  useEffect(() => {
    // Dev default uses MSW. In production, VITE_USE_MOCK should be false.
    if (USE_MOCK) {
      import('./mocks/browser').then(({ startMock }) => startMock().finally(() => setMockReady(true)));
    }
  }, []);

  if (!mockReady) return <Loading text="启动 Mock" />;

  return (
    <Suspense fallback={<Loading />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default App;
