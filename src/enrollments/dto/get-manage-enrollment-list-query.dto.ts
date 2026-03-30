import { ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsInt, IsOptional } from "class-validator"
import { GetEnrollmentListQueryDto } from "./get-enrollment-list-query.dto"

export class GetManageEnrollmentListQueryDto extends GetEnrollmentListQueryDto {
    @ApiPropertyOptional({
        description: "ID родителя",
        example: 1,
        type: Number,
    })
    @Type(() => Number)
    @IsInt()
    @IsOptional()
    parentId?: number
}