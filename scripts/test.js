var http = require('http')

const api = path => new Promise(resolve => 
{
    http.request(
        {
            host: `api.tracker.yandex.net`, path,
            headers: {'Authorization': `OAuth ${process.env.TOKEN}`, 'X-Org-ID': `${process.env.ORG_ID}`}
        }, 
        res => 
        {
            let str = ''
            res.on('data', chunk => str += chunk);      
            res.on('end', () => resolve(JSON.parse(str)));
        }).end();
})

api('/v2/myself')
    .then(json => console.log(json))
