var http = require('http')
const { spawn } = require('node:child_process');

const api = (path, method = 'GET', json) => new Promise(resolve => 
{
    let request = http.request(
        {
            host: `api.tracker.yandex.net`, path, method,
            headers: {'Authorization': `OAuth ${process.env.TOKEN}`, 'X-Org-ID': `${process.env.ORG_ID}`}
        }, 
        res => 
        {
            let str = ''
            res.on('data', chunk => str += chunk);      
            res.on('end', () => resolve(JSON.parse(str)));
        });

    request.end(json && JSON.stringify(json))
})

// api('/v2/myself')
//     .then(json => console.log(json))

// api('/v2/issues/HOMEWORKSHRI-192')
//     .then(json => console.log(json))


// const { exec } = require("child_process");
// exec('git --version', (error, stdout, stderr) => 
// {
//     console.log(stdout)
// })

const callCommand = (command) => new Promise(resolve => 
    {
        let parts = command.split(' ')
        const subprocess = spawn(parts[0], parts.slice(1));
        let str = ''
        subprocess.stdout.on('data', data => str += data);
        subprocess.stdout.on('end', () => resolve(str))
    })

const getLastCommitAuthor = () => 
    new Promise(resolve => 
        callCommand('git log --name-status HEAD^..HEAD').then(data => 
            resolve(data.split('\n').find(x => x.includes('Author: ')).split('Author: ').join(''))))

getLastCommitAuthor().then(name => console.log(name))

const getTags = () => 
    new Promise(resolve => 
        callCommand('git tag -l rc-*').then(data => 
            resolve(data.trim().split('\n'))))

getTags().then(tags => console.log(tags))

const getCommitMessagesBetweenTags = (tag1, tag2) => 
    new Promise(resolve => 
        callCommand(`git log --pretty=short ${tag1}...${tag2}`).then(data => 
            resolve(data.split('commit ').filter(x => x).map(x => (
                {
                    commit: x.split('\n')[0],
                    author: x.split('\n')[1].split('Author: ').join(''),
                    message: x.split('\n').slice(3).map(x => x.trim()).filter(x => x).join('\n')
                })
    ))))

getCommitMessagesBetweenTags('rc-0.0.1', 'rc-0.0.4').then(data => console.log(data))

// let date = new Date();

// api('/v2/issues/HOMEWORKSHRI-192', 'PATCH', 
// {
//     'summary': `Релиз №${process.env.VERSION} от ${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`,
//     'description' : `Ответственный за релиз: Vadim Grigoruk
//     Коммиты, попавшие в релиз:
//     Vadim Grigoruk-review fixes
//     Vadim Grigoruk-add docs
//     Vadim Grigoruk-add tests
//     Vadim Grigoruk-fix`
// }).then(json => console.log(json))
