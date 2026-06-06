export function getError(err: unknown): Error {
  if (typeof err == "string") {
    return Error(err)
  }
  if (err instanceof Error) {
    return err
  }
  return Error("Unknown error")
}
