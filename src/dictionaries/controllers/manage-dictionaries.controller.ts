import { Body, Controller, Delete, Param, ParseIntPipe, Patch, Post } from "@nestjs/common"
import { ManageDictionariesService } from "../services/manage-dictionaries.service"
import { Roles } from "src/common/decorators/role.decorator"
import { UserRole } from "src/users/enums/user-role.enum"
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiSecurity } from "@nestjs/swagger"
import { CreateCategoryBodyDto, UpdateCategoryBodyDto } from "../dto"

@Roles(UserRole.ADMIN, UserRole.MODERATOR)
@Controller("manage/dictionaries")
export class ManageDictionariesController {
    constructor(private manageDictionariesService: ManageDictionariesService) {}

    @ApiBearerAuth()
    @ApiSecurity("api-key")
    @ApiOperation({
        summary: "Создание категории",
    })
    @ApiBody({
        description: "Данные для создания категории",
        required: true,
        type: CreateCategoryBodyDto,
    })
    @Post("categories")
    async createCategory(@Body() data: CreateCategoryBodyDto) {
        const result = await this.manageDictionariesService.createCategory(data)

        return result
    }


    @ApiBearerAuth()
    @ApiSecurity("api-key")
    @ApiOperation({
        summary: "Обновление категории",
    })
    @ApiParam({
        name: "categoryId",
        required: true,
        description: "ID категории",
        example: 1,
    })
    @ApiBody({
        description: "Данные для обновления категории",
        required: true,
        type: UpdateCategoryBodyDto,
    })
    @Patch("categories/:categoryId")
    async updateCategory(
        @Param("categoryId", ParseIntPipe) categoryId: number,
        @Body() data: UpdateCategoryBodyDto,
    ) {
        await this.manageDictionariesService.updateCategory(categoryId, data)

        return {
            message: "Category updated successfully",
        }
    }


    @ApiBearerAuth()
    @ApiSecurity("api-key")
    @ApiOperation({
        summary: "Удаление категории",
    })
    @ApiParam({
        name: "categoryId",
        required: true,
        description: "ID категории",
        example: 1,
    })
    @Delete("categories/:categoryId")
    async deleteCategory(@Param("categoryId", ParseIntPipe) categoryId: number) {
        await this.manageDictionariesService.deleteCategory(categoryId)
 
        return {
            message: "Category deleted successfully",
        }
    }
}