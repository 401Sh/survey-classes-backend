export interface IChildrenInternalService {
    existsAndOwnedBy(childId: number, userId: number): Promise<boolean>
}