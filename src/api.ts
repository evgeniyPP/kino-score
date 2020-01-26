import axios from 'axios';

export const getIMDB = async (input: string) => {
  const query = input.replace(/\s/g, '+');
  const res = await axios.get(`http://www.omdbapi.com/?i=tt3896198&apikey=4a61c6f&t=${query}`);
  if (res.status === 200) {
    return {
      title: res.data.Title,
      imdb: res.data.imdbRating,
      meta: res.data.Metascore
    };
  }
};
