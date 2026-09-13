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

const createBookHandler = async (req, res) => {
  try {
    const { id, authorId, title, publicationDate } = req.body;

    if (!id || !authorId || !title || !publicationDate) {
      return res.status(400).json({ message: 'Invalid book data' });
    }

    const existing = await getDb()
      .collection('books')
      .findOne({ id });

    if (existing) {
      return res.status(400).json({ message: 'Book id already exists' });
    }

    const authorExists = await getDb()
      .collection('authors')
      .findOne({ id: authorId });

    if (!authorExists) {
      return res.status(400).json({ message: 'Invalid author reference' });
    }

    const newBook = { id, authorId, title, publicationDate };
    await getDb().collection('books').insertOne(newBook);

    return res.status(201).json(newBook);
  } catch (error) {
    console.error('Failed to create book:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const updateBookHandler = async (req, res) => {
  try {
    const requestedId = req.params.id;
    const { authorId, title, publicationDate } = req.body;

    if (!authorId || !title || !publicationDate) {
      return res.status(400).json({ message: 'Invalid book data' });
    }

    const authorExists = await getDb()
      .collection('authors')
      .findOne({ id: authorId });

    if (!authorExists) {
      return res.status(400).json({ message: 'Invalid author reference' });
    }

    const result = await getDb()
      .collection('books')
      .updateOne(
        { id: requestedId },
        { $set: { authorId, title, publicationDate } }
      );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const updatedBook = await getDb()
      .collection('books')
      .findOne({ id: requestedId });

    return res.status(200).json(updatedBook);
  } catch (error) {
    console.error('Failed to update book:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteBookHandler = async (req, res) => {
  try {
    const requestedId = req.params.id;

    const result = await getDb()
      .collection('books')
      .deleteOne({ id: requestedId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(204).send();
  } catch (error) {
    console.error('Failed to delete book:', error.message);
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

/**
 * @openapi
 * /books:
 *   post:
 *     summary: Create a book
 *     tags:
 *       - Books
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - authorId
 *               - title
 *               - publicationDate
 *             properties:
 *               id:
 *                 type: string
 *               authorId:
 *                 type: string
 *               title:
 *                 type: string
 *               publicationDate:
 *                 type: string
 *           example:
 *             id: b4
 *             authorId: a1
 *             title: Example Book Title
 *             publicationDate: "2026-01-15"
 *     responses:
 *       201:
 *         description: Book created successfully
 *       400:
 *         description: Invalid book data
 *       500:
 *         description: Unable to create book
 */
router.post('/books', createBookHandler);

/**
 * @openapi
 * /books/{id}:
 *   put:
 *     summary: Update a book
 *     tags:
 *       - Books
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
 *               - authorId
 *               - title
 *               - publicationDate
 *             properties:
 *               authorId:
 *                 type: string
 *               title:
 *                 type: string
 *               publicationDate:
 *                 type: string
 *           example:
 *             authorId: a2
 *             title: Updated Book Title
 *             publicationDate: "2026-02-20"
 *     responses:
 *       200:
 *         description: Book updated successfully
 *       400:
 *         description: Invalid book data
 *       404:
 *         description: Book not found
 *       500:
 *         description: Unable to update book
 */
router.put('/books/:id', updateBookHandler);

/**
 * @openapi
 * /books/{id}:
 *   delete:
 *     summary: Delete a book
 *     tags:
 *       - Books
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Book deleted successfully
 *       404:
 *         description: Book not found
 *       500:
 *         description: Unable to delete book
 */
router.delete('/books/:id', deleteBookHandler);


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