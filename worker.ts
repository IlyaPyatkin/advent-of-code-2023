// prevents TS errors
declare var self: Worker;

self.onmessage = (event: MessageEvent) => {
    console.log('inside', event.data);
    postMessage("world");
};
