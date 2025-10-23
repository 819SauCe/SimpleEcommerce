import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

type User = {
  id: string;
  firstName: string;
  lastName: string;
  image: string;
} | null;

const UserContext = createContext<User | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | undefined>(undefined);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

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
          const fresh = {
            id: String(data.user.id),
            firstName: String(data.user.first_name),
            lastName: String(data.user.last_name),
            image: String(data.user.user_image || ''),
          };

          setUser(prev => {
            if (
              prev &&
              prev.id === fresh.id &&
              prev.firstName === fresh.firstName &&
              prev.lastName === fresh.lastName &&
              prev.image === fresh.image
            ) return prev;
            return fresh;
          });
        } else if (res.status === 401) {
          setUser(null);
        } else {
          if (user === undefined) setUser(null);
        }
      } catch {
        if (user === undefined) setUser(null);
      }
    })();
  }, []);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
