const CDEPublishedContentListing = require('./index');


async function main() {
    const client = new CDEPublishedContentListing('www.cancer.gov');

    //const thing = await client.getItemsForPath('PageInstructions', '/about-cancer');
    const thing = await client.getPublishedFile({
        "FullWebPath": "/PublishedContent/BestBets/1045389.xml",
        "FileName": "1045389.xml",
        "CreationTime": "2017-08-08T11:29:24.6050474-04:00",
        "LastWriteTime": "2017-08-08T11:29:24.6060239-04:00"
    });
    console.log(thing);
} 

main();