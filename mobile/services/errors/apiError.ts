export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = "ApiError"
  }

  static async fromResponse(res: Response): Promise<ApiError> {
    const body = await res.json().catch(() => ({}))
    return new ApiError(
      res.status,
      body.error ?? `Request failed: ${res.status}`,
    )
  }
}
