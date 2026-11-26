import { IsInt, IsNotEmpty, IsString, Matches, Max, MaxLength, Min } from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  author!: string;

  // ISBN-10 or ISBN-13, hyphens/spaces optional
  @IsString()
  @Matches(/^(?:\d{9}[\dXx]|\d{13}|(?:\d[- ]?){9}[\dXx]|(?:\d[- ]?){12}\d)$/, {
    message: 'isbn must be a valid ISBN-10 or ISBN-13',
  })
  isbn!: string;

  // Stored in the database as Book.copiesTotal
  @IsInt()
  @Min(1)
  totalCopies!: number;

  @IsInt()
  @Min(1)
  genreId!: number;

  // Required by the Book model (publishedYear Int)
  @IsInt()
  @Min(1)
  @Max(new Date().getFullYear() + 1)
  publishedYear!: number;
}