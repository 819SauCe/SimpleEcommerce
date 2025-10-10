import React, { createContext, useContext, useEffect, useState } from 'react';

type User = {
  id: string;
  firstName: string;
  lastName: string;
  image: string;
} | null;

const UserContext = createContext<User>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    const cached = {
      id: localStorage.getItem('userId') || '',
      firstName: localStorage.getItem('userFirstName') || '',
      lastName: localStorage.getItem('userLastName') || '',
      image: localStorage.getItem('userImage') || '',
    };
    if (cached.id) {
      setUser({
        id: cached.id,
        firstName: cached.firstName,
        lastName: cached.lastName,
        image: cached.image,
      });
    }

    (async () => {
      try {
        const res = await fetch('http://localhost:8080/me', {
          method: 'GET',
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          const fresh: NonNullable<User> = {
            id: data.user.id,
            firstName: data.user.first_name,
            lastName: data.user.last_name,
            image: data.user.user_image,
          };
          setUser(fresh);
          localStorage.setItem('userId', fresh.id);
          localStorage.setItem('userFirstName', fresh.firstName);
          localStorage.setItem('userLastName', fresh.lastName);
          localStorage.setItem('userImage', fresh.image);
        } else if (res.status === 401) {
          setUser(null);
          localStorage.removeItem('userId');
          localStorage.removeItem('userFirstName');
          localStorage.removeItem('userLastName');
          localStorage.removeItem('userImage');
        }
      } catch (e) {
        console.error('Error fetching user data:', e);
      }
    })();
  }, []);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
