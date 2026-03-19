import { Body, Controller, Delete, Param, ParseIntPipe, Patch, Post } from "@nestjs/common"
import { ManageDictionariesService } from "../services/manage-dictionaries.service"
import { Roles } from "src/common/decorators/role.decorator"
import { UserRole } from "src/users/enums/user-role.enum"
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam } from "@nestjs/swagger"
import { CreateCategoryBodyDto } from "../dto/create-category-body.dto"
import { UpdateCategoryBodyDto } from "../dto/update-category-body.dto"

@Roles(UserRole.ADMIN, UserRole.MODERATOR)
@Controller("manage/dictionaries")
export class DictionariesController {
    constructor(private manageDictionariesService: ManageDictionariesService) {}

    @ApiBearerAuth()
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