import { Controller, Delete, Get, Patch, Post } from "@nestjs/common"
import { ManageSurveysService } from "./manage-surveys.service"
import { Roles } from "src/common/decorators/role.decorator"
import { UserRole } from "src/users/enums/user-role.enum"

@Roles(UserRole.ADMIN, UserRole.MODERATOR)
@Controller("manage/surveys")
export class ManageSurveysController {
    constructor(private manageSurveysService: ManageSurveysService) {}

    @Post()
    async create() {}


    @Get()
    async findAll() {}


    @Get(":surveysId")
    async findById() {}


    @Patch(":surveysId")
    async update() {}


    @Delete(":surveysId")
    async remove() {}
}