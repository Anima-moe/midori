import * as app from '@/app.ts'

@app.orm.model()
export class Keyword extends app.SqlTable {
  /**
  * \<<LOCALE_KEYWORD>>serverid$$keyword$$keyword
  **/
  @app.orm.column({ isPrimaryKey: true, type: 'string' })
  public locale_serverId_keyword!: string

  @app.orm.columnType('string')
  public response!: string
}

export default Keyword
export const identifier = 'keyword'
