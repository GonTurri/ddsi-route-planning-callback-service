import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentGroup } from '../entities/student-group.entity';
import { RegisterGroupDto } from '../dtos/register-group.dto';
import { RegisterGroupResponseDto } from '../dtos/register-group-response.dto';
import { UpdateCallbackResponseDto } from '../dtos/update-callback-response.dto';
import * as crypto from 'crypto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(StudentGroup)
    private readonly studentGroupRepository: Repository<StudentGroup>,
  ) {}

  async createGroup(dto: RegisterGroupDto): Promise<RegisterGroupResponseDto> {
    const clientSecret = crypto.randomBytes(32).toString('hex');

    const apiKey = crypto.randomUUID();
    const id = crypto.randomUUID();

    const existingGroup = await this.studentGroupRepository.findOneBy({
      groupName: dto.groupName,
    });

    if (existingGroup) {
      throw new ConflictException(
        'El nombre del grupo ya se encuentra registrado.',
      );
    }

    const group = this.studentGroupRepository.create({
      id,
      groupName: dto.groupName,
      callbackUrl: dto.callbackUrl,
      apiKey,
      clientSecret,
    });

    const savedGroup = await this.studentGroupRepository.save(group);

    //todo: mover para que el controller arme el dto response.
    return { apiKey: savedGroup.apiKey, clientSecret };
  }

  //? DOCS: esto permite actualizar la callback del webhook, se utilizan los guards para buscar el grupo.
  async updateCallbackUrl(
    group: StudentGroup,
    callbackUrl: string,
  ): Promise<UpdateCallbackResponseDto> {
    await this.studentGroupRepository.update({ id: group.id }, { callbackUrl });

    return { callbackUrl };
  }

  async findByApiKey(apiKey: string): Promise<StudentGroup | null> {
    return this.studentGroupRepository.findOneBy({ apiKey });
  }
}
