import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useApp } from "./context/AppContext";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { LearningPage } from "./pages/LearningPage";
import { LevelMapPage } from "./pages/LevelMapPage";
import { LevelPlayPage } from "./pages/LevelPlayPage";
import { LevelPreparePage } from "./pages/LevelPreparePage";
import { LevelResultPage } from "./pages/LevelResultPage";
import { LobbyPage } from "./pages/LobbyPage";
import { LoginBridgePage } from "./pages/LoginBridgePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { OrderDetailPage } from "./pages/OrderDetailPage";
import { OrdersPage } from "./pages/OrdersPage";
import { PosterPage } from "./pages/PosterPage";
import { ProfilePage } from "./pages/ProfilePage";
import { StoreDetailPage } from "./pages/StoreDetailPage";
import { StorePage } from "./pages/StorePage";

const AuthGate = () => {
  const { state } = useApp();
  if (!state.sessionToken || !state.currentUser) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

const LoginGate = () => {
  const { state } = useApp();
  if (state.sessionToken && state.currentUser) {
    return <Navigate to="/lobby" replace />;
  }
  return <LoginBridgePage />;
};

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginGate />} />
      <Route element={<AuthGate />}>
        <Route index element={<Navigate to="/lobby" replace />} />
        <Route path="/lobby" element={<LobbyPage />} />
        <Route path="/levels" element={<LevelMapPage />} />
        <Route path="/levels/:levelId/prepare" element={<LevelPreparePage />} />
        <Route path="/levels/:levelId/play/:attemptId" element={<LevelPlayPage />} />
        <Route path="/attempts/:attemptId/result" element={<LevelResultPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/learning" element={<LearningPage />} />
        <Route path="/store" element={<StorePage />} />
        <Route path="/store/item/:itemId" element={<StoreDetailPage />} />
        <Route path="/store/orders" element={<OrdersPage />} />
        <Route path="/store/orders/:orderId" element={<OrderDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/poster" element={<PosterPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
