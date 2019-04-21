const path = require('path')
const fs = require('fs')
const puppeteer = require('puppeteer');
const ENTRY_POINT = 'http://www.stats.gov.cn/tjsj/tjbz/tjyqhdmhcxhfdm/2018/index.html' 

const ROOT_PATH = path.resolve(__dirname, './')
const PROVINCE_SELECTOR = '.provincetable .provincetr a'
const CITY_SELECTOR = '.citytr'
const DIST_SELECTOR = '.countytr,.towntr'

let browser

async function main () {
    let addressList = []
    browser = await puppeteer.launch({
        timeout: 1200000
    });
    await getProvince (ENTRY_POINT, addressList)
    writeFile(addressList)
    await browser.close();
}

main()


async function getProvince(loc, addressList) {
    console.log('爬取省份页面：', loc)
    const page = await browser.newPage();
    await page.goto(loc, {
        timeout: 300000
    });
    await page.waitForSelector(PROVINCE_SELECTOR, {
        timeout: 60000
    })
    const links = await page.evaluate(resultSelector => {
        const anchors = document.querySelectorAll(resultSelector)
        return Array.from(anchors).map(e => {
            let name = e.innerHTML && e.innerHTML.replace(/<[^>]*>/, '')
            return {
                link: e.getAttribute('href'),
                name
            }
        })
    }, PROVINCE_SELECTOR)

    page.close()

    for (e of links) {
        if (!e.link || !e.name) continue
        let addressObj = {name: e.name, sub:[], code: ''}
        addressList.push(addressObj)
        await delay( () => getCity(ENTRY_POINT.replace('index.html', e.link), addressObj), 300)
    }

}

async function getCity(loc, addressObj) {
    console.log('爬取市级页面：', loc)
    const page = await browser.newPage();
    await page.goto(loc, {
        timeout: 300000
    });
    await page.waitForSelector(CITY_SELECTOR, {
        timeout: 60000
    })
    const links = await page.evaluate(resultSelector => {
        const anchors = document.querySelectorAll(resultSelector)
        return Array.from(anchors).map(e => {
            let tds = e.querySelectorAll('a')
            return {
                code: tds && tds[0] && tds[0].innerHTML && tds[0].innerHTML.replace(/0{6}$/, ''),
                link: tds && tds[0] && tds[0].getAttribute('href'),
                name: tds && tds[1] && tds[1].innerHTML
            }
        })
    }, CITY_SELECTOR)

    page.close()

    if (links && links[0] && links[0].code) {
        addressObj.code = links[0].code.slice(0, 3) + '000'
        for (e of links) {
            if (!e.code || !e.name) continue
            let city = {
                code: e.code,
                name: e.name.replace('市辖区', addressObj.name),
                sub: []
            }
            addressObj.sub.push(city)
            await delay(() => getDistrict(ENTRY_POINT.replace('index.html', e.link), city), 1000)
        }
    }

    
}

async function getDistrict(loc, addressObj) {
    console.log('爬取区级页面：', loc)
    const page = await browser.newPage();
    await page.goto(loc, {
        timeout: 300000
    });
    await page.waitForSelector(DIST_SELECTOR, {
        timeout: 300000
    })
    const links = await page.evaluate(resultSelector => {
        const anchors = document.querySelectorAll(resultSelector)
        return Array.from(anchors).map(e => {
            let tds = e.querySelectorAll('a')
            return {
                code: tds && tds[0] && tds[0].innerHTML && tds[0].innerHTML.replace(/0{6}$/, ''),
                name: tds && tds[1] && tds[1].innerHTML
            }
        })
    }, DIST_SELECTOR)

    page.close()

    if (links && links.length) {
        for (e of links) {
            if (!e.code || !e.name) continue
            let dist = {
                code: e.code,
                name: e.name.replace('市辖区', addressObj.name),
            }
            addressObj.sub.push(dist)
        }
    }
}

async function delay(func, delay) {
    await new Promise((res, rej) => {
        setTimeout(async () => {
            let v = await func()
            return res(v)
        }, delay)
    })
} 

function writeFile(json) {
    let date = new Date()
    let fileName = 'address-' + date.getFullYear() + (date.getMonth() + 1) + date.getDate() + '.json'
    fs.writeFile(path.resolve(ROOT_PATH, './dist/' + fileName), JSON.stringify(json), (err) => {
        if (err) throw err;
    });
}