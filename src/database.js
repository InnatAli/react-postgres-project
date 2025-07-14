const { Client } = require('pg');

const client = new Client ({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "mypg123",
    database: "postgres"
});
client.connect()
.then(()=>{
    console.log("Connected!");
return client.query('SELECT * FROM "users"');
})
.then(result =>{ 
        console.log(result.rows);
})
.catch(err => {
    console.error("Error: ", err.message);
})
.finally(() =>{
    client.end();
});