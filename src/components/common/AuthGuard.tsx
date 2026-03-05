import { Navigate, useLocation } from 'react-router-dom';
import { authStore } from '../../store';
import { observer } from 'mobx-react-lite';

export const AuthGuard = observer(({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  if (!authStore.isAuthed) {
    return <Navigate to="/login-callback" state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
});
