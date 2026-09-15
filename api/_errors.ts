import type { BffErrorBody, BffErrorCode } from '../shared/errors.js'

export class BffError extends Error {
  readonly status: number
  readonly code: BffErrorCode

  constructor(status: number, code: BffErrorCode, message: string) {
    super(message)
    this.name = 'BffError'
    this.status = status
    this.code = code
  }

  toBody(): BffErrorBody {
    return { ok: false, code: this.code, message: this.message }
  }
}

export function jsonError(error: BffError): Response {
  return Response.json(error.toBody(), {
    status: error.status,
    headers: { 'cache-control': 'no-store' },
  })
}
