import { Navigate, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores';

export const AuthGuard = observer(({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { authStore } = useStores();
  if (!authStore.isAuthed) {
    return <Navigate to="/login-callback" state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
});
