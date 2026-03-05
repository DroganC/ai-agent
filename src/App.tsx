import { useEffect, useState, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from './components/common/AuthGuard';
import { Loading } from './components/common/Loading';
import { LoginCallback } from './pages/LoginCallback';
import { Hall } from './pages/Hall';
import { Leaderboard } from './pages/Leaderboard';
import { Profile } from './pages/Profile';
import { Levels } from './pages/Levels';
import { LevelPrepare } from './pages/LevelPrepare';
import { LevelPlay } from './pages/LevelPlay';
import { Settlement } from './pages/Settlement';
import { Store } from './pages/Store';
import { StoreOrders } from './pages/StoreOrders';
import { Learning } from './pages/Learning';

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
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/login-callback" element={<LoginCallback />} />
          <Route
            path="/*"
            element={
              <AuthGuard>
                <Routes>
                  <Route path="hall" element={<Hall />} />
                  <Route path="leaderboard" element={<Leaderboard />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="levels" element={<Levels />} />
                  <Route path="level/:id/prepare" element={<LevelPrepare />} />
                  <Route path="level/:id/play" element={<LevelPlay />} />
                  <Route path="level/:id/settlement" element={<Settlement />} />
                  <Route path="store" element={<Store />} />
                  <Route path="store/orders" element={<StoreOrders />} />
                  <Route path="learning" element={<Learning />} />
                  <Route path="*" element={<Navigate to="/hall" replace />} />
                </Routes>
              </AuthGuard>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
