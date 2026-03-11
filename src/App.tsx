import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Loading } from './components/common/Loading';
import { router } from './app/router';

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default App;
