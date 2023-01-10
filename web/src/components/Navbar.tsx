import { Button, Flex } from '@chakra-ui/react';
import { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <Flex py={4} borderBottom="solid 1px" borderColor="purple.700" justifyContent="space-between">
      <Flex fontWeight="bold">VESA</Flex>
      <Flex gap={4}>
        <NavLink href="/">Home</NavLink>
        <NavLink href="/containers">Containers</NavLink>
      </Flex>
    </Flex>
  );
};

type NavLinkProps = PropsWithChildren & {
  href?: string;
  onClick?: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ href, onClick, children }) => {
  if (href) {
    return (
      <Link to={href}>
        <Button variant="link" colorScheme="purple">{children}</Button>
      </Link>
    );
  }
  if (onClick) {
    return (
      <Button variant="link" colorScheme="purple" onClick={onClick}>{children}</Button>
    );
  }

  return null;
};

export default Navbar;
