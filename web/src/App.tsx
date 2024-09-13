import { createBrowserRouter, redirect, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './components/Login';
import NetworkDetails from './features/networks/NetworkDetails';
import ContainerDetails from './features/containers/ContainerDetails';
import Projects from './features/projects/Projects';
import Containers from './features/containers/Containers';
import NewContainer from './features/containers/NewContainer';
import Networks from './features/networks/Networks';
import NewNetwork from './features/networks/NewNetwork';
import NewProject from './features/projects/NewProject';
import ProjectDetails from './features/projects/ProjectDetails';
import Templates from './features/templates/Templates';
import TemplateDetails from './features/templates/TemplateDetails';
import NewTemplate from './features/templates/NewTemplate';
import Settings from './features/settings/Settings';
import { Box } from '@chakra-ui/react';

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
        path: '/settings',
        element: <Settings />,
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
      {
        path: '/projects/new',
        element: <NewProject />,
      },
      {
        path: '/projects/:id',
        element: <ProjectDetails />,
      },
      {
        path: '/projects/:id/edit',
        element: <NewProject />,
      },
      {
        path: '/templates',
        element: <Templates />,
      },
      {
        path: '/templates/new',
        element: <NewTemplate />,
      },
      {
        path: '/templates/:id',
        element: <TemplateDetails />,
      },
      {
        path: '/templates/:id/edit',
        element: <NewTemplate />,
      },
      {
        path: '/',
        index: true,
        loader: () => redirect('/containers'),
      },
    ],
  },
]);

function App() {
  return (
    <Box pb={10}>
      <RouterProvider router={router} />
    </Box>
  );
}

export default App;
