/**
 * Cuerpo de error tipado del BFF (no stack crudo).
 */
export type BffErrorCode =
  'bad_request' | 'upstream_unavailable' | 'upstream_bad_response'

export type BffErrorBody = {
  ok: false
  code: BffErrorCode
  message: string
}
