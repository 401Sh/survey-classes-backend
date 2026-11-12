import { Injectable } from "@nestjs/common"
import { IChildrenInternalService } from "../interfaces/children-internal-service.interface"
import { ChildRepository } from "../abstracts/child-repository.abstract"

@Injectable()
export class ChildrenInternalService implements IChildrenInternalService {
    constructor(private readonly childRepository: ChildRepository) {}

    async existsAndOwnedBy(childId: number, userId: number) {
        const isChildExists = await this.childRepository.existsByIdAndUserId(childId, userId)
    
        return isChildExists
    }
}