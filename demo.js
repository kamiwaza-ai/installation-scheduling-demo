/* Standalone UI demonstration. No network, accounts, calendar data or storage. */
function createSlotDemo(clock = () => new Date()) {
  const bookings = new Map();
  const minutes = n => n * 60000;
  const wallClock = new Intl.DateTimeFormat('en-US', {timeZone:'America/Chicago',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
  function sampleSlots() {
    const now = clock().getTime();
    const result = [];
    for (let t = Math.ceil((now + minutes(120))/minutes(15))*minutes(15); t < now + 14*86400000; t += minutes(15)) {
      const parts = Object.fromEntries(wallClock.formatToParts(new Date(t)).map(x=>[x.type,x.value]));
      if (['Sat','Sun'].includes(parts.weekday) || !['09','11','13','15'].includes(parts.hour) || parts.minute !== '15') continue;
      const held = [...bookings.values()].some(b=>b.status === 'confirmed' && t < Date.parse(b.end)+minutes(15) && Date.parse(b.start)-minutes(15) < t+minutes(30));
      if (!held) result.push(new Date(t).toISOString());
    }
    return result;
  }
  function request(path, data={}) {
    if(path === '/api/slots') return {slots:sampleSlots()};
    if(path === '/api/book') {
      if(data.name !== 'Demo Client' || data.email !== 'client@example.com') throw Error('This preview accepts sample details only.');
      if(typeof data.key !== 'string' || !data.key) throw Error('Missing demo request key.');
      const old = bookings.get(data.key);
      if(old) { if(old.start !== data.start) throw Error('Request already used for another time.'); return {...old}; }
      if(!sampleSlots().includes(data.start)) throw Error('Choose an available sample time.');
      const b = {id:data.key,start:data.start,end:new Date(Date.parse(data.start)+minutes(30)).toISOString(),name:'Demo Client',email:'client@example.com',status:'confirmed',conferenceStatus:'success'};
      bookings.set(data.key,b);return {...b};
    }
    const b = [...bookings.values()].find(b=>b.id===data.id);
    if(!b) throw Error('Demo booking not found.');
    if(path === '/api/cancel') { b.status='cancelled'; return {...b}; }
    if(path === '/api/status') return {...b};
    throw Error('Unknown demo action.');
  }
  return {request};
}
if(typeof module !== 'undefined') module.exports={createSlotDemo};
