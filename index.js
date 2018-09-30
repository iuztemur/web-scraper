const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");
const writeStream = fs.createWriteStream("post.csv");
var constants = require('./constants');
const { URL } = require('url');

const searchUrl = prepareUrl(new URL(constants.URL));

console.log("Scraping Started...");

/**
 * Parse işlemine alttaki request işlemi ile başlamaktadır.
 * İlk sorgu ile birlikte alt sayfalarda kaç adet 
 * sorgu yapılması için totalPageNumber bulunup, alt sayfalara
 * ayrı ayrı sorgu gönderilmektedir.
 */
request(searchUrl.href, function(err, response, html){
    if(!err && response.statusCode == 200){

        var $ = cheerio.load(html);
        var items = [];
        var totalPageNum = getTotalPageNumber($);

        console.log("Total Page Number:", totalPageNum);
        
        parse($, items);

        var pageIndex = 1;
        var timeoutDuration = constants.TIMEOUT_DURATION;

        //İlk sorgu zaten yapıldığı için i=0 değil 1 olarak başlatılıyor.
        for(var i = 1; i < totalPageNum; i++){

            searchUrl.searchParams.set('pagingOffset', (constants.PAGING_SIZE * i));
            console.log("Parsing started for ", searchUrl.href);

            sleep(timeoutDuration).then(() => {
            
                request(searchUrl.href, function(err, response, html){
                    if(!err && response.statusCode == 200){ 
                        var $ = cheerio.load(html);

                        console.log("Parsing done for page ", pageIndex++);
                        parse($, items);

                        if(pageIndex == totalPageNum){
                            console.log("Parsing done for page ", pageIndex++);

                            writeToFile(items);
                        }

                    }else{
                        console.log("Response Error: ", err);
                    }
                });
            });

            timeoutDuration = parseInt(timeoutDuration) + constants.TIMEOUT_DURATION; 
        }

        console.log("----------------------------");
    }else{
        console.log("Error: ", err);
    }
});

/**
 * constants.js dosyasına eklenen URL bilgisini parse eder.
 * Eğer pagingSize yada pagingOffset bilgileri ayarlanmamış
 * ise ayarlama işlemini yapar
 * @function
 */
function prepareUrl(searchUrl) {

    searchUrl.searchParams.delete('pagingSize');
    searchUrl.searchParams.set('pagingSize', constants.PAGING_SIZE);

    searchUrl.searchParams.delete('pagingOffset');

    console.log("----------------------------");
    console.log("URL:", searchUrl.href);
    console.log("URL Preparing Done...");
    console.log("----------------------------");

    return searchUrl;
} 

/**
 * Sayfa içinde parse edilecek içeriğin HTML tag yapısını
 * içeren ve parse işlemini gerçekleştiren fonksiyondur. 
 * Bulunan elementler items array'ine yazılır. Daha sonradan
 * items array'i kullanılarak dosyaya yazma işlemi yapılır.
 * @function
 */
function parse($, items){
    $(".searchResultsItem").each((i, el) => {
        const model = $(el)
                    .find(".searchResultsTagAttributeValue")
                    .text()
                    .replace(/\s\s+/g,'')
                    .replace(/["']/g, "");

        const name = $(el)
                    .find(".classifiedTitle")
                    .text()
                    .replace(/\s\s+/g,'')
                    .replace(/,/g, ' ')
                    .replace(/["']/g, "");

        const year = $(el)
                    .children(".searchResultsAttributeValue")
                    .first()
                    .text()
                    .replace(/\s\s+/g,'');
        
        const km = $(el)
                    .children(".searchResultsAttributeValue")
                    .first()
                    .next()
                    .text()
                    .replace(/\s\s+/g,'')
                    .replace(/\./g,'');

        const color = $(el)
                    .children(".searchResultsAttributeValue")
                    .first()
                    .next()
                    .next()
                    .text()
                    .replace(/\s\s+/g,'')
                    .replace(/["']/g, "");

        const priceStr = $(el)
                    .find(".searchResultsPriceValue")
                    .text()
                    .replace(/\s\s+/g,'')
                    .replace(/\./g,'');

        var price = priceStr.substring(0, priceStr.indexOf(" ")).trim();

        var currency = priceStr.substring(priceStr.indexOf(" "), priceStr.length).trim();

        if(currency != "TL"){
            var temp = price;
            price = currency;
            currency = temp;
        }
                
        if(!model || !name || !year || !km || !color || !price || !currency)
            return;
                    
        items.push({model,name,year,km,color,price,currency});
    });
}

/**
 * Kök dizine yapılan sorgu sonrası gelen HTML verisini
 * parse edip toplan kaç sayfa daha sorgu yapılmasını
 * hesaplayan fonksiyondur.
 * @function
 */
function getTotalPageNumber($){
    var totalPageNum = $(".mbdef")
    .text()
    .replace(/\s\s+/g,'');

    if(totalPageNum.indexOf(" sayfa içerisinde") == -1){
        console.log("Wrong Link:", searchUrl.href);
        console.log("----------------------------");
        return;
    }

    totalPageNum = totalPageNum.substring("Toplam ".length, totalPageNum.indexOf(" sayfa içerisinde"));
    totalPageNum = parseInt(totalPageNum, 0);

    return totalPageNum;
}

/**
 * Parse etme işlemleri tamamlandıktan sonra
 * tüm içerikler items array'i içinde saklanır.
 * İşlemlerin sonunda eldeki items array'i dosyaya
 * bu fonksiyon altında yazılır.
 * @function
 */
function writeToFile(items){

    //CSV dosya başlığı ayarlanıyor
    writeStream.write(`Model,Başlık,Yıl,KM,Renk,Fiyat,Para Birimi \n`);

    items.forEach(function(item) {
        writeStream.write(`${item[model]},${item[name]},${item[year]},${item[km]},${item[color]},${item[price]},${item[currency]} \n`);
    });

    console.log("----------------------------");
    console.log("Scraping Done...");
    writeStream.end();
}

/**
 * Siteye hızlı şekilde sorgu yapıp, yasaklanmamak için
 * arada bekleme aşamasını yöneten fonksiyondur.
 * @function
 */
const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}