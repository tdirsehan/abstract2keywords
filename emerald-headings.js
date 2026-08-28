document.addEventListener('DOMContentLoaded',()=>{
  const $=id=>document.getElementById(id);
  const structuredBtn=$('structuredBtn');
  const unstructuredBtn=$('unstructuredBtn');
  const abstractEl=$('abstract');
  const panel=$('structuredPanel');
  if(!structuredBtn||!abstractEl||!panel)return;

  const boxes=panel.querySelectorAll('.section-box');
  const headings=['Purpose','Design/methodology/approach','Findings','Originality/value'];
  boxes.forEach((box,i)=>{
    const strong=box.querySelector('.section-title strong');
    const ta=box.querySelector('textarea');
    if(strong)strong.textContent=headings[i];
    if(ta)ta.placeholder='Enter '+headings[i]+'...';
  });

  let convertBtn=$('convertBtn');
  if(!convertBtn){
    convertBtn=document.createElement('button');
    convertBtn.id='convertBtn';
    convertBtn.type='button';
    convertBtn.textContent='Convert to Structured Abstract';
    convertBtn.style.cssText='width:100%;margin-top:12px;min-height:48px;border:1px solid #c7d2fe;border-radius:14px;background:linear-gradient(135deg,#eef2ff,#f5f3ff);color:#4338ca;font:inherit;font-weight:850;cursor:pointer';
    const meta=abstractEl.parentElement.querySelector('.meta');
    (meta||abstractEl).insertAdjacentElement('afterend',convertBtn);
  }

  const countWords=t=>(t.trim().match(/\b[\w’-]+\b/g)||[]).length;
  const splitSentences=text=>(text.replace(/\s+/g,' ').match(/[^.!?]+(?:[.!?]+|$)/g)||[]).map(s=>s.trim()).filter(Boolean);
  const TERMS={
    purpose:['aim','aims','objective','purpose','investigate','investigates','examine','examines','explore','explores','address','addresses','question','gap','context','focuses','seeks','problem'],
    design:['method','methods','methodology','design','sample','participants','respondents','survey','experiment','experimental','interview','interviews','dataset','data','collected','analysis','analyzed','analysed','regression','sem','pls','cfa','efa','procedure','measurement','panel','cross-sectional','longitudinal','qualitative','quantitative'],
    findings:['result','results','finding','findings','found','revealed','showed','shows','indicated','indicates','demonstrated','demonstrates','significant','significantly','supported','association','effect','relationship','positive','negative','higher','lower'],
    originality:['original','originality','novel','novelty','value','contribution','contributes','implication','implications','extends','advance','advances','first','new','unique','theoretical','managerial','policy','highlights','underscores']
  };
  const termScore=(sentence,terms)=>{const t=' '+sentence.toLowerCase().replace(/[^a-z0-9-]+/g,' ')+' ';return terms.reduce((n,w)=>n+(t.includes(' '+w+' ')?1:0),0)};
  function classify(s,i,total){
    const pos=total<=1?0:i/(total-1), l=s.toLowerCase();
    const scores={purpose:termScore(s,TERMS.purpose),design:termScore(s,TERMS.design),findings:termScore(s,TERMS.findings),originality:termScore(s,TERMS.originality)};
    if(pos<.3)scores.purpose+=1; else if(pos<.55)scores.design+=.6; else if(pos<.82)scores.findings+=.6; else scores.originality+=.8;
    if(/\b(this study|this research|we (aim|investigate|examine|explore)|the aim|the objective|the purpose)\b/.test(l))scores.purpose+=2.5;
    if(/\b(we (used|collected|analyzed|analysed|conducted|surveyed|estimated)|sample of|participants|respondents)\b/.test(l))scores.design+=2.5;
    if(/\b(results?|findings?) (show|showed|indicate|indicated|reveal|revealed|suggest|suggested)\b/.test(l))scores.findings+=3;
    if(/\b(originality|novel|novelty|contributes|contribution|extends|first study|unique value|implications?)\b/.test(l))scores.originality+=3;
    return Object.entries(scores).sort((a,b)=>b[1]-a[1])[0][0];
  }
  function refreshCounters(){
    ['s1','s2','s3','s4'].forEach((id,i)=>{const ta=$(id),c=$('c'+(i+1));if(ta&&c){const n=countWords(ta.value);c.textContent=`${n} / 100 words`;c.classList.toggle('over',n>100)}});
    if($('overallCount')){const n=['s1','s2','s3','s4'].reduce((a,id)=>a+($(id)?countWords($(id).value):0),0);$('overallCount').textContent=`Total: ${n} / 500 words`;}
  }
  function convert(){
    const text=abstractEl.value.trim();
    const status=$('status');
    if(text.length<80){if(status){status.textContent='Please enter a fuller unstructured abstract before converting it.';status.className='status error';}return;}
    const sentences=splitSentences(text), groups={purpose:[],design:[],findings:[],originality:[]};
    sentences.forEach((s,i)=>groups[classify(s,i,sentences.length)].push(s));
    const keys=['purpose','design','findings','originality'];
    if(sentences.length>=4){keys.forEach((k,idx)=>{if(!groups[k].length){const donor=keys.slice().sort((a,b)=>groups[b].length-groups[a].length).find(d=>groups[d].length>1);if(donor)groups[k].push(groups[donor].splice(idx===0?0:groups[donor].length-1,1)[0]);}})}
    ['s1','s2','s3','s4'].forEach((id,i)=>{if($(id))$(id).value=groups[keys[i]].join(' ')});
    refreshCounters();
    structuredBtn.click();
    if(status){status.textContent='Converted to Purpose, Design/methodology/approach, Findings, and Originality/value. Please review the section assignment before final use.';status.className='status ok';}
  }
  convertBtn.onclick=convert;

  const originalStructuredHandler=structuredBtn.onclick;
  structuredBtn.onclick=(e)=>{
    if(typeof originalStructuredHandler==='function') originalStructuredHandler.call(structuredBtn,e);
    boxes.forEach((box,i)=>{const strong=box.querySelector('.section-title strong');if(strong)strong.textContent=headings[i];});
  };
});