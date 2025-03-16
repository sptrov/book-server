import Book, { IBook } from "../models/Book";

class BookOperations {
  static async getAllBooks(): Promise<IBook[]> {
    return Book.find().exec();
  }

  static async findBooksByTitle(title: string): Promise<IBook[]> {
    return Book.find({ title: new RegExp(title, "i") }).exec();
  }

  static async findBooksByAuthor(author: string): Promise<IBook[]> {
    return Book.find({ author: new RegExp(author, "i") }).exec();
  }

  static async findBookByAny(query: string): Promise<IBook[]> {
    return await Book.find({
      $or: [
        { title: new RegExp(query, "i") },
        { author: new RegExp(query, "i") },
      ],
    }).exec();
  }

  static async findBookById(id: string): Promise<IBook | null> {
    return Book.findById(id).exec();
  }

  static async createBook(bookData: Partial<IBook>): Promise<IBook> {
    const book = new Book(bookData);
    return book.save();
  }

  static async updateBookById(
    id: string,
    updateData: Partial<IBook>
  ): Promise<IBook | null> {
    return Book.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  static async deleteBookById(id: string): Promise<IBook | null> {
    return Book.findByIdAndDelete(id).exec();
  }
}

export default BookOperations;
