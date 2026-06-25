export interface ILessonsInternalService {
    exists(id: number): Promise<boolean>
}