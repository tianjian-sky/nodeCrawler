let pChangeArr = []
let cChangeArr = []
let dChangeArr = []

function compareAddress(newJson, oldJson) {
    for (p of newJson) {
        let pi = oldJson.findIndex(e => e.code == p.code)
        if ( pi >= 0){
            if (p.name != oldJson[pi].name) {
                pChangeArr.push({type: 'CN', name: p.name, code: p.code})
            }
            for (city of p.sub) {
                let ci = oldJson[pi].sub.findIndex(e => e.code == city.code)
                if (ci >= 0) {
                    if (city.name != oldJson[pi].sub[ci].name) {
                        cChangeArr.push({type: 'CN', name: city.name, code: city.code})
                    }
                    for (dist of city.sub) {
                        let di = oldJson[pi].sub[ci].sub.findIndex(e => e.code == dist.code) 
                        if (di >= 0) {
                            if (dist.name != oldJson[pi].sub[ci].sub[di].name) {
                                dChangeArr.push({type: 'CN', name: dist.name, code: dist.code})
                            }
                        } else {
                            dChangeArr.push({type: 'C', name: dist.name, code: dist.code})
                        }
                    }
                } else {
                    cChangeArr.push({type: 'C', name: city.name, code: city.code})
                }
            }
        } else {
            pChangeArr.push({type: 'C', name: p.name, code: p.code})
        }
    } 
}



function logCompareResult (parr, carr, darr) {
    // console.dir(parr)
    // console.dir(carr)
    // console.dir(darr)
    for (item of parr) {
        console.info('此省份条目有变更：' + item.name + ':' + item.code)
    }
    for (item of carr) {
        console.info('此市级条目有变更：' + item.name + ':' + item.code)
    }
    for (item of darr) {
        console.info('此区级条目有变更：' + item.name + ':' + item.code)
    }
}

compareAddress(require('./dist/address-2019421.json'), require('./addressHistory/address.json'))
logCompareResult (pChangeArr, cChangeArr, dChangeArr)