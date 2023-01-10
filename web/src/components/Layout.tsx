import { Container } from '@chakra-ui/react';
import { PropsWithChildren } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout: React.FC<PropsWithChildren> = () => {
  return (
    <Container maxW={['container.sm', 'container.xl']}>
      <Navbar />
      <Outlet />
    </Container>
  );
};

export default Layout;
