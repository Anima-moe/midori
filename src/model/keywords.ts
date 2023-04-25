import { orm, SqlTable } from '@/deps.ts'

@orm.model()
export class Keyword extends SqlTable {
  @orm.column({ isPrimaryKey: true, type: 'string' })
  public keyword!: string

  @orm.columnType('string')
  public response!: string
}

export default Keyword
export const identifier = 'keyword'
