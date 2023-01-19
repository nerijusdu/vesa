import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Containers from './components/Containers';
import Layout from './components/Layout';
import NetworkDetails from './components/NetworkDetails';
import Networks from './components/Networks';
import NewContainer from './components/NewContainer';
import NewNetwork from './components/NewNetwork';
import Login from './components/Login';
import ContainerDetails from './components/ContainerDetails';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/containers',
        element: <Containers />,
      },
      {
        path: '/containers/new',
        element: <NewContainer />,
      },
      {
        path: '/containers/:id',
        element: <ContainerDetails />,
      },
      {
        path: '/networks',
        element: <Networks />,
      },
      {
        path: '/networks/new',
        element: <NewNetwork />,
      },
      {
        path: '/networks/:id',
        element: <NetworkDetails />,
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
