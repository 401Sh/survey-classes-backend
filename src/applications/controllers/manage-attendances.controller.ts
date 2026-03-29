import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Query } from "@nestjs/common"
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam } from "@nestjs/swagger"
import { UpdateAttendanceBodyDto } from "../dto/update-attendance-body.dto"
import { ManageAttendancesService } from "../services/manage-attendances.service"
import { GetAttendanceBodyDto } from "../dto/get-attendance-body.dto"

@Controller("manage/attendances")
export class ManageAttendancesController {
    constructor(private attendancesService: ManageAttendancesService) {}

    @ApiBearerAuth()
    @ApiOperation({
        summary: "Получение всех посещений занятий",
    })
    @Get()
    async findAll(@Query() query: GetAttendanceBodyDto) {
        const result = await this.attendancesService.findAll(query)

        return result
    }


    @ApiBearerAuth()
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