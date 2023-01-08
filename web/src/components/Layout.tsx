import { Container } from '@chakra-ui/react';
import { PropsWithChildren } from 'react';
import Navbar from './Navbar';

const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <Container maxW={['container.sm', 'container.xl']}>
      <Navbar />
      {children}
    </Container>
  );
};

export default Layout;
