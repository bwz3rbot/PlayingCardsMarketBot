const dotenv = require('dotenv').config({
    path: "pw.env"
});
const colors = require('colors');
const Snoolicious = require('./lib/Snoolicious');
const snoolicious = new Snoolicious();
const Database = require('./data/sqlite.config');
// const db = new Database('saved');
const Snoowrap = require('snoowrap');
const scoreIncrement = require('./util/scoreIncrement');
/* 
    [Handle Command]
        - This function must be passed in as the first argument to snoolicious.queryTasks()
        - handleCommand be awaited by Snoolicious for each command dequeued from the task queue
        - This will be true when calling either the getCommands or getMentions functions, as they both return built commands
        - Reddit Submission objects do not contain a body key, rather they will be sent to the handleSubmissions function instead

        [Command Task Object]
            - The Command Task object will be passed to this function with these key/value pairs:
                task: {
                    command: { 
                        directive,
                        [arg1, arg2, arg3, ...]
                    },
                    item: {
                        <Reddit Comment Object>
                    },
                    priority: <Number you set when calling getCommands or getMentions>,
                    time: <new Date().getTime()>
                }
*/
async function handleCommand(task) {

    const id = `${task.item.parent_id}${task.item.id}${task.item.created_utc}`;
    // const checkedId = await db.checkID(id);
    if ((task.item.subreddit.display_name === process.env.MASTER_SUB)) {
        try {
            console.log(`received new command from u/${task.item.author.name}`.yellow);
            console.log(task.command);
            validateCommand(task.command);
            const parent = await getParentSubmission(task.item);
            const parentUsername = checkUserRatingSelf(parent, task.item.author.name);
            await grantUserFlairs(parentUsername, task.command.directive);
            console.log(`sucessfully updated u/${parentUsername}'s flair!`.green);
        } catch (err) {
            if (err) {
                await replyWithError(err.message, task.item.id);
            } else {
                // Reply with success message
                await replyWithSuccess(task.item.id);
            }


        }


        // Save to the db as already seen.
        // await db.saveID(id);
    }
    console.log("Size of the queue: ".gray, snoolicious.tasks.size());
}

/* [Validate Command] */
const validateCommand = function (command) {
    console.log("validating command...".magenta)
    if (
        (command.directive === 'positive') |
        (command.directive === 'neutral') |
        (command.directive === 'negative')) {} else {
        console.log("command not understood error".red);
        throw new Error(message = 'Command not understood!');
    }
}

/* [Get Parent Submission] */
async function getParentSubmission(item) {
    console.log("getting the parent submission...".magenta);
    if (item.parent_id.startsWith('t3_')) {
        const rep = item.parent_id.replace('t3_', '');
        const P = await snoolicious.requester.getSubmission(rep).fetch();
        return {
            isSubmission: true,
            item: P
        }
    } else if (item.parent_id.startsWith('t1_')) {
        const rep = item.parent_id.replace('t1_', '');
        const P = await snoolicious.requester.getComment(rep).fetch();
        return {
            isSubmission: false,
            item: P
        }
    }
}

/* [Check User Rating Self] */
function checkUserRatingSelf(parent, itemAuthorName) {
    console.log("validating user not rating on self...".magenta);
    switch (parent.isSubmission) {
        case (true):
            if (parent.item.author === itemAuthorName) {
                console.log(`user ${itemAuthorName} tried to rate themselves!`.red);
                throw new Error(message = "No, no, no! You cant rate yourself!");
            } else {
                return parent.item.author;
            }
            case (false):
                if (parent.item.author.name === itemAuthorName) {
                    console.log(`user ${itemAuthorName} tried to rate themselves!`.red);
                    throw new Error(message = "No, no, no! You cant rate yourself!");
                } else {
                    return parent.item.author.name;
                }
    }
}

/*
    [Grant User Flairs]
        - Takes in a parent submisson or comment,
*/
async function grantUserFlairs(parent, directive) {
    console.log("Granting user flairs...".magenta);
    // else, designate the flairs
    const userFlair = await snoolicious.requester.getSubreddit(process.env.MASTER_SUB).getUserFlair(parent);

    flair = userFlair.flair_text;
    let previousFlair;
    if (flair == undefined | flair == '') {
        previousFlair = 'Positive: 0 Neutral: 0 Negative: 0';
    } else {
        previousFlair = flair;
    }

    let newFlair = undefined;
    if (directive === 'positive') {
        newFlair = scoreIncrement.incrementPositiveCount(previousFlair);
    }

    if (directive === 'negative') {
        newFlair = scoreIncrement.incrementNegativeCount(previousFlair);
    }
    if (directive === 'neutral') {
        newFlair = scoreIncrement.incrementNeutralCount(previousFlair);
    }

    console.log(`updating user's flair to: `.magenta + newFlair.grey);

    await snoolicious.requester.getUser(parent).assignFlair({
        subredditName: process.env.MASTER_SUB,
        text: newFlair,
        cssClass: process.env.FLAIR_CSS_CLASS
    });
}


/* [Reply With Error Message] */
async function replyWithError(message, id) {
    await snoolicious.requester.getComment(id).reply(message);
}

/* [Reply With Success Message] */
async function replyWithSuccess(id) {
    const message = 'Thanks for your input! Your vote has been accounted for.'
    await snoolicious.requester.getComment(id).reply(message);
}

/* [Snoolicious Run Cycle] */
const INTERVAL = (process.env.INTERVAL * 1000 * 60);
console.log("https://github.com/web-temps/PlayingCardsMarketBot".blue);
async function run() {
        console.log("checking for any new mentions...".grey);
        await snoolicious.getMentions(2);
        console.log("number of items in the queue: ".gray, snoolicious.tasks.size());
        await snoolicious.queryTasks(handleCommand);
        console.log(`Sleeping for ${INTERVAL/1000/60} minute(s)...`.grey);
        setTimeout(async () => {
            await run();
        }, (INTERVAL));
    }
    (async () => {
        await run();
    })();