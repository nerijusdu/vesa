import { Container, Flex } from '@chakra-ui/react';
import { PropsWithChildren } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout: React.FC<PropsWithChildren> = () => {
  return (
    <Container maxW={['container.sm', 'container.xl']}>
      <Navbar />
      <Flex w="100%" direction="column" alignItems="center">
        <Outlet />
      </Flex>
    </Container>
  );
};

export default Layout;
