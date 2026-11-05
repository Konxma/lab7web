const base = process.env.API_URL || 'http://localhost:3000';
const names = ['Футболка Classic','Худі Urban','Джинси Straight','Сорочка Linen','Куртка Autumn','Светр Warm','Кросівки Sport'];
(async()=>{for(let i=0;i<names.length;i++){
 const list=await fetch(base+'/clothes?search='+encodeURIComponent(names[i])).then(r=>r.json());
 if(list.data?.some(x=>x.title===names[i])) continue;
 const res=await fetch(base+'/clothes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:names[i],price:650+i*150,size:'M',material:'Бавовна',color:'Чорний'})});
 if(!res.ok)throw new Error(await res.text());console.log(await res.json());
}})().catch(e=>{console.error(e);process.exitCode=1;});
