import cheerio from 'cheerio';
class tiktokClass {
    constructor(url,msToken) {
        this.url = url
        this.msToken = msToken
        this.appContext = null
        this.userDetail = null
        this.userAgent = navigator.userAgent;
        this.myHeaders = new Headers();
        this.myHeaders.append("User-Agent", this.userAgent);
        this.prams = {
            "WebIdLastTime": "1719115293",
            "aid": "1988",
            "app_language": "en",
            "app_name": "tiktok_web",
            "browser_language": "en-US",
            "browser_name": "Mozilla",
            "browser_online": "true",
            "browser_platform": "Win32",
            "browser_version": navigator.userAgent,
            "channel": "tiktok_web",
            "cookie_enabled": "true",
            "count": "35",
            "coverFormat": "2",
            "cursor": "0",
            "device_id": "7372175285293123079",
            "device_platform": "web_pc",
            "focus_state": "true",
            "from_page": "user",
            "history_len": "11",
            "is_fullscreen": "false",
            "is_page_visible": "true",
            "language": "en",
            "needPinnedItemIds": "true",
            "os": "windows",
            "post_item_list_request_type": "0",
            "priority_region": "VN",
            "referer": "",
            "region": "VN",
            "screen_height": screen.height,
            "screen_width": screen.width,
            "user_is_login": true
        }// Lấy chiều rộng của toàn bộ màn hình

    }
    methodForm(methodData) {
        const requestOptions = {
            method: methodData || 'GET',
            headers: this.myHeaders,
            redirect: "follow"
        };
        return requestOptions
    }
    async genProfileSecUid() {
        var res = await fetch(this.url, this.methodForm('GET'))
        let response = await res.text()
        const $ = cheerio.load(response);

        const textContent = $(`#__UNIVERSAL_DATA_FOR_REHYDRATION__`).text();
        var obj = JSON.parse(textContent)
        this.appContext = obj.__DEFAULT_SCOPE__["webapp.app-context"]
        this.userDetail = obj.__DEFAULT_SCOPE__["webapp.user-detail"]
        this.prams.device_id = this.appContext.wid
        this.prams.WebIdLastTime = this.appContext.webIdCreatedTime
        this.prams.browser_version = this.appContext.userAgent
        this.prams.odinId = this.appContext.odinId
        this.prams.language = this.appContext.language
        this.prams.priority_region = this.appContext.region
        this.prams.region = this.appContext.region
        console.log(obj)
    }
    async genProfileSecUidNew() {
        var res = await fetch(this.url, this.methodForm('GET'))
        let response = await res.text()
        const $ = cheerio.load(response);
        const textContent = $(`#__UNIVERSAL_DATA_FOR_REHYDRATION__`).text();
        var obj = JSON.parse(textContent)
        return obj.__DEFAULT_SCOPE__["webapp.user-detail"]
    }
    async getBogus(url, userAgent) {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
        const urlencoded = new URLSearchParams();
        urlencoded.append("userAgent", userAgent);
        urlencoded.append("url", url);
        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: urlencoded,
            redirect: "follow"
        };
        var res = await fetch("https://xbogustiktok.vercel.app/api/bogus", requestOptions)
        let response = await res.json()
        console.log(response)
        return response
    }
    // tải danh sách video mới
    async GetNewVideo(count) {
        let pramsNew = {
            ...this.prams,
            "secUid": this.userDetail.userInfo.user.secUid,
            "tz_name": "Asia/Saigon",
            "userId": this.userDetail.userInfo.user.id,
            "webcast_language": "en",
            "msToken": this.msToken
        }
        let prString = new URLSearchParams(pramsNew).toString();
        let urlBase = `https://www.tiktok.com/api/post/item_list/?${prString}`;
        let bogusWait = await this.getBogus(urlBase, this.userAgent)
        pramsNew = {
            ...pramsNew,
            'X-Bogus': bogusWait.xbogus
        }
        prString = new URLSearchParams(pramsNew).toString();
        urlBase = `https://www.tiktok.com/api/post/item_list/?${prString}`;
        var res = await fetch(urlBase, this.methodForm('GET'));
        let response = await res.json();
        let itemList = response.itemList
        let arayVideo = []
        for (let index = 0; index < itemList.length; index++) {
            let isPinnedItem = itemList[index].isPinnedItem
            if(!isPinnedItem)
            {
                arayVideo.push(itemList[index])
                if(arayVideo.length == count){
                    break
                }
            }
        }
        console.log(arayVideo);
        return arayVideo
    }
}
export default tiktokClass