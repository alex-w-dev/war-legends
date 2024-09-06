import { useEffect, useState } from 'react';
import { MyClass } from 'rts-kit';
import './App.css';
import GameBattle from './game-battle/GameBattle';

function App() {
  const [count, setCount] = useState('');

  useEffect(() => {
    fetch('/api')
      .then(res => res.text())
      .then(setCount);
  }, []);

  return (
    <>
      <GameBattle />
    </>
  );
}

export default App;
