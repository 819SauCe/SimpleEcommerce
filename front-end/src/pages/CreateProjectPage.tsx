import { useUser } from '../config/UserContext';
import { refreshToken } from '../config/refreshToken';
import { useEffect } from 'react';

export function CreateProjectPage() {
  const user  = useUser();
  if (!user) {
    window.location.href = '/login';
  }

  useEffect(() => {
     async function fetchToken() {
       const token = await refreshToken();

     }

     fetchToken();
   }, []);

  return (
    <div>
      <h1>Create Project</h1>
    </div>
  );
}
