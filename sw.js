
const CACHE = 'V0';

// A list of local resources we always want to be cached.
const URLS = [{"revision":null,"url":"175f391f238cd7deffa8.woff2?v=4.5.5"},{"revision":null,"url":"230d39e89103765834b3.woff"},{"revision":null,"url":"469ff15e72ceda3868c7.eot"},{"revision":null,"url":"4eb6043220be660d50c5.svg"},{"revision":null,"url":"576a3a02948f7f5140b2.ttf?v=4.5.5"},{"revision":null,"url":"5a588d6a8bfc41d69f88.ttf?v=2.2.0"},{"revision":null,"url":"686336e914dbcd5bc20d.ttf"},{"revision":null,"url":"6ee80f4bf5d3f92f3bf7.woff2?v=2.2.0"},{"revision":null,"url":"73b2218024541ec4e90d.woff2"},{"revision":null,"url":"74d1410980e8dabb67a0.svg?v=4.5.5"},{"revision":null,"url":"75ec6f4859d31ffaece8.svg"},{"revision":null,"url":"867bbaaf9dda15b203dd.woff2"},{"revision":null,"url":"8fb677a95f4d1a60a535.ttf"},{"revision":null,"url":"9c9c54c0abf3b8a46695.ttf"},{"revision":null,"url":"9dfcdc0f7d840f913a76.eot"},{"revision":null,"url":"a014cf6987657a489eaa.eot?v=4.5.5"},{"revision":null,"url":"bd9b02bf1131d90bfe22.woff?v=2.2.0"},{"revision":null,"url":"c02d7d9389ae7e1b28be.svg"},{"revision":null,"url":"c579c7d9be63a3337b96.woff"},{"revision":null,"url":"d5a5eb19947a21cc9b89.woff2"},{"revision":null,"url":"dc4cd499c4e39885ce89.eot"},{"revision":"0561da54dba9dc43461b8ad22e04d4eb","url":"default-icon"},{"revision":null,"url":"ecbd4c551abdab14dade.woff"},{"revision":null,"url":"ef35f15cc09a26825792.woff?v=4.5.5"},{"revision":"0561da54dba9dc43461b8ad22e04d4eb","url":"favicon.ico"},{"revision":"a58d2a3ccb34a5a870af8b0a658e6c07","url":"icons/icon-192.png"},{"revision":"3b7bdcadf3eac7e11d3cd7069845905b","url":"icons/icon-256.png"},{"revision":"9740c0815046d1c470798912ff29c98b","url":"icons/icon-384.png"},{"revision":"f1bd6965a96c31049bb6674c8b73d892","url":"icons/icon-512.png"},{"revision":"7443f7dfe894693716bdb3fe8653cb11","url":"index.html"},{"revision":"4776671259190bcb3f4a7505d387cd40","url":"manifest.json"}].map(el=>el.url);
URLS.push('main.js');
URLS.push('./');

//console.log(URLS);

const saveDebugInfo = (info, filenm) => {
	let data = new FormData(); data.set('info', info); data.set('filenm', filenm);
	return fetch('https://medspb.info/WPTst/PHP/saveDebug.php', {method: 'POST', body: data});
}


// Installing Service Worker
self.addEventListener('install', event => {
	self.skipWaiting();
	event.waitUntil(
	caches.open(CACHE)
		.then(cache => cache.addAll(URLS))
	//	.then(_ => self.skipWaiting()) //Force the SW to transition from installing -> active state
	);
});

/*
self.addEventListener('install', event => {
	self.skipWaiting();
	event.waitUntil(
	( async _=> {
		let cache = await caches.open(CACHE);
		for(let i=0; i < URLS.length; i++) {
			let url = URLS[i];
			await cache.add(url);
console.log(`${i} '${url}' - OK`);
		}
	} )()
	);
});
*/

self.addEventListener('activate', event => {
	event.waitUntil( (async _=>{
			const allCashes = await caches.keys();
			const cachesToDel = allCashes.filter( casheNm => casheNm !== CACHE );
			await Promise.all( cachesToDel.map(async casheNm => { await caches.delete(casheNm) } )  );
			await clients.claim();
		})() );
});

self.addEventListener("fetch", event => {
		if(event.request.method !== 'GET') return;
		event.respondWith(
			caches
			.match(event.request) // check if the request has already been cached
			.then(cached => cached || fetch(event.request))
		);
});

self.addEventListener("push", event=>{
	event.waitUntil( (async _=>{
		let pushData = event.data.json();
		if(!pushData || !pushData.title) {
			let err = `Received web push with bad pushData '${JSON.encode(pushData)}'`;
			return await self.registration.showNotification("Bad push", {body: err});
		}

		const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
		let client;
		if(allClients.length) {
			// Ищем активную вкладку
			client = allClients.find(c => c.visibilityState === 'visible');
		}

		if(!client)
			return await self.registration.showNotification(pushData.title, pushData);
	})() )
});


self.addEventListener('notificationclick', event=>{

	event.waitUntil( (async _=>{
try {
//await saveDebugInfo("D1", "D1");
//		let msg = "Can't get msg!!!"; if(event.notification.data && event.notification.data.msg) msg = event.notification.data.msg;
		await event.notification.close();

/*		const allClients = await self.clients.matchAll({ type: 'window' });
		let client;
		if(allClients.length) {
			// Ищем активную вкладку
			client = allClients.find(c => c.visibilityState === 'visible');
			if(!client) client = allClients[0];
		}
*/
//		if (client) {
// ver 1
/*
			const url = new URL(client.url);
			//url.searchParams.set('msg', JSON.stringify(msg));
			url.searchParams.set('msg', msg);
			client.navigate(url.href);
			client.focus();
*/

// ver 2
/* do not work
			client.focus(); client.postMessage(msg);
*/
//		}
}
catch(err) {
	return await saveDebugInfo(`${err.name} ${err.message}`, "ERROR");
}
	} ) () );
});

