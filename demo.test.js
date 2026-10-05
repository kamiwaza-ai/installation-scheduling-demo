const {test}=require('node:test');const assert=require('node:assert/strict');const {createSlotDemo}=require('./demo.js');
const make=()=>createSlotDemo(()=>new Date('2026-10-05T00:00:00Z'));
const input=d=>({key:'demo-1',start:d.request('/api/slots').slots[0],name:'Demo Client',email:'client@example.com'});
test('sample slots use future weekdays and Central daytime',()=>{const d=make();const slots=d.request('/api/slots').slots;assert.equal(slots[0],'2026-10-05T14:15:00.000Z');assert.ok(slots.length>0);assert.ok(slots.every(s=>!['Sat','Sun'].includes(new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',weekday:'short'}).format(new Date(s)))))});
test('booking, repeat submission, cancellation and release',()=>{const d=make(),p=input(d);const b=d.request('/api/book',p);assert.deepEqual(d.request('/api/book',p),b);assert.ok(!d.request('/api/slots').slots.includes(p.start));assert.equal(d.request('/api/cancel',{id:b.id}).status,'cancelled');assert.equal(d.request('/api/book',p).status,'cancelled');assert.ok(d.request('/api/slots').slots.includes(p.start))});
test('same key cannot book another slot',()=>{const d=make(),p=input(d);d.request('/api/book',p);assert.throws(()=>d.request('/api/book',{...p,start:d.request('/api/slots').slots[0]}))});
test('real details rejected',()=>{const d=make(),p=input(d);assert.throws(()=>d.request('/api/book',{...p,email:'someone@company.com'}))});
test('fresh instance resets demo',()=>{const d=make(),p=input(d);d.request('/api/book',p);assert.ok(make().request('/api/slots').slots.includes(p.start))});
test('daylight saving offset follows Central time',()=>{const d=createSlotDemo(()=>new Date('2026-11-02T00:00:00Z'));assert.equal(d.request('/api/slots').slots[0],'2026-11-02T15:15:00.000Z')});
