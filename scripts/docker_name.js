const {getTags} = require('./common')

getTags().then(tags => console.log(tags[tags.length-1].split('-').join(':')))