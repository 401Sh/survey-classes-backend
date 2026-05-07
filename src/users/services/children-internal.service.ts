import { Injectable, Logger } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { UserChildEntity } from "../entities/user-child.entity"
import { Repository } from "typeorm"
import { IChildrenInternalService } from "../interfaces/children-internal-service.interface"

@Injectable()
export class ChildrenInternalService implements IChildrenInternalService {
    private readonly logger = new Logger(ChildrenInternalService.name)

    constructor(
        @InjectRepository(UserChildEntity)
        private childRepository: Repository<UserChildEntity>
    ) {}

    async existsAndOwnedBy(childId: number, userId: number) {
        const isExists = await this.childRepository.exists({
            where: {
                id: childId,
                user: { id: userId },
            },
        })
    
        return isExists
    }
}