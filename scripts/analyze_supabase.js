import postgres from 'postgres';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// 1. 환경변수 기능
// - .env 파일에서 데이터를 로드합니다.
dotenv.config();

// 2. 초기화 기능
// - Postgres와 Supabase Storage API 클라이언트를 초기화합니다.
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const connectionString = process.env.SUPABASE_DB_URL;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const sql = postgres(connectionString);

async function analyzeDatabase() {
    try {
        console.log('\n--- 1. 스토리지 버킷 검사 (Storage Buckets) ---');
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
        if (bucketError) throw bucketError;

        for (const bucket of buckets) {
            console.log(`\n버킷 이름: ${bucket.name}`);
            const { data: files, error: fileError } = await supabase.storage.from(bucket.name).list();
            if (fileError) {
                console.error(`버킷 ${bucket.name} 읽기 실패:`, fileError.message);
                continue;
            }

            console.log(`파일 목록 (${files.length}개):`);
            files.slice(0, 10).forEach(f => console.log(`  - ${f.name} (크기: ${f.metadata?.size || '알 수 없음'} bytes)`));
            if (files.length > 10) console.log(`  ... 외 ${files.length - 10}개`);
        }

        console.log('\n--- 2. DB 테이블 스키마 검사 (Table Schema) ---');
        const tables = await sql`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;

        if (tables.length === 0) {
            console.log('public 스키마에 생성된 테이블이 없습니다.');
        }

        for (const table of tables) {
            console.log(`\n테이블 이름: ${table.table_name}`);

            const columns = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = ${table.table_name}
      `;
            console.log('  컬럼 목록:');
            columns.forEach(c => console.log(`    - ${c.column_name} (${c.data_type}, Nullable: ${c.is_nullable})`));

            const rowCount = await sql`SELECT count(*) FROM ${sql(table.table_name)}`;
            console.log(`  총 데이터 수: ${rowCount[0].count}건`);
        }

        console.log('\n--- 3. 인덱스 검사 (Indexes) ---');
        const indexes = await sql`
      SELECT tablename, indexname, indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
    `;

        if (indexes.length === 0) {
            console.log('생성된 커스텀 인덱스가 없습니다.');
        } else {
            indexes.forEach(idx => {
                console.log(`\n테이블: ${idx.tablename} | 인덱스: ${idx.indexname}`);
                console.log(`정의: ${idx.indexdef}`);
            });
        }

    } catch (error) {
        console.error('분석 중 에러 발생:', error);
    } finally {
        await sql.end();
    }
}

analyzeDatabase();
