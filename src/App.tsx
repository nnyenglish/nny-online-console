import React, { useEffect, useState } from 'react';
import { onAuthStateChangedService } from './firebase';

import AppRouter from './Router';

function App() {
  const [init, setInit] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    onAuthStateChangedService((user) => {
      if (user) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
      setInit(true);
    });
  }, []);

  return (
    <>
      {
        init ? <AppRouter isLoggedIn={isLoggedIn}/> : <span>로딩중입니다.</span>
      }
      <footer>&copy; {new Date().getFullYear()} 누나영어학연구소</footer>
    </>
  );
}

export default App;
