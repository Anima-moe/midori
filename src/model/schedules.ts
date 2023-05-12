import * as app from '@/app.ts'

@app.orm.model()
export class Schedule extends app.SqlTable {
  @app.orm.column({ isPrimaryKey: true, type: 'integer' })
  public animeID!: number

  @app.orm.columnType('string')
  public cronjob!: string
}

export default Schedule
export const identifier = 'schedule'
