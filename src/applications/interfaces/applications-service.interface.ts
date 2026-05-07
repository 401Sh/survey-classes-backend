import { CreateApplicationBodyDto } from "../dto/create-application-body.dto"
import { UpdateApplicationBodyDto } from "../dto/update-application-body.dto"
import { ApplicationEntity } from "../entities/application.entity"

export interface IApplicationsService {
    create(userId: number, data: CreateApplicationBodyDto): Promise<ApplicationEntity>
    findAll(userId: number): Promise<ApplicationEntity[]>
    findById(userId: number, applicationId: number): Promise<ApplicationEntity>
    update(userId: number, applicationId: number, data: UpdateApplicationBodyDto): Promise<void>
}