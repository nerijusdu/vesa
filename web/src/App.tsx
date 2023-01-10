import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Containers from './components/Containers';
import Layout from './components/Layout';
import NewContainer from './components/NewContainer';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/containers',
        element: <Containers />,
      },
      {
        path: '/containers/new',
        element: <NewContainer />,
      },
    ],
  },
]);

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;
