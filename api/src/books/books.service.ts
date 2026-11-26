import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

export interface FindAllBooksParams {
  genreId?: number;
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBookDto) {
    const { totalCopies, ...rest } = dto;
    try {
      return await this.prisma.book.create({
        data: { ...rest, copiesTotal: totalCopies },
        include: { genre: true },
      });
    } catch (e) {
      this.handleError(e);
    }
  }

  async findAll({ genreId, search, page = 1, limit = 10 }: FindAllBooksParams) {
    const where: Prisma.BookWhereInput = {};

    if (genreId !== undefined) where.genreId = genreId;

    const term = search?.trim();
    if (term) {
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { author: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.book.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'asc' },
        include: { genre: true },
      }),
      this.prisma.book.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: { genre: true },
    });
    if (!book) throw new NotFoundException(`Book ${id} not found`);
    return book;
  }

  async update(id: number, dto: UpdateBookDto) {
    await this.findOne(id);
    const { totalCopies, ...rest } = dto;
    try {
      return await this.prisma.book.update({
        where: { id },
        data: {
          ...rest,
          ...(totalCopies !== undefined && { copiesTotal: totalCopies }),
        },
        include: { genre: true },
      });
    } catch (e) {
      this.handleError(e);
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.book.delete({ where: { id } });
  }

  private handleError(e: unknown): never {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002') throw new ConflictException('A book with this ISBN already exists');
      if (e.code === 'P2003') throw new BadRequestException('genreId does not exist');
    }
    throw e;
  }
}