const axios             = require('axios');
const https             = require('https');
const { URL }           = require('url');
const util              = require('util');
const { parseString }   = require('xml2js');

const parseStringAsync  = util.promisify(parseString);

class CDEPublishedContentListing {

    /**
     * Creates a new instance of CDEPublishedContentListing. NOTE: if you
     * want to use this to scrape a bunch of listings, please use an agent
     * that implements keep-alive!!
     * @param {*} hostname The hostname of the CDE site to query
     * @param {*} agent An https agent to use. (Default: https.globalAgent)
     */
    constructor(
        hostname,
        agent = https.globalAgent
    ) {
        this.client = axios.create({
            baseURL: 'https://' + hostname,
            httpsAgent: agent
        });
    }

    /**
     * Retrieves content metadata files for a named root.
     * @param {*} root the specific root to retrieve. Use ListAvailablePaths to get valid roots.
     * @param {string|Array} path the path under that root either as a string or as an array of strings (Default: /)
     */
    async getItemsForPath(root, path='/') {
        let res;        

        if (!Array.isArray(path) && typeof path !== 'string') {
            throw new Error('Invalid type for path');
        }

        const pathAsArr = typeof path === 'string' ? 
            ( path === '/' ? [] : path.split('/').filter(s=>s!='') ) : 
            path;

        const pathAsStr = '/' + pathAsArr.join('/'); 

        try {
            res = await this.client.get('/PublishedContent/List', {
                params: this.getQuery(root, pathAsStr)
            });
        } catch (err) {
            throw new Error(`Unable to get items for path, ${pathAsStr}, under the root, ${root}.`)
        }

        const augmentedRes = {
            Directories: (res.data && res.data.Directories && res.data.Directories.length) ? 
                res.data.Directories : 
                [],
            Files: (res.data && res.data.Files && res.data.Files.length) ? 
                res.data.Files.map(
                    (f) => ({
                        FullWebPath: f.FullWebPath,
                        FileName: f.FileName,
                        Path: pathAsArr,
                        CreationTime: f.CreationTime,
                        LastWriteTime: f.LastWriteTime
                    })) : 
                []
        };
         

        return augmentedRes;
    }

    /**
     * Retrieves a list of published content paths which are available for retrieval.
     */
    async listAvailablePaths() {
        let res;

        try {
            res = await this.client.get('/PublishedContent/List', {
                params: {
                    fmt: 'json'
                }
            });
        } catch (err) {
            throw new Error('Unable to fetch available paths.')
        }

        const availPaths = res.data.map((availPath) => {
            return {
                ...availPath,
                Root: this.extractRootPathFromUrl(availPath.Url)
            }
        })

        return availPaths;
    }

    /**
     * Gets the published file
     * @param {*} listEntry A PublishedContent Listing entry
     */
    async getPublishedFile(listEntry) {        
        let res;

        try {
            res = await this.client.get(listEntry.FullWebPath);
        } catch (err) {
            throw new Error(`Unable to fetch published file, ${listEntry.FullWebPath}.`)
        }

        try {
            return await parseStringAsync(res.data);
        } catch(err) {
            throw new Error('Cannot process XML')
        }
    }


    /**
     * Extracts the root query parameter from a URL
     * @param {*} url The url to process
     */
    extractRootPathFromUrl(url) {
        const parsedUrl = new URL("https://example.org" + url);
        return parsedUrl.searchParams.get('root');
    }

    /**
     * Simple helper method to get the params for a query request
     * @param {string} root 
     * @param {string} path 
     */
    getQuery(root, path) {
        return {
            root,
            path,
            fmt: 'json'
        };
    }
}

module.exports = CDEPublishedContentListing;