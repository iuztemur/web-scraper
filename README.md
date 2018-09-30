# sahibinden_web_scraper

> İnternet sitesi üzerinden ev, araba ya da herhangi bir kategoride içerikleri sayfaları gezerek toplayan ve bunu bir csv dosyasına kaydeden web scraper. :rocket:

İçerisinde parse edilen model değiştirilerek farklı sitelerin scrape işlemlerinde kullanılabilir.

Çalışır halini görmek için alttaki resime tıklayayınız: 

[![Video izle](https://img.youtube.com/vi/OHxiGN8SUs0/0.jpg)](https://youtu.be/OHxiGN8SUs0)

## Özellikleri:

- Ana kategori sayfası altındaki sayfalanmış diğer sayfaların da otomatik parse edebilme.
- Girilen linkin doğrulanması, düzenlenmesi.
- Veri çekmek işlemi sırasında sunuculara tarafından yasaklanmamak için bekleme süresi ayarlayabilme.
- Para birimlerine göre fiyat verisinin çekilmesi.
- Verinin CSV dosyasına kaydedilebilmesi.
- Liste içinde çıkan reklamları tanımlayıp, veri setine eklememe.

## Motivation

İnternet siteleri üzerinden listelenen araçlar arasında en verimli araç fiyatının tespiti ve veri üzerinde veri madenciliği yapabilmek için içeriğin CSV dosyasına taşınmasını sağlanmak amaçıyla bu proje gerçekleştirimiştir. 

CSV dosyası kullanılarak makine öğrenmesi yardımı ile, veri madenciliği yapılmıştır. Uygun fiyatı tespit etmek, modellerin dağılımını gözlemlemek, fiyat üzerindeki etkenlerin fonksiyonunu çıkarmak projedeki ana motivasyondur.

## Kurulum

Gerekli node kütüphanelerini yüklemek için root dizin içinde terminal üzerinden alttaki kodu çalıştırın.
```bash
npm install
```

Parse etme işlemini başlatmak için alttaki kodu çalıştırmanız gerekmektedir.

```bash
node index.js
```

## Düzenleme

`constants.js` dosyası içerisinde düzenleme yapılacak parametreler şu şekildedir:

`URL`: Parse edilecek ana kategori içeriğini sağlayan link bilgisini içerir. İstediğiniz bir kategorinin kök dizinini verebilirsiniz. 
Örnek: BMW-4-Serisi kök dizini.

```bash
URL: 'https://www.sahibinden.com/bmw-4-serisi'
```

`PAGING_SIZE`: Tek requestte servisin döndüğü liste içeriğindeki ürün adet sayısı. 20 ya da 50 olabilir. Varsayılan durumda sistemden daha az request ile veri çekebilmek için 50 olarak atanmaktadır. 

```bash
PAGING_SIZE: '50'
```

`TIMEOUT_DURATION`: Servise yapılacak sonraki çağrı için bekleme süresi. Sahibinden.com fazla request atılması durumunda kişiyi yasaklamakta ve belli bir süre bekletmektedir. Dolayısı ile yapılacak çağrılar arasında süre konulması uzun işlemler için faydalı olacaktır. Varsayılan olarak 3 saniyedir. Az çekilecek veri var ise 0(sıfır) olarak atanabilir.

```bash
TIMEOUT_DURATION: '3000'
```


#### Veri Akışı

Basit bir şekilde veri akışı şu şekilde gerçekleşmektedir:

```
-> CSV dosyası başlık satırı oluşturulur.
-> Kullanıcının girdiği URL bilgisi doğrulanır.
-> URL üzerine daha az request ile veri çekimi yapabilmek için pagingSize ve pagingOffset düzenlenir.
-> Ana kategori sayfa linkine çağrı yapılır.
-> Gelen sayfa içinde toplam içerik adeti bulunur ve ilk içerik sayfası parse edilip, CSV'e aktarılır.
-> Sayfa sayısı kadar request üretilir.
-> Requestler kullanıcının verdiği TIMEOUT_DURATION değerine göre bekletilerek sunucuya talep olarak gönderilir.
-> Aşamalı olarak gelen veriler parse edilir ve CSV dosyasına aktarılır.
```

#### Çıktı

Veri parse işlemleri bittikten sonra uygulama ana dizini üzerinde `post.csv` adında bir dosya üretilecektir. Veriyi buradan alıp kullanabilirsiniz.