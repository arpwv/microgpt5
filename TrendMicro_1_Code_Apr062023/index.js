const { Configuration, OpenAIApi } = require("openai");

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

const configuration = new Configuration({
  apiKey: process.env.API_KEY,
});

const openai = new OpenAIApi(configuration);

const headHTML = '<head><link rel="stylesheet" href="/style.css"><title>Book Recommendation App</title></head>'

const getResponse = async(genres, authors) => {
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    max_tokens: 150,
    messages: [{role: "user", content: `recommend some books for someone who loves the following genres: "${genres}" and the following authors: "${authors}"`}]
  }).catch((err)=>console.log(err.response));
  return response
}

app.get('/', (req, res) => {
  res.send(`
    <html>
      ${headHTML}
      <body>
        <h1>Book Recommendation App</h1>
        <form method="POST" action="/recommendations">
          <label for="genres">Favorite genres (separate with commas):</label>
          <input type="text" id="genres" name="genres"><br>

          <label for="authors">Favorite authors (separate with commas):</label>
          <input type="text" id="authors" name="authors"><br>

          <input type="submit" value="Get recommendations">
        </form>
      </body>
    </html>
  `);
});

app.post('/recommendations', async (req, res) => {
  const genres = req.body.genres;
  const authors = req.body.authors;

  const response = await getResponse(genres, authors);
  console.log(response.data.choices[0].message.content)
  const formattedResponse = formatResponse(response, genres, authors)
  res.send(formattedResponse);
});

const formatResponse = (response, genres, authors) => {
  if(!response || !response.data || !response.data.choices || response.data.choices.length === 0){
    return `<html>${headHTML}<body><h1>No response, please try again...</h1></body></html>`
  }
  const message = response.data.choices[0].message.content.replace(/\n/g,'</p><p>')
  return `<html>${headHTML}<body><h1>Recommendations for genres: ${genres} and authors: ${authors}</h1><p>${message}</p></body></html>`
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});