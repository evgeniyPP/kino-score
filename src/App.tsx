import React, { useState } from 'react';
import Preloader from './assets/Preloader';
import { getIMDB, getKinopoisk, getTomatoes } from './api';
import styles from './styles/App.module.scss';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [input, setInput] = useState('');
  const [ratings, setRatings] = useState({
    kinopoisk: { title: null, score: null },
    imdb: { title: null, score: null },
    meta: { title: null, score: null },
    tomatoes: { title: null, score: null }
  });
  const [result, setResult] = useState('');

  const handleClick = async () => {
    setLoading(true);
    const kinopoiskData = await getKinopoisk(input);

    if (kinopoiskData && !kinopoiskData.error) {
      const omdbData = await getIMDB(kinopoiskData.englishName);
      const tomatoesData = await getTomatoes(kinopoiskData.englishName, kinopoiskData.year);
      setLoading(false);

      if (omdbData && tomatoesData && !omdbData.error && !tomatoesData.error) {
        setRatings((prev: any) => ({
          ...prev!,
          kinopoisk: { title: kinopoiskData.name, score: kinopoiskData.rating },
          imdb: { title: omdbData.title, score: omdbData.imdbScore },
          meta: { title: omdbData.title, score: omdbData.metaScore },
          tomatoes: { title: tomatoesData.name, score: tomatoesData.rating }
        }));
        setResult(
          calculate(
            kinopoiskData.rating,
            omdbData.imdbScore,
            omdbData.metaScore,
            tomatoesData.rating
          )
        );
      } else {
        omdbData.error
          ? setError(omdbData.error)
          : tomatoesData.error
          ? setError(tomatoesData.error)
          : setError('Неизвестная ошибка');
      }
    } else {
      setError(kinopoiskData.error);
    }
  };

  return (
    <div className={styles.app}>
      <h1>Введите название фильма:</h1>
      <input type="text" value={input} onChange={e => setInput(e.currentTarget.value)} />
      <button onClick={handleClick} disabled={loading}>
        Посчитать
      </button>

      {loading && (
        <div className={styles.loader}>
          <Preloader />
          <p>Пожалуйста, подождите. Обычно занимает ~15 секунд</p>
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}

      {ratings.kinopoisk.score && (
        <h2 className={styles.score}>
          Кинопоиск: {ratings.kinopoisk.score}{' '}
          <span className={styles.gray}>({ratings.kinopoisk.title})</span>
        </h2>
      )}
      {ratings.imdb.score && (
        <h2 className={styles.score}>
          IMDB: {ratings.imdb.score} <span className={styles.gray}>({ratings.imdb.title})</span>
        </h2>
      )}
      {ratings.meta.score && (
        <h2 className={styles.score}>
          Metacritics: {ratings.meta.score}{' '}
          <span className={styles.gray}>({ratings.meta.title})</span>
        </h2>
      )}
      {ratings.tomatoes.score && (
        <h2 className={styles.score}>
          Rotten Tomatoes: {ratings.tomatoes.score}{' '}
          <span className={styles.gray}>({ratings.tomatoes.title})</span>
        </h2>
      )}
      {result &&
        ratings.kinopoisk.score &&
        ratings.imdb.score &&
        ratings.meta.score &&
        ratings.tomatoes.score && <h2 className={styles.total}>Общий счет: {result}</h2>}
      <footer>
        Формула подсчета: ( Кинопоиск + IMDb + (( Metacritics + Rotten Tomatoes ) / 2) ) / 3
      </footer>
    </div>
  );
};

export default App;

function calculate(kinopoisk: string, imdb: string, meta: string, tomatoes: string) {
  const rating =
    ((Number(kinopoisk) + Number(imdb)) * 10 + (Number(meta) + Number(tomatoes)) / 2) / 3;
  return rating.toFixed(1);
}
