import { Outlet } from 'react-router-dom';
import { BottomTab } from '../components/common/BottomTab';

export function TabLayout() {
  return (
    <div className="page">
      <Outlet />
      <BottomTab />
    </div>
  );
}

