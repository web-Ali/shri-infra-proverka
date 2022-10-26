const {api, getTags, getLastCommitAuthor, getCommitMessagesBetweenTags} = require('./common')

async function main()
{
    let date = new Date()
    let tags = await getTags()

    console.log(`INFO: Получили список релизных тегов:`)
    console.log(tags)
    
    let lastTag = tags.slice(-1)[0]
    let version = lastTag.split('rc-').join('')

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

    let editResult = await api(`/v2/issues/${process.env.ISSUE}`, 'PATCH', ticket)

    console.log('INFO: Получили ответ от трекера:')
    console.log(editResult)

    let comment = 
    {
        text:`Собрали образ с тегом rc:${version}`
    }

    let commentResult = await api(`/v2/issues/${process.env.ISSUE}/comments`, 'POST', comment)

    console.log('INFO: Трекер создал комментарий:')
    console.log(commentResult)
}

main()
