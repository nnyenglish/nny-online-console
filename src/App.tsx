import { useEffect, useState } from 'react';
import { initializeIcons } from '@fluentui/react';

import AppRouter from './Router';
import { FirebaseManager } from './lib/2/firebase-manager';

import './App.scss';

initializeIcons();
const firebaseManager = FirebaseManager.getInstance();

function App() {
  const [init, setInit] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const subscription = firebaseManager.observeAuthState().subscribe(user => {
      if (user) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
      setInit(true);
    });

    return () => {
      subscription.unsubscribe();
    };
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
