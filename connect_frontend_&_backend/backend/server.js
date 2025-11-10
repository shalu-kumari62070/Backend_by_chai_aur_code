import express from 'express';  // this is the type of modulejs
// it asynchronously

const app = express();

// app.get('/', (req, res) => {
//     res.send('Server is ready');
// });

app.get('/api/jokes', (req, res) => {
    const joke = [
        {
            id:1,
            title: 'FIRST JOKE',
            content: 'This is First Joke'
        },
        {
            id:2,
            title: 'SECOND JOKE',
            content: 'This is second Joke'
        },
        {
            id:3,
            title: 'THIRD JOKE',
            content: 'This is Third Joke'
        },
        {
            id:4,
            title: 'FOURTH JOKE',
            content: 'This is Four Joke'
        },
        {
            id:5,
            title: 'FIFTH JOKE',
            content: 'This is Fifth Joke'
        }
    ]
    res.send(joke);
})

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server at https://localhost: ${port}`)
});