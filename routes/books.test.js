process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");
const Book = require("../models/book");

const books = {
    "books":
        [{
            "isbn": "0691161518",
            "amazon_url": "http://a.co/eobPtX2",
            "author": "Matthew Lane",
            "language": "english",
            "pages": 264,
            "publisher": "Princeton University Press",
            "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
            "year": 2017
        }]
}

const book = {
    "book": {
        "isbn": "0691161518",
        "amazon_url": "http://a.co/eobPtX2",
        "author": "Matthew Lane",
        "language": "english",
        "pages": 264,
        "publisher": "Princeton University Press",
        "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
        "year": 2017
    }
}

describe("Book route tests", () => {
    beforeEach(async () => {
        await db.query("DELETE FROM books");

        let createBook = await Book.create(
            {
                "isbn": "0691161518",
                "amazon_url": "http://a.co/eobPtX2",
                "author": "Matthew Lane",
                "language": "english",
                "pages": 264,
                "publisher": "Princeton University Press",
                "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
                "year": 2017
            }
        );
    });


    describe("GET /books", () => {
        test("Can view all books", async () => {
            const resp = await request(app).get("/books");
            expect(resp.statusCode).toBe(200);
            expect(resp.body).toEqual(books);
        });
    });

    describe("GET /books by id", () => {
        test("Can get book by id", async () => {
            const resp = await request(app).get("/books/0691161518");
            expect(resp.statusCode).toBe(200);
            expect(resp.body).toEqual(book);
        });

        test("Throws error if no id exists", async () => {
            let resp = await request(app).get("/books/0000000");
            expect(resp.statusCode).toBe(404);
        });
    });

    describe("POST /books", () => {
        test("Can create a book", async () => {
            const testBook = {
                "isbn": "11111111",
                "amazon_url": "http://www.amazon.com/thisbook",
                "author": "JRR Tolkien",
                "language": "english",
                "pages": 423,
                "publisher": "George Allen & Unwin",
                "title": "The Fellowship of the Ring",
                "year": 1954
            }

            const resp = await request(app)
                .post("/books")
                .send(testBook)

            expect(resp.statusCode).toBe(201);
            expect(resp.body).toEqual({ "book": testBook })
        });

        test("Creating a book that already exists throws an error", async () => {
            const resp = await request(app).post("/books").send(book.book);
            expect(resp.statusCode).toBe(500);
            expect(resp.body.message).toBe("duplicate key value violates unique constraint \"books_pkey\"")

        });

        describe("JSONSchema validation throws error for invalid submissions", () => {
            test("All fields required", async () => {
                const resp = await request(app).post("/books").send({});
                expect(resp.statusCode).toBe(400)
                const expected = [
                    "instance requires property \"isbn\"",
                    "instance requires property \"amazon_url\"",
                    "instance requires property \"author\"",
                    "instance requires property \"language\"",
                    "instance requires property \"pages\"",
                    "instance requires property \"publisher\"",
                    "instance requires property \"title\"",
                    "instance requires property \"year\""
                ]

                expect(resp.body.message).toEqual(expected);
            });

            test("JSONSchema type validation throws an error", async () => {
                book.book.pages = "123"
                const resp = await request(app).post("/books").send(book.book);
                expect(resp.statusCode).toBe(400);
                expect(resp.body.message).toEqual(["instance.pages is not of a type(s) integer"])

                book.book.pages = 264
            });
        });

    });

    describe("PUT /books/isbin", () => {
        test("Can update a book", async () => {
            book.book.title = "Put Test";
            book.book.author = "David";
            const resp = await request(app).put("/books/0691161518").send(book.book);
            expect(resp.statusCode).toBe(200);
            expect(resp.body).toEqual(book);
            book.book.title = "Power-Up: Unlocking the Hidden Mathematics in Video Games";
            book.book.author = "Matthew Lane";
        });

        test("Updating a book that doesn't exist throws an error", async () => {
            const resp = await request(app).put("/books/0000000").send(book.book);
            expect(resp.statusCode).toBe(404);
        });

        describe("JSONSchema validation throws an error for invalid submission", () => {
            test("All fields required", async () => {
                const resp = await request(app).put("/books/0691161518").send({});
                expect(resp.statusCode).toBe(400)
                const expected = [
                    "instance requires property \"amazon_url\"",
                    "instance requires property \"author\"",
                    "instance requires property \"language\"",
                    "instance requires property \"pages\"",
                    "instance requires property \"publisher\"",
                    "instance requires property \"title\"",
                    "instance requires property \"year\""
                ]

                expect(resp.body.message).toEqual(expected);
            });

            test("JSONSchema type validation throws an error", async () => {
                book.book.pages = "123"
                const resp = await request(app).put("/books/0691161518").send(book.book);
                expect(resp.statusCode).toBe(400);
                expect(resp.body.message).toEqual(["instance.pages is not of a type(s) integer"])

                book.book.pages = 264
            });


        })

    });

    describe("DELETE /books/isbin", () => {
        test("Can delete a book", async () => {
            const resp = await request(app).delete("/books/0691161518");
            expect(resp.statusCode).toBe(200);
            expect(resp.body.message).toBe("Book deleted");
        });

        test("Delete request with invalid isbn throws an error", async () => {
            const resp = await request(app).delete("/books/1234");
            expect(resp.statusCode).toBe(404);
            expect(resp.body.message).toBe("There is no book with an isbn '1234");
        });
    });

});




afterAll(async function () {
    await db.end();
});




