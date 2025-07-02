import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from 'generated/prisma';
import { PaginationDto } from 'src/common';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {

  public readonly logger = new Logger('ProductsService');

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
  }

  create(createProductDto: CreateProductDto) {
    return this.product.create({ data: createProductDto });
  }

  async findAll(paginationDto: PaginationDto) {

    const { page, limit } = paginationDto;

    const count = await this.product.count({ where: { available: true } });
    const lastPage = Math.ceil(count / limit);

    return {
      data: await this.product.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: { available: true }
      }),
      meta: {
        total: count,
        lastPage: lastPage,
        page: page
      }
    };
  }

  async findOne(id: number) {
    const product = await this.product.findFirst({ where: { id, available: true } });

    if (!product) {
      throw new NotFoundException(`Product with id #${id} not found`)
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    await this.findOne(id);

    const { id: __, ...updatedProduct } = updateProductDto

    return this.product.update({
      where: { id },
      data: updatedProduct
    })
  }

  async remove(id: number) {
    await this.findOne(id);

    // return this.product.delete({
    //   where: { id }
    // })

    return this.product.update({
      where: { id },
      data: { available: false }
    })
  }
}
