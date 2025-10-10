import { useUser } from '../user/UserContext';

export function Header() {
  const user = useUser();
  return (
    <header>
      <h1>{user ? user.id : 'Welcome'}</h1>
    </header>
  );
}
