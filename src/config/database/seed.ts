import mongoose from "mongoose";
import Book from "../../models/Book";
import Database from "./Database";

const seedBooks = async () => {
  await Database.connect();

  const books = [
    {
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      publicationDate: new Date("1925-04-10"),
    },
    {
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      publicationDate: new Date("1960-07-11"),
    },
    {
      title: "1984",
      author: "George Orwell",
      publicationDate: new Date("1949-06-08"),
    },
  ];

  await Book.insertMany(books);
  console.log("Database seeded!");
  mongoose.connection.close();
};

seedBooks().catch(console.error);
