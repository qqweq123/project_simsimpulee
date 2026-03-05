/**
 * Supabase 데이터베이스 및 스토리지 진단 스크립트
 * - Storage 버킷 및 파일 목록 조회
 * - DB 테이블 스키마 (컬럼, 타입, nullable) 조회
 * - 인덱스 및 Foreign Key 조회
 * - RLS 정책 조회
 * - 결과를 JSON 파일로 저장
 */
import postgres from 'postgres';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const connectionString = process.env.SUPABASE_DB_URL;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const sql = postgres(connectionString);

/** 스토리지 버킷 및 파일 스캔 기능 */
async function scanStorage() {
    const result = [];
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) return { error: error.message };

    for (const bucket of buckets) {
        const bucketInfo = { name: bucket.name, public: bucket.public, files: [] };
        const { data: files, error: fileErr } = await supabase.storage.from(bucket.name).list('', { limit: 100 });
        if (!fileErr && files) {
            for (const f of files) {
                if (f.id) {
                    bucketInfo.files.push({ name: f.name, size: f.metadata?.size || null, mimetype: f.metadata?.mimetype || null });
                } else {
                    // 폴더인 경우 내부 파일 목록 스캔
                    const { data: subFiles } = await supabase.storage.from(bucket.name).list(f.name, { limit: 100 });
                    const sub = (subFiles || []).filter(sf => sf.id).map(sf => ({
                        name: `${f.name}/${sf.name}`, size: sf.metadata?.size || null, mimetype: sf.metadata?.mimetype || null
                    }));
                    bucketInfo.files.push(...sub);
                }
            }
        }
        result.push(bucketInfo);
    }
    return result;
}

/** DB 테이블 스키마 스캔 기능 */
async function scanSchema() {
    const tables = await sql`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `;

    const result = [];
    for (const t of tables) {
        const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = ${t.table_name}
      ORDER BY ordinal_position
    `;
        const rowCount = await sql`SELECT count(*)::int as cnt FROM ${sql(t.table_name)}`;
        result.push({
            table: t.table_name,
            row_count: rowCount[0].cnt,
            columns: columns.map(c => ({
                name: c.column_name, type: c.data_type, nullable: c.is_nullable === 'YES', default: c.column_default
            }))
        });
    }
    return result;
}

/** 인덱스 스캔 기능 */
async function scanIndexes() {
    return await sql`
    SELECT tablename, indexname, indexdef
    FROM pg_indexes WHERE schemaname = 'public'
    ORDER BY tablename, indexname
  `;
}

/** Foreign Key 스캔 기능 */
async function scanForeignKeys() {
    return await sql`
    SELECT
      tc.table_name, kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
  `;
}

/** RLS 정책 스캔 기능 */
async function scanRLS() {
    return await sql`
    SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
    FROM pg_policies WHERE schemaname = 'public'
  `;
}

/** 메인 실행 기능 */
async function main() {
    try {
        const report = {
            storage: await scanStorage(),
            schema: await scanSchema(),
            indexes: await scanIndexes(),
            foreign_keys: await scanForeignKeys(),
            rls_policies: await scanRLS()
        };
        const outPath = resolve(__dirname, '..', 'supabase_report.json');
        writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf-8');
        console.log('Report saved to: ' + outPath);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await sql.end();
    }
}

main();
