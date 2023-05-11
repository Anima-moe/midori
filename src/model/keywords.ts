import * as app from '@/app.ts'

@app.orm.model()
export class Keyword extends app.SqlTable {
  @app.orm.column({ isPrimaryKey: true, type: 'string' })
  public keyword!: string

  @app.orm.columnType('string')
  public response!: string
}

export default Keyword
export const identifier = 'keyword'
