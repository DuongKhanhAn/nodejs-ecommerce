const mysql = require('mysql2')

// createa connection to pool server
const pool = mysql.createPool({
    host: '127.0.0.1', 
    port: 8811, 
    user: 'tester',  
    password: 'password123', 
    database: 'shopDEV_test', 
    waitForConnections: true,
    connectionLimit: 5
})

const batchSize = 100000; // adjust batch size
const totalSize = 10000000 //1_000_000; :::::::::::TIMMER::: 9.096s // 10_000_000 :::::::::::TIMMER::: 1:23.137 (m:ss.mmm)

let currentId = 1;

console.time(':::::::::::TIMMER::')
const insertBatch = async () => {
    const values = [];
    for (let i = 0; i < batchSize  && currentId <= totalSize; i++) {
        const name = `name-${currentId}`
        const age = currentId
        const address = `address-${currentId}`
        values.push([currentId, name, age, address])
        currentId++;
        
    }

    if(!values.length){
        console.timeEnd(':::::::::::TIMMER::')
        pool.end( err => {
            if(err){
                console.log(`error occurred while running batch`);
            }else{
                console.log(`Connection pool closed successfully`);
            }
        })
        return;
    }
    const sql = `INSERT INTO test_table (id, name, age, address) VALUES ?`

    pool.query(sql, [values], async function (err, results) {
        if (err) throw err
        console.log(`Inserted ${results.affectedRows} records`);
        await insertBatch()
    })
}

insertBatch().catch(console.error)

// // perform a sample operation
// // pool.query('SELECT 1 + 1 AS solution', function (err, results) {
// pool.query('SELECT * from users', function (err, results) {
//     if (err) throw err

//     console.log(`query result:`, results);
//     // close pool connection
//     pool.end(err => {
//     if (err) throw err
//     console.log(`connection closed:`);
//     })
// })
