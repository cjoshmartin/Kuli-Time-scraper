const puppeteer = require('puppeteer');
require('dotenv').config();

const fill_field = (selector, val) => { document.querySelector(selector).value = val }
const clickButton = (selector) => { document.querySelector(selector).click() }
const getMoney = ( hours, rate ) => ( parseFloat(hours) * rate)

const login = async (page) => {

    await page.evaluate(fill_field,'#username', process.env.USERNAME)
    await page.evaluate(fill_field,'#password', process.env.PASSWORD)
    await page.evaluate( clickButton, '.button')
}
const waitForSelector = async (page, selector) => (await page.waitForSelector(selector).then(() => console.log(`Saw '${selector}'`)))
const toggleClock = async (page, clockActionSelector) => {
    const clockAction = await page.evaluate((selector) => { return document.querySelector(selector).value }, clockActionSelector) 
    await page.evaluate(clickButton, clockActionSelector)
    console.log(clockAction)
    return clockAction 
}
const getHours = async (browser) => {

    const page = await browser.newPage();
    await page.goto('https://apps.iu.edu/kpme-prd/TimeDetail.do')
    const td_selector = '#timesheet-table-basic tbody tr td'
    await page.waitForSelector(td_selector)

    let hours = await page.evaluate((selector)=> {
        const itemOnPage = document.querySelectorAll(selector);
        return {
            firstWeek: itemOnPage[8].textContent, 
            secondWeek: itemOnPage[16].textContent,
            totalWeek: itemOnPage[17].textContent
        }
    }, td_selector)


    console.log(`first week: ${hours.firstWeek} `)
    console.log(`second week: ${hours.secondWeek}`)
    console.log(`Total: ${hours.totalWeek}`);

    return hours
}

class utils {
    async constructor(browser) {
        this.browser = browser;
        this.page = await browser.newPage();
    }
    async login () {
        
    }
}
const getData = async (shouldToggleClock = true, isDebugMode = false) => {
    const debugJson = isDebugMode ? { headless: false, devtools: true} : {} ;
    const browser = await puppeteer.launch(debugJson); 
    const page = await browser.newPage();

    await page.goto('https://apps.iu.edu/kpme-prd/Clock.do');
    await login(page)

    const clockActionSelector = 'input[name="clockAction"]'
    await waitForSelector(page, clockActionSelector)
    
    let clockAction

    if (shouldToggleClock){
        clockAction = await toggleClock(page, clockActionSelector)
    }
    
    const hours = await getHours(browser)

    const totalCash = getMoney(hours.totalWeek, 10.50);
    console.log(`Total Cash: ${totalCash}`)
    await browser.close()


    return {
        status: clockAction,
        ...hours,
        totalCash
    }
};

getData()
