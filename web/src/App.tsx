import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './components/Login';
import NetworkDetails from './features/networks/NetworkDetails';
import ContainerDetails from './features/containers/ContainerDetails';
import Projects from './features/projects/Projects';
import Containers from './features/containers/Containers';
import NewContainer from './features/containers/NewContainer';
import Networks from './features/networks/Networks';
import NewNetwork from './features/networks/NewNetwork';

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
      {
        path: '/projects',
        element: <Projects />,
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
