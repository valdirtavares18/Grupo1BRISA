import { Pool } from 'pg'

const pool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'presenca_eventos',
  password: 'postgres',
  port: 5433,
})

pool.on('error', (err) => {
  console.error('❌ [DB Pool] Unexpected error:', err)
})

pool.on('connect', () => {
  console.log('✅ [DB Pool] Connected to database')
})

export const query = async (text: string, params?: any[]) => {
  console.log('🔷 [DB Query]', text.substring(0, 100) + '...')
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log('✅ [DB Query] Executed in', duration, 'ms')
    return res
  } catch (error) {
    const duration = Date.now() - start
    console.error('❌ [DB Query] Failed after', duration, 'ms:', error)
    throw error
  }
}

export default pool