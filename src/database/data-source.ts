import { DataSource } from "typeorm"
import { dataSourceOptions } from "../common/configs/typeorm.config"

// only for typeorm CLI (migrations and generations)
export default new DataSource({
    ...dataSourceOptions,
    migrations: ["dist/database/migrations/*.js"],
})