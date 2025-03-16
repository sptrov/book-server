import z from "zod";
import { IBook } from "../models/Book";

const bookSchema = z.object({
  title: z.string().min(3, "Title is required").max(255, "Title too long"),
  author: z
    .string()
    .min(3, "Author name is required or too short")
    .max(255, "Author name too long"),
  publicationDate: z.string().refine(
    (date) => {
      const parsedDate = Date.parse(date);
      if (isNaN(parsedDate)) {
        return false;
      }
      const publicationYear = new Date(parsedDate).getFullYear();
      const currentYear = new Date().getFullYear();
      return (
        publicationYear >= currentYear - 150 && publicationYear <= currentYear
      );
    },
    {
      message:
        "Publication date must be a valid date within the last 150 years",
    }
  ),
});

const searchSchema = z.object({
  query: z
    .string()
    .trim()
    .min(3, "Search query is too short")
    .max(100, "Search query is too long"),
});

export function validateSearchQuery(query: string) {
  const result = searchSchema.safeParse({ query });
  if (!result.success) {
    return {
      error: true,
      data: result.error.errors.map((err) => err.message).join(", "),
    };
  }
  return { error: false, data: result.data };
}

export default function validateBook(data: IBook) {
  const result = bookSchema.safeParse(data);
  if (!result.success) {
    return {
      error: true,
      data: result.error.errors.map((err) => err.message).join(", "),
    };
  }
  return { error: false, data };
}
