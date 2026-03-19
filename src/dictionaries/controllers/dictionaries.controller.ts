import { Controller, Get } from "@nestjs/common"
import { DictionariesService } from "../services/dictionaries.service"
import { ApiBearerAuth, ApiOperation } from "@nestjs/swagger"

@Controller("dictionaries")
export class DictionariesController {
    constructor(private dictionariesService: DictionariesService) {}

    @ApiBearerAuth()
    @ApiOperation({
        summary: "Получение списка категорий",
    })
    @Get("categories")
    async findAllCategories() {
        return this.dictionariesService.findAllCategories()
    }
}