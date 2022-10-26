var http = require('http')
const { spawn } = require('node:child_process')

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

const callCommand = (command) => new Promise(resolve => {
    let parts = command.split(' ')
    const subprocess = spawn(parts[0], parts.slice(1));
    let str = ''
    subprocess.stdout.on('data', data => str += data);
    subprocess.stdout.on('end', () => resolve(str))
})

const getLastCommitAuthor = async () => 
        (await callCommand('git log HEAD^...HEAD'))
            .split('\n')[1].split('Author: ').join('')

const getTags = async () => 
        (await callCommand('git tag -l rc-*'))
            .trim().split('\n')

const tagsRange = (tags) => 
    tags.length == 1 ? tags[0] : `${tags[0]}...${tags[1]}`

const getCommitMessagesBetweenTags = async (tags) => 
    (await callCommand(`git log --pretty=short ${tagsRange(tags)}`))
        .split('commit ').filter(x => x).map(x => ({
                commit: x.split('\n')[0],
                author: x.split('\n')[1].split('Author: ').join(''),
                message: x.split('\n').slice(3).map(x => x.trim()).filter(x => x).join('\n')
            })
        )

async function main()
{
    const VersionPrefix = 'rc-'

    let date = new Date()
    let tags = await getTags()

    console.log(`INFO: Получили список релизных тегов:`)
    console.log(tags)
    
    let lastTag = tags.slice(-1)[0]
    let version = lastTag.split(VersionPrefix).join('')

    let ticket = 
    {
        summary: `Релиз №${version} от ${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`,
        description:
`Ответственный за релиз: ${await getLastCommitAuthor()}
---
Коммиты, попавшие в релиз:
${(await getCommitMessagesBetweenTags(tags.slice(-2))).map(x => `\`${x.commit.substring(0, 8)}\` ${x.author} ${x.message}`).join('\n\n')}`
    }

    console.log(`INFO: Сформировали объект тикета для отправки в трекер:`)
    console.log(ticket)

    let res = await api('/v2/issues/HOMEWORKSHRI-192', 'PATCH', ticket)

    console.log('INFO: Получили ответ от трекера:')
    console.log(res)
}

main()
