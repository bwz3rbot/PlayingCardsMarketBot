const scoreIncrement = require('./util/scoreIncrement');
let promiseObj = {};

let requester;
async function doSomething(item, r) {
    requester = r;
    console.log("do something got this requester: ", requester);
    // Process the item
    await checkMasterSub(item)
        .then((item) => checkTopLevel(item))
        .then((promiseObj) => getReleventItem(promiseObj))
        .then((releventItem) => designateFlairs(releventItem))
        .then((msg) => replyWithMessage(msg))
        .then(() => saveItem(item))
        .then(() => {
            console.log(`item '${item.id}' successfully processed!`.green)
        })
        .catch((err) => {
            if (err.id != 0) {
                replyWithMessage(err)
                    .then(() => saveItem(item))
                    .then(() => {
                        console.log(`item '${item.id}' successfully processed!`.green)
                    });
            } else {
                saveItem(item)
                    .then(() => {
                        console.log(err.message)
                    });

            }
        });

    return ""
}

//// PlayingCardsMarket Bot
///
//


const MASTER_SUB = process.env.MASTER_SUB;
// 1. Check that mention received is from MASTER_SUB
const checkMasterSub = function (item) {
    // If mention from master sub, continue processing
    if (item.subreddit_name_prefixed === 'r/' + MASTER_SUB && item.parent_id != null) {
        return Promise.resolve(item)

        // else reject with error message
    } else {
        console.log(`was from ${item.subreddit_name_prefixed}. Rejecting!`.red)
        err = {
            id: 0,
            message: "Attempted request from unauthorized sub."

        }
        return Promise.reject(err)
    }
}

// 2. Check if top level or comment reply
const checkTopLevel = function (item) {
    const regexP = RegExp(/^t3_/)
    promiseObj.mention = item;
    promiseObj.wasTopLevel = regexP.test(item.parent_id);
    promiseObj.mention.parent_id = splitParentId(item.parent_id);

    return Promise.resolve(promiseObj)

}

// 2-A Split Parent ID
const splitParentId = function (id) {
    let splitResult = id.split('_')[1];
    return splitResult;
}

// 3. Get Comment OR Submission
const releventItem = {}
const getReleventItem = async function (promiseObj) {
    parent_id = promiseObj.mention.parent_id
    wasTopLevel = promiseObj.wasTopLevel
    // If was top level:
    if (promiseObj.wasTopLevel) {
        console.log('was a top level comment. fetching the submission'.magenta)
        const submission = await fetchSubmission(promiseObj.mention.parent_id)
        releventItem.submission = submission
        releventItem.childComment = promiseObj.mention

        return Promise.resolve(releventItem)

        // If was not top level:
    } else if (!promiseObj.wasTopLevel) {
        console.log('was not top level comment. fetching the parent comment'.magenta)
        const comment = await fetchComment(promiseObj.mention.parent_id)

        releventItem.submission = comment
        releventItem.childComment = promiseObj.mention
        releventItem.wasTopLevel = promiseObj.wasTopLevel

        return Promise.resolve(releventItem)

    }

}

// 3-A Fetch the Submission
const fetchSubmission = function (id) {
    return requester.getSubmission(id).fetch()
}
// 3-B Fetch The Comment
const fetchComment = function (id) {
    return requester.getComment(id).fetch()
}


// 4. Assign Flairs OR Reject the Request
async function designateFlairs(releventItem) {

    console.log(`referencing u/${releventItem.submission.author.name}`.yellow)

    if (releventItem.submission.author.name === releventItem.childComment.author.name) {
        console.log('USER ATTEMPTED TO VOTE ON SELF!'.red)
        err = {
            id: releventItem.childComment.id,
            message: "Nice try! You can't vote on yourself!"
        }
        return Promise.reject(err)
    }


    let author_flair = String;
    directive = promiseObj.mention.body;

    // If no direcive, ignore request.
    if (!directive.includes('!neutral') && !directive.includes('!positive') && !directive.includes('!negative')) {

        message =
            `You need to give me a direction!  
            
            To cast your vote successfully:  
            
            u/${process.env.REDDIT_USER} !positive
            u/${process.env.REDDIT_USER} !neutral
            u/${process.env.REDDIT_USER} !negative`;

        console.log('DID NOT INCLUDE A DIRECTIVE. REJECTING WITH MESSAGE...'.red);
        err = {
            id: releventItem.childComment.id,
            message: message
        }
        return Promise.reject(err);

    }


    // else, designate the flairs
    const userFlair = await requester.getSubreddit(process.env.MASTER_SUB).getUserFlair(releventItem.submission.author.name);

    flair = userFlair.flair_text;

    if (flair == undefined | flair == '') {
        author_flair = 'Positive: 0 Neutral: 0 Negative: 0';
    } else {
        author_flair = flair;
    }

    if (directive.includes('!positive')) {
        console.log(`incrementing positive count`.green);
        newFlair = scoreIncrement.incrementPositiveCount(author_flair);
    }

    if (directive.includes('!negative')) {
        console.log(`incrementing negative count`.red);
        newFlair = scoreIncrement.incrementNegativeCount(author_flair);
    }
    if (directive.includes('!neutral')) {
        console.log('incrementing neutral count'.grey);
        newFlair = scoreIncrement.incrementNeutralCount(author_flair);
    }

    message = 'Thanks for your input! Your vote has been accounted for.'

    await assignFlair(releventItem.submission.author.name, newFlair);

    console.log(`sucessfully updated user flair!`.yellow);
    msg = {
        id: releventItem.childComment.id,
        message: message

    }
    return Promise.resolve(msg);

}

async function assignFlair(author, flair) {
    console.log(`new flair: `.magenta + flair.grey);

    const userFlair = await requester.getUser(author).assignFlair({
        subredditName: MASTER_SUB,
        text: flair,
        cssClass: process.env.FLAIR_CSS_CLASS
    })
    return Promise.resolve(userFlair);
}

const replyWithMessage = function (msg) {
    console.log(`replying with message:`.magenta);
    console.log(msg.message.grey);
    return requester.getComment(msg.id).reply(msg.message);

}




// 
// Leave this function alone!
const saveItem = function (item) {
    return requester.getComment(item.id).save();
}
module.exports = {
    doSomething
}