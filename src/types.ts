export interface SearchPriceParams {
    width: number
    height: number
}

export enum ApiError {
    InvalidWidth = "INVALID_WIDTH",
    InvalidHeight = "INVALID_HEIGHT"
}

export type Limitation = [number, number]
export type ApiResponse<T> = { success: true, data: T } | { success: false, error: ApiError }

export interface PriceData {
    clothPrices: Record<string, Array<{ cloth_type: string, cloth: string, price: number }> | null>,
    railPrices: Array<{ rail_type: string, method: string } & ({ price: number } | { width: Limitation, height: Limitation })>
    width: number,
    height: number
}
