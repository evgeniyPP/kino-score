import React, { useState } from 'react';
import { getIMDB } from './api';
import styles from './styles/App.module.scss';

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [ratings, setRatings] = useState({
    kinopoisk: { title: null, score: null },
    imdb: { title: null, score: null },
    meta: { title: null, score: null },
    tomatoes: { title: null, score: null }
  });
  const [result, setResult] = useState('');

  const handleClick = async () => {
    const data = await getIMDB(input);
    if (data) {
      setRatings((prev: any) => ({
        ...prev!,
        imdb: { title: data.title, score: data.imdb },
        meta: { title: data.title, score: data.meta }
      }));
      setResult(calculate(data.imdb, data.meta));
    }
  };

  return (
    <div className={styles.app}>
      <h1>Введите название фильма:</h1>
      <input type="text" value={input} onChange={e => setInput(e.currentTarget.value)} />
      <button onClick={handleClick}>Посчитать</button>
      {ratings.kinopoisk.score && (
        <h2>
          Кинопоиск: {ratings.kinopoisk.score}{' '}
          <span className={styles.gray}>('{ratings.kinopoisk.title}')</span>
        </h2>
      )}
      {ratings.imdb.score && (
        <h2>
          IMDB: {ratings.imdb.score} <span className={styles.gray}>('{ratings.imdb.title}')</span>
        </h2>
      )}
      {ratings.meta.score && (
        <h2>
          Metacritics: {ratings.meta.score}{' '}
          <span className={styles.gray}>('{ratings.meta.title}')</span>
        </h2>
      )}
      {ratings.tomatoes.score && (
        <h2>
          Rotten Tomatoes: {ratings.tomatoes.score}{' '}
          <span className={styles.gray}>('{ratings.tomatoes.title}')</span>
        </h2>
      )}
      {result && <h2>Общий счет: {result}</h2>}
      <footer>
        Формула подсчета: ( Кинопоиск + IMDB + (( Metacritics + Rotten Tomatoes ) / 2) ) / 3
      </footer>
    </div>
  );
};

export default App;

function calculate(imdb: string, meta: string) {
  const rating = (Number(imdb) + Number(meta) / 10) / 2;
  return rating.toFixed(2);
}
