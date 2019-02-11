const fill_field = (selector, val) => { document.querySelector(selector).value = val }
const clickButton = (selector) => { document.querySelector(selector).click() }

class utils {
    constructor(browser, page) {
        this.browser = browser;
        this.page = page;
        this.hours = null;
        this.clockAction = null;
    }
    async login(username, password) {
        await this.page.evaluate(fill_field, '#username', username);
        await this.page.evaluate(fill_field, '#password', password);
        await this.page.evaluate(clickButton, '.button');
    }
    async waitForSelector(selector) {
        await this.page.waitForSelector(selector)
            .then(() => console.log(`Saw '${selector}'`));
    }
    async isClockedIn(clockActionSelector) {
        this.clockAction = await this.page.evaluate((selector) => {
            return document.querySelector(selector).value;
        }, clockActionSelector);
        return this.clockAction;
    }
    async toggleClock(clockActionSelector) {
        await this.isClockedIn(clockActionSelector);
        await this.page.evaluate(clickButton, clockActionSelector);
    }
    async getHours() {
        // new page obj
        const page = await this.browser.newPage();
        await page.goto('https://apps.iu.edu/kpme-prd/TimeDetail.do');
        const td_selector = '#timesheet-table-basic tbody tr td';
        await page.waitForSelector(td_selector);
         this.hours = await page.evaluate((selector) => {
            const itemOnPage = document.querySelectorAll(selector);
            return {
                firstWeek: parseFloat(itemOnPage[8].textContent),
                secondWeek: parseFloat(itemOnPage[16].textContent),
                totalWeek: parseFloat(itemOnPage[17].textContent)
            };
        }, td_selector);
        return this.hours;
    }
    getMoney(rate) {
        return (this.hours.totalWeek * rate
        ).toFixed(2);
    }
    getStatus(rate) {
        return {
            status: this.clockAction || "n/a",
            ...this.hours,
            totalCash: parseFloat(this.getMoney(rate))
        };
    }
    async closeBrowser() {
        await this.browser.close();
    }
}

exports.utils = utils;
exports.fill_field = fill_field;
exports.clickButton = clickButton;