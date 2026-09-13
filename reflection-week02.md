# Update Book Collection to Reference Authors and Finish Book API

## Description

- Update the existing Week 01 book API so book documents include a reference to an author.
- Add the remaining CRUD operations for books.
- Validate book request bodies before writing to MongoDB.
- Validate that each submitted `authorId` matches an existing author document.
- Add Swagger documentation for all book routes.
- Test the book routes locally and in the deployed Render application.

## Goal

Update the existing Week 01 book API so book documents include a reference to an author and the API supports all CRUD operations for books.

Every book route must be documented and testable in Swagger.

## Data Model

Book documents will be stored in the `books` collection.

Required book fields:

- `id`: string, required, custom ID such as `b1`
- `authorId`: string, required, references the `id` field of an author document
- `title`: string, required
- `publicationDate`: string, required

Books will continue to use custom string IDs instead of MongoDB `_id` values for route parameters.

## Relationship to Authors

Each book will identify its author with an `authorId` field.

The value of `authorId` must match the custom `id` value of an existing author document.

When creating or updating a book, the API must reject the request with a `400` status code if the submitted `authorId` does not match an existing author.

## Routes

### GET /books

**Purpose:** Return all books.

**Success:**

- `200` — Returns an array of book objects.

**Errors:**

- `500` — Unexpected server or database error.

### GET /books/:id

**Purpose:** Return one book by its custom ID.

**Success:**

- `200` — Returns the matching book object.

**Errors:**

- `404` — No book exists with that ID.
- `500` — Unexpected server or database error.

### POST /books

**Purpose:** Create a new book.

The book previously stored the author's name directly. It will now reference the author using `authorId`.

**Request body:**

```json
{
  "id": "b4",
  "authorId": "a1",
  "title": "Example Book Title",
  "publicationDate": "2026-01-15"
}