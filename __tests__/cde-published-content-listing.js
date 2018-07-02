const axios                 = require('axios');
const fs                    = require('fs');
const https                 = require('https');
const nock                  = require('nock');

const CDEPublishedContentListing = require("../index");

beforeAll(() => {
    nock.disableNetConnect();
})

//After each test, cleanup any remaining mocks
afterEach(() => {
    nock.cleanAll();
});

afterAll(() => {
    nock.enableNetConnect();
})

describe('CDEPublishedContentListing', async () => {

    describe('Constructor', () => {
    
    })

    describe('listAvailablePaths', async() => {

        const client = new CDEPublishedContentListing('www.cancer.gov');

        
        it('returns list of items', async () => {

            const responseData = [ 
                { DisplayName: 'Best Bets', Url: '/PublishedContent/List?root=BestBets&fmt=json', Root: "BestBets" },
                { DisplayName: 'Page Instructions', Url: '/PublishedContent/List?root=PageInstructions&fmt=json', Root: "PageInstructions" },
                { DisplayName: 'File Instructions', Url: '/PublishedContent/List?root=FileInstructions&fmt=json', Root: "FileInstructions" }, 
                { DisplayName: 'Section Details', Url: '/PublishedContent/List?root=SectionDetails&fmt=json', Root: "SectionDetails" },
                { DisplayName: 'Image Long Descriptions', Url: '/PublishedContent/List?root=LongDesc&fmt=json', Root: "LongDesc" },
                { DisplayName: 'RSS Feeds', Url: '/PublishedContent/List?root=RSS&fmt=json', Root: "RSS" },
                { DisplayName: 'HHS Syndication Content', Url: '/PublishedContent/List?root=Syndication&fmt=json', Root: "Syndication" },
                { DisplayName: 'Javascript', Url: '/PublishedContent/List?root=JS&fmt=json', Root: "JS" },
                { DisplayName: 'CSS Stylesheets', Url: '/PublishedContent/List?root=Styles&fmt=json', Root: "Styles" } 
            ];

            const scope = nock('https://www.cancer.gov')
                .get("/PublishedContent/List")
                .query({fmt: "json"})
                .reply(200, responseData.map((item) => ({ 
                        DisplayName: item.DisplayName, 
                        Url: item.Url 
                    }))
                );

            const actual = await client.listAvailablePaths();
            
            expect(scope.isDone()).toBeTruthy();
            expect(actual).toEqual(responseData);
        });

        it('throws error on 404', async () => {
            const scope = nock('https://www.cancer.gov')
            .get("/PublishedContent/List")
            .query({fmt: "json"})
            .reply(404);

            expect.assertions(2);

            try {
                await client.listAvailablePaths();
            } catch (err) {
                expect(err).toBeTruthy()
            }
            
            expect(scope.isDone()).toBeTruthy();
        })
    })

    describe('getItemsForPath', async() => {
        const client = new CDEPublishedContentListing('www.cancer.gov');

        describe('returns results', async() => {
            it('returns results at root', async () => {
                const scope = nock('https://www.cancer.gov')
                .get("/PublishedContent/List")
                .query({
                    root: 'Root',
                    path: '/',
                    fmt: "json"
                })
                .reply(200, {
                    Directories: [
                        'dir-a',
                        'dir-b'
                    ],
                    Files: [
                        { 
                            FullWebPath: '/PublishedContent/Root/file-a.xml',
                            FileName: 'file-a.xml',
                            CreationTime: '2015-05-01T09:36:06.8698264-04:00',
                            LastWriteTime: '2018-02-08T10:56:21.63197-05:00' 
                        },
                        {
                            FullWebPath: '/PublishedContent/Root/file-b.xml',
                            FileName: 'file-b.xml',
                            CreationTime: '2015-05-01T15:43:20.7272344-04:00',
                            LastWriteTime: '2018-05-10T18:10:29.8378898-04:00' 
                        }
                    ]
                });

                const expected = {
                    Directories: [
                        'dir-a',
                        'dir-b'
                    ],
                    Files: [
                        { 
                            FullWebPath: '/PublishedContent/Root/file-a.xml',
                            Path: [],
                            FileName: 'file-a.xml',
                            CreationTime: '2015-05-01T09:36:06.8698264-04:00',
                            LastWriteTime: '2018-02-08T10:56:21.63197-05:00' 
                        },
                        {
                            FullWebPath: '/PublishedContent/Root/file-b.xml',
                            Path: [],
                            FileName: 'file-b.xml',
                            CreationTime: '2015-05-01T15:43:20.7272344-04:00',
                            LastWriteTime: '2018-05-10T18:10:29.8378898-04:00' 
                        }
                    ]
                }            

                const actual = await client.getItemsForPath('Root');
                expect(scope.isDone()).toBeTruthy();
                expect(actual).toEqual(expected);
            });

            it('returns results at root, no dirs', async () => {
                const scope = nock('https://www.cancer.gov')
                .get("/PublishedContent/List")
                .query({
                    root: 'Root',
                    path: '/',
                    fmt: "json"
                })
                .reply(200, {
                    Directories: [],
                    Files: [
                        { 
                            FullWebPath: '/PublishedContent/Root/file-a.xml',
                            FileName: 'file-a.xml',
                            CreationTime: '2015-05-01T09:36:06.8698264-04:00',
                            LastWriteTime: '2018-02-08T10:56:21.63197-05:00' 
                        },
                        {
                            FullWebPath: '/PublishedContent/Root/file-b.xml',
                            FileName: 'file-b.xml',
                            CreationTime: '2015-05-01T15:43:20.7272344-04:00',
                            LastWriteTime: '2018-05-10T18:10:29.8378898-04:00' 
                        }
                    ]
                });

                const expected = {
                    Directories: [],
                    Files: [
                        { 
                            FullWebPath: '/PublishedContent/Root/file-a.xml',
                            Path: [],
                            FileName: 'file-a.xml',
                            CreationTime: '2015-05-01T09:36:06.8698264-04:00',
                            LastWriteTime: '2018-02-08T10:56:21.63197-05:00' 
                        },
                        {
                            FullWebPath: '/PublishedContent/Root/file-b.xml',
                            Path: [],
                            FileName: 'file-b.xml',
                            CreationTime: '2015-05-01T15:43:20.7272344-04:00',
                            LastWriteTime: '2018-05-10T18:10:29.8378898-04:00' 
                        }
                    ]
                }            

                const actual = await client.getItemsForPath('Root');
                expect(scope.isDone()).toBeTruthy();
                expect(actual).toEqual(expected);
            });

            it('returns results at root, no files', async () => {
                const scope = nock('https://www.cancer.gov')
                .get("/PublishedContent/List")
                .query({
                    root: 'Root',
                    path: '/',
                    fmt: "json"
                })
                .reply(200, {
                    Directories: [
                        'dir-a',
                        'dir-b'
                    ],
                    Files: []
                });

                const expected = {
                    Directories: [
                        'dir-a',
                        'dir-b'
                    ],
                    Files: []
                }            

                const actual = await client.getItemsForPath('Root');
                expect(scope.isDone()).toBeTruthy();
                expect(actual).toEqual(expected);
            });
            
            it('returns results at root, no dirs, no files', async () => {
                const scope = nock('https://www.cancer.gov')
                .get("/PublishedContent/List")
                .query({
                    root: 'Root',
                    path: '/',
                    fmt: "json"
                })
                .reply(200, {
                    Directories: [],
                    Files: []
                });

                const expected = {
                    Directories: [],
                    Files: []
                }            

                const actual = await client.getItemsForPath('Root');
                expect(scope.isDone()).toBeTruthy();
                expect(actual).toEqual(expected);
            });

            it('returns results deeper', async () => {
                const scope = nock('https://www.cancer.gov')
                .get("/PublishedContent/List")
                .query({
                    root: 'Root',
                    path: '/foo/bar/bazz',
                    fmt: "json"
                })
                .reply(200, {
                    Directories: [
                        'dir-a',
                        'dir-b'
                    ],
                    Files: [
                        { 
                            FullWebPath: '/PublishedContent/Root/file-a.xml',
                            FileName: 'file-a.xml',
                            CreationTime: '2015-05-01T09:36:06.8698264-04:00',
                            LastWriteTime: '2018-02-08T10:56:21.63197-05:00' 
                        },
                        {
                            FullWebPath: '/PublishedContent/Root/file-b.xml',
                            FileName: 'file-b.xml',
                            CreationTime: '2015-05-01T15:43:20.7272344-04:00',
                            LastWriteTime: '2018-05-10T18:10:29.8378898-04:00' 
                        }
                    ]
                });

                const expected = {
                    Directories: [
                        'dir-a',
                        'dir-b'
                    ],
                    Files: [
                        { 
                            FullWebPath: '/PublishedContent/Root/file-a.xml',
                            Path: ['foo', 'bar', 'bazz'],
                            FileName: 'file-a.xml',
                            CreationTime: '2015-05-01T09:36:06.8698264-04:00',
                            LastWriteTime: '2018-02-08T10:56:21.63197-05:00' 
                        },
                        {
                            FullWebPath: '/PublishedContent/Root/file-b.xml',
                            Path: ['foo', 'bar', 'bazz'],
                            FileName: 'file-b.xml',
                            CreationTime: '2015-05-01T15:43:20.7272344-04:00',
                            LastWriteTime: '2018-05-10T18:10:29.8378898-04:00' 
                        }
                    ]
                }            

                const actual = await client.getItemsForPath('Root', '/foo/bar/bazz');
                expect(scope.isDone()).toBeTruthy();
                expect(actual).toEqual(expected);
            });
        });

        describe('calls correct url', async () => {
            it('for default', async () => {
                const scope = nock('https://www.cancer.gov')
                    .get("/PublishedContent/List")
                    .query({
                        root: 'Root',
                        path: '/',
                        fmt: "json"
                    })
                    .reply(200, {});

                await client.getItemsForPath('Root');
                expect(scope.isDone()).toBeTruthy();
            })

            it('for empty array', async () => {
                const scope = nock('https://www.cancer.gov')
                    .get("/PublishedContent/List")
                    .query({
                        root: 'Root',
                        path: '/',
                        fmt: "json"
                    })
                    .reply(200, {});

                await client.getItemsForPath('Root');
                expect(scope.isDone()).toBeTruthy();
            })

            it('for empty string', async () => {
                const scope = nock('https://www.cancer.gov')
                    .get("/PublishedContent/List")
                    .query({
                        root: 'Root',
                        path: '/',
                        fmt: "json"
                    })
                    .reply(200, {});

                await client.getItemsForPath('Root', '');
                expect(scope.isDone()).toBeTruthy();
            })

            it('for url single path', async () => {
                const scope = nock('https://www.cancer.gov')
                    .get("/PublishedContent/List")
                    .query({
                        root: 'Root',
                        path: '/path',
                        fmt: "json"
                    })
                    .reply(200, {});

                await client.getItemsForPath('Root', '/path');
                expect(scope.isDone()).toBeTruthy();   
            })

            it('for single-element array path', async () => {
                const scope = nock('https://www.cancer.gov')
                    .get("/PublishedContent/List")
                    .query({
                        root: 'Root',
                        path: '/path',
                        fmt: "json"
                    })
                    .reply(200, {});

                await client.getItemsForPath('Root', ['path']);
                expect(scope.isDone()).toBeTruthy(); 
            })

            it('for single-element array path', async () => {
                const scope = nock('https://www.cancer.gov')
                    .get("/PublishedContent/List")
                    .query({
                        root: 'Root',
                        path: '/path/deep',
                        fmt: "json"
                    })
                    .reply(200, {});

                await client.getItemsForPath('Root', ['path', 'deep']);
                expect(scope.isDone()).toBeTruthy(); 
            })
        })

        describe('throws error', async() => {

            it('on bad path type', async () => {
                expect.assertions(1);
                try {
                    await client.getItemsForPath('Root', {});
                } catch(err) {
                    expect(err).toMatchObject({
                        message: 'Invalid type for path'
                    });
                }
            })

            it('on 404', async () => {
                expect.assertions(1);
                try {
                    await client.getItemsForPath('Root', 'chicken');
                } catch(err) {
                    expect(err).toMatchObject({
                        message: 'Unable to get items for path, /chicken, under the root, Root.'
                    });
                }
            })
        });
    })

    describe('getPublishedFile', async() => {
        const client = new CDEPublishedContentListing('www.cancer.gov');

        describe('returns record', async () => {
            const scope = nock('https://www.cancer.gov')
            .get("/PublishedContent/Test/Test.xml")
            .reply(200, '<?xml version="1.0" encoding="utf-8"?><test>hello world</test>');

            const expected = { test: 'hello world' };
            const actual = await client.getPublishedFile({ FullWebPath: '/PublishedContent/Test/Test.xml' });

            expect(actual).toEqual(expected);
            expect(scope.isDone()).toBeTruthy();
        });

        describe('throws error', async () => {

            it('bad response', async () => {
                const path = '/PublishedContent/Test/Test.xml';

                const scope = nock('https://www.cancer.gov')
                    .get(path)
                    .reply(404);

                expect.assertions(2);

                try {
                    await client.getPublishedFile({ FullWebPath: path });
                } catch(err) {
                    expect(err).toMatchObject({
                        message: `Unable to fetch published file, ${path}.`
                    });
                }

                expect(scope.isDone()).toBeTruthy();
            });

            it('bad xml', async () => {
                const scope = nock('https://www.cancer.gov')
                    .get("/PublishedContent/Test/Test.xml")
                    .reply(200, "&&&&&&&");

                expect.assertions(2);

                try {
                    await client.getPublishedFile({ FullWebPath: '/PublishedContent/Test/Test.xml' });
                } catch(err) {
                    expect(err).toMatchObject({
                        message: 'Cannot process XML'
                    });
                }

                expect(scope.isDone()).toBeTruthy();
            });
        });
    })

})