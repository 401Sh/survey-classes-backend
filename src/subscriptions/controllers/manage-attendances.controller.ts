import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Query } from "@nestjs/common"
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiSecurity } from "@nestjs/swagger"
import { ManageAttendancesService } from "../services/manage-attendances.service"
import { GetAttendanceListQueryDto, UpdateAttendanceBodyDto } from "../dto"

@Controller("manage/attendances")
export class ManageAttendancesController {
    constructor(private attendancesService: ManageAttendancesService) {}

    @ApiBearerAuth()
    @ApiSecurity("api-key")
    @ApiOperation({
        summary: "Получение всех посещений занятий",
    })
    @Get()
    async findAll(@Query() query: GetAttendanceListQueryDto) {
        const result = await this.attendancesService.findAll(query)

        return result
    }


    @ApiBearerAuth()
    @ApiSecurity("api-key")
    @ApiOperation({
        summary: "Обновление данных посещения занятия",
    })
    @ApiParam({
        name: "attendanceId",
        required: true,
        description: "ID посещения занятия",
        example: 1,
    })
    @ApiBody({
        description: "Данные для обновления посещения",
        required: true,
        type: UpdateAttendanceBodyDto,
    })
    @Patch(":attendanceId")
    async update(
        @Param("attendanceId", ParseIntPipe) attendanceId: number,
        @Body() data: UpdateAttendanceBodyDto,
    ) {
        await this.attendancesService.update(attendanceId, data)

        return {
            message: "Attendance updated successfully",
        }
    }


    @ApiBearerAuth()
    @ApiSecurity("api-key")
    @ApiOperation({
        summary: "Удаление посещения занятия",
    })
    @ApiParam({
        name: "attendanceId",
        required: true,
        description: "ID посещения занятия",
        example: 1,
    })
    @Delete(":attendanceId")
    async remove(@Param("attendanceId", ParseIntPipe) attendanceId: number) {
        await this.attendancesService.delete(attendanceId)

        return {
            message: "Attendance deleted successfully"
        }
    }
}