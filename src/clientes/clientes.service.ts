import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Cliente from './entities/cliente.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private clienteRepository: Repository<Cliente>,
  ) {}

  async create(createClienteDto: CreateClienteDto): Promise<Cliente> {
    const cliente = this.clienteRepository.create(createClienteDto);
    return await this.clienteRepository.save(cliente);
  }

  async findAll(): Promise<Cliente[]> {
    return await this.clienteRepository.find({
      where: { disponible: true },
      order: { fechaRegistro: 'DESC' }
    });
  }

  async findOne(id: number): Promise<Cliente | null> {
    return await this.clienteRepository.findOne({
      where: { id, disponible: true }
    });
  }

  async update(id: number, updateClienteDto: UpdateClienteDto): Promise<Cliente | null> {
    await this.clienteRepository.update(id, updateClienteDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.clienteRepository.update(id, { disponible: false });
  }
}
