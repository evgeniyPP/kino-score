import axios from 'axios';

export const getIMDB = async (input: string) => {
  const query = input.replace(/\s/g, '+');
  const res = await axios.get(`https://www.omdbapi.com/?i=tt3896198&apikey=4a61c6f&t=${query}`);
  if (res.status === 200) {
    return {
      title: res.data.Title,
      imdbScore: res.data.imdbRating,
      metaScore: res.data.Metascore
    };
  } else {
    return { error: 'Ошибка получения данных c IMDb и Metacritics' };
  }
};

export const getKinopoisk = async (query: string) => {
  const res = await axios.post('https://europe-west1-epp-kino-score.cloudfunctions.net/kinopoisk', {
    query
  });
  if (res.status === 200 && res.data) {
    const { name, year, englishName, rating } = res.data;
    return {
      name,
      year,
      englishName,
      rating
    };
  } else {
    return { error: 'Ошибка получения данных c Кинопоиска' };
  }
};

export const getTomatoes = async (title: string, year: string) => {
  const res = await axios.post('https://europe-west1-epp-kino-score.cloudfunctions.net/tomatoes', {
    title,
    year
  });
  if (res.status === 200 && res.data) {
    const { name, year, rating } = res.data;
    return {
      name,
      year,
      rating
    };
  } else {
    return { error: 'Ошибка получения данных с Rotten Tomatoes' };
  }
};
