const puppeteer = require('puppeteer');
const { utils } = require("./utils");

function parseBool(val) { return val === true || val === "true" }

exports.screenshot = async (req, res) => {
    const userData = req.query;
    console.log(userData)
    if (Object.keys(userData).length < 3 ){
        return res.send('The query you have suggested is wrong')
    }
    const browser = await puppeteer.launch({args: ['--no-sandbox']})
    const page = await browser.newPage()
    const funcs = await new utils(browser, page)

    await funcs.page.goto('https://apps.iu.edu/kpme-prd/Clock.do')
    await funcs.login(
        userData.username,
        userData.password
    )

    const clockActionSelector = 'input[name="clockAction"]'
    await funcs.waitForSelector(clockActionSelector)

    if (parseBool(userData.shouldtoggle) ) {
        await funcs.toggleClock(clockActionSelector)
    }

    await funcs.getHours()
    await funcs.closeBrowser()
    
    res.set('Content-Type','application/json')
    res.send(funcs.getStatus(userData.rate))
 };
