let listener;
let queued = [];
export function subscribeFeedback(fn) { listener=fn; queued.splice(0).forEach(fn); return ()=>{listener=null;}; }
function send(event) { if(listener) listener(event); else queued.push(event); }
export function notify(message, options={}) { send({kind:'toast', message, ...options, id:crypto.randomUUID()}); }
export function confirmAction(message, options={}) { return new Promise(resolve=>send({kind:'confirm',message,resolve,...options})); }
