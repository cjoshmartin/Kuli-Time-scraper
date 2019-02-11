const { utils } = require("./utils");

const puppeteer = require('puppeteer');
require('dotenv').config();

const getData = async (
    shouldToggleClock = true,
    isDebugMode = false
) => {
    const debugJson = isDebugMode ? { headless: false, devtools: true } : {};
    const browser = await puppeteer.launch(debugJson)
    const page = await browser.newPage()
    const funcs = await new utils(browser, page)

    await funcs.page.goto('https://apps.iu.edu/kpme-prd/Clock.do')
    await funcs.login(
        process.env.USERNAME,
        process.env.PASSWORD
    )

    const clockActionSelector = 'input[name="clockAction"]'
    await funcs.waitForSelector(clockActionSelector)

    if (shouldToggleClock) {
        await funcs.toggleClock(clockActionSelector)
    }

    await funcs.getHours()
    await funcs.closeBrowser()

    console.log(funcs.getStatus(process.env.RATE))
    return funcs.getStatus(process.env.RATE)
 };
const should = {
    login: true,
    enableDebugMode: true
}

 getData(!should.login);
