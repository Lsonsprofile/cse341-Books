import express from 'express';
import { getDb } from './db/connect.js';

const router = express.Router();

const getBooksHandler = async (req, res) => {
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
};

const getBookByIdHandler = async (req, res) => {
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
};

/**
 * @openapi
 * /books:
 *   get:
 *     summary: Get all books
 *     tags:
 *       - Books
 *     responses:
 *       200:
 *         description: Books returned successfully
 *       500:
 *         description: Unable to retrieve books
 */
router.get('/books', getBooksHandler);

/**
 * @openapi
 * /books/{id}:
 *   get:
 *     summary: Get one book by id
 *     tags:
 *       - Books
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The custom book id, such as b1
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book returned successfully
 *       404:
 *         description: Book not found
 *       500:
 *         description: Unable to retrieve book
 */
router.get('/books/:id', getBookByIdHandler);


// ---------- Authors ------------------------

const getAuthorsHandler = async (req, res) => {
  try {
    const authors = await getDb()
      .collection('authors')
      .find({})
      .toArray();
    return res.status(200).json(authors);
  } catch (error) {
    console.error('Failed to retrieve authors:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getAuthorByIdHandler = async (req, res) => {
  try {
    const requestedId = req.params.id;
    const author = await getDb()
      .collection('authors')
      .findOne({ id: requestedId });

    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }

    return res.status(200).json(author);
  } catch (error) {
    console.error('Failed to retrieve author:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const createAuthorHandler = async (req, res) => {
  try {
    const { id, name, birthYear } = req.body;

    if (!id || !name || birthYear === undefined || typeof birthYear !== 'number') {
      return res.status(400).json({ message: 'Invalid author data' });
    }

    const existing = await getDb()
      .collection('authors')
      .findOne({ id });

    if (existing) {
      return res.status(400).json({ message: 'Author id already exists' });
    }

    const newAuthor = { id, name, birthYear };
    await getDb().collection('authors').insertOne(newAuthor);

    return res.status(201).json(newAuthor);
  } catch (error) {
    console.error('Failed to create author:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const updateAuthorHandler = async (req, res) => {
  try {
    const requestedId = req.params.id;
    const { name, birthYear } = req.body;

    if (!name || birthYear === undefined || typeof birthYear !== 'number') {
      return res.status(400).json({ message: 'Invalid author data' });
    }

    const result = await getDb()
      .collection('authors')
      .updateOne(
        { id: requestedId },
        { $set: { name, birthYear } }
      );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Author not found' });
    }

    const updatedAuthor = await getDb()
      .collection('authors')
      .findOne({ id: requestedId });

    return res.status(200).json(updatedAuthor);
  } catch (error) {
    console.error('Failed to update author:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteAuthorHandler = async (req, res) => {
  try {
    const requestedId = req.params.id;

    const bookUsingAuthor = await getDb()
      .collection('books')
      .findOne({ authorId: requestedId });

    if (bookUsingAuthor) {
      return res.status(400).json({ message: 'Cannot delete author with existing books' });
    }

    const result = await getDb()
      .collection('authors')
      .deleteOne({ id: requestedId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Author not found' });
    }

    return res.status(204).send();
  } catch (error) {
    console.error('Failed to delete author:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @openapi
 * /authors:
 *   get:
 *     summary: Get all authors
 *     tags:
 *       - Authors
 *     responses:
 *       200:
 *         description: Authors returned successfully
 *       500:
 *         description: Unable to retrieve authors
 */
router.get('/authors', getAuthorsHandler);

/**
 * @openapi
 * /authors/{id}:
 *   get:
 *     summary: Get one author by id
 *     tags:
 *       - Authors
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Author returned successfully
 *       404:
 *         description: Author not found
 *       500:
 *         description: Unable to retrieve author
 */
router.get('/authors/:id', getAuthorByIdHandler);

/**
 * @openapi
 * /authors:
 *   post:
 *     summary: Create an author
 *     tags:
 *       - Authors
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - name
 *               - birthYear
 *             properties:
 *               id:
 *                 type: string
 *               name:
 *                 type: string
 *               birthYear:
 *                 type: integer
 *           example:
 *             id: a3
 *             name: Example Author
 *             birthYear: 1980
 *     responses:
 *       201:
 *         description: Author created successfully
 *       400:
 *         description: Invalid author data
 *       500:
 *         description: Unable to create author
 */
router.post('/authors', createAuthorHandler);

/**
 * @openapi
 * /authors/{id}:
 *   put:
 *     summary: Update an author
 *     tags:
 *       - Authors
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - birthYear
 *             properties:
 *               name:
 *                 type: string
 *               birthYear:
 *                 type: integer
 *           example:
 *             name: Updated Author Name
 *             birthYear: 1975
 *     responses:
 *       200:
 *         description: Author updated successfully
 *       400:
 *         description: Invalid author data
 *       404:
 *         description: Author not found
 *       500:
 *         description: Unable to update author
 */
router.put('/authors/:id', updateAuthorHandler);

/**
 * @openapi
 * /authors/{id}:
 *   delete:
 *     summary: Delete an author
 *     tags:
 *       - Authors
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Author deleted successfully
 *       400:
 *         description: Cannot delete author with existing books
 *       404:
 *         description: Author not found
 *       500:
 *         description: Unable to delete author
 */
router.delete('/authors/:id', deleteAuthorHandler);


export default router;