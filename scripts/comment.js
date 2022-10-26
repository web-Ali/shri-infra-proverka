const {api, getTags} = require('./common')

async function main()
{
    let tags = await getTags()

    console.log(`INFO: Получили список релизных тегов:`)
    console.log(tags)
    
    let lastTag = tags.slice(-1)[0]
    let version = lastTag.split('rc-').join('')

    let comment = 
    {
        text:`Собрали образ с тегом rc:${version}`
    }

    let commentResult = await api(`/v2/issues/${process.env.ISSUE}/comments`, 'POST', comment)

    console.log('INFO: Трекер создал комментарий:')
    console.log(commentResult)
}

main()
