import express from 'express';
import { getDb } from './src/db/connect.js';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  return res.status(200).json({ message: 'Server is running' });
});

app.get('/books', async (req, res) => {
  try {
    const books = await getDb()
      .collection('books')
      .find({})
      .toArray();
    return res.status(200).json(books);
  } catch (error) {
    console.error('Failed to retrieve books:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/books/:id', async (req, res) => {
  try {
    const requestedId = req.params.id;
    const book = await getDb()
      .collection('books')
      .findOne({ id: requestedId });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(200).json(book);
  } catch (error) {
    console.error('Failed to retrieve book:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default app;