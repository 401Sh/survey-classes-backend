import { PaginatedResult } from "src/common/interfaces/paginated-result.interface"
import { GetApplicationListQueryDto } from "../dto/get-application-list-query.dto"
import { ApplicationEntity } from "../entities/application.entity"

export interface IManageApplicationsService {
    findAll(query: GetApplicationListQueryDto): Promise<PaginatedResult<ApplicationEntity>>
    findById(id: number): Promise<ApplicationEntity>
    approve(applicationId: number): Promise<void>
    reject(applicationId: number): Promise<void>
}