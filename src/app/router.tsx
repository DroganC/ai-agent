import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { AuthGuard } from '../components/common/AuthGuard';
import { LoginCallback } from '../pages/LoginCallback';
import { Leaderboard } from '../pages/Leaderboard';
import { Profile } from '../pages/Profile';
import { Home } from '../pages/Home';
import { GameIntro } from '../pages/GameIntro';
import { GamePlay } from '../pages/GamePlay';
import { Levels } from '../pages/Levels';
import { LevelPrepare } from '../pages/LevelPrepare';
import { LevelPlay } from '../pages/LevelPlay';
import { Settlement } from '../pages/Settlement';
import { Store } from '../pages/Store';
import { StoreOrders } from '../pages/StoreOrders';
import { Learning } from '../pages/Learning';
import { TabLayout } from './TabLayout';

// 页面已解耦为每页独立目录，入口为各目录下的 index.tsx；页面内可包含 components 子目录

export const router = createBrowserRouter([
  { path: '/login-callback', element: <LoginCallback /> },

  // Backward compatible redirects
  { path: '/hall', element: <Navigate to="/home" replace /> },
  { path: '/leaderboard', element: <Navigate to="/rank" replace /> },
  { path: '/profile', element: <Navigate to="/me" replace /> },

  {
    path: '/',
    element: (
      <AuthGuard>
        <Outlet />
      </AuthGuard>
    ),
    children: [
      {
        element: <TabLayout />,
        children: [
          { index: true, element: <Navigate to="/home" replace /> },
          { path: 'home', element: <Home /> },
          { path: 'rank', element: <Leaderboard /> },
          { path: 'me', element: <Profile /> },
        ],
      },

      // App stack pages (not in Tab)
      { path: 'game/:gameId', element: <GameIntro /> },
      { path: 'game/:gameId/play', element: <GamePlay /> },
      { path: 'levels', element: <Levels /> },
      { path: 'level/:id/prepare', element: <LevelPrepare /> },
      { path: 'level/:id/play', element: <LevelPlay /> },
      { path: 'level/:id/settlement', element: <Settlement /> },
      { path: 'store', element: <Store /> },
      { path: 'store/orders', element: <StoreOrders /> },
      { path: 'learning', element: <Learning /> },

      { path: '*', element: <Navigate to="/home" replace /> },
    ],
  },
]);

