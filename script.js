// helpers
const $ = sel => document.querySelector(sel);
const create = (tag, cls) => { const el = document.createElement(tag); if(cls) el.className = cls; return el };

// elements
const logoInput = $('#logoInput');
const logoPreview = $('#logoPreview');
const coverLogo = $('#coverLogo');
const clearLogo = $('#clearLogo');

const fldUni = $('#fldUni');
const fldCourse = $('#fldCourse');
const fldNumber = $('#fldNumber');
const fldName = $('#fldName');
const fldRoll = $('#fldRoll');
const fldDate = $('#fldDate');
const fldDocTitle = $('#fldDocTitle');

const vUni = $('#vUni');
const vCourse = $('#vCourse');
const vNumber = $('#vNumber');
const vName = $('#vName');
const vRoll = $('#vRoll');
const vDate = $('#vDate');
const vDocTitle = $('#vDocTitle');
const vCount = $('#vCount');

const btnAddItem = $('#btnAddItem');
const btnClearAll = $('#btnClearAll');
const btnExport = $('#btnExport');
const btnCollapseAll = $('#btnCollapseAll');
const btnExpandAll = $('#btnExpandAll');
const btnAutoNumber = $('#btnAutoNumber');
const btnSaveLocal = $('#btnSaveLocal');
const btnLoadLocal = $('#btnLoadLocal');
const btnResetLocal = $('#btnResetLocal');

const qaList = $('#qaList');
const paper = $('#paper');

// default date today
const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, '0');
const dd = String(today.getDate()).padStart(2, '0');
fldDate.value = `${yyyy}-${mm}-${dd}`;

// live bindings
const bind = (input, view, fallback) => {
  const set = () => view.textContent = input.value.trim() || fallback;
  input.addEventListener('input', set);
  set();
};
bind(fldUni, vUni, 'University name');
bind(fldCourse, vCourse, 'Course name');
bind(fldNumber, vNumber, 'Assignment number');
bind(fldName, vName, 'Your name');
bind(fldRoll, vRoll, 'Roll number');
bind(fldDocTitle, vDocTitle, 'Document title');
fldDate.addEventListener('input', ()=> vDate.textContent = fldDate.value || 'YYYY-MM-DD');
vDate.textContent = fldDate.value || 'YYYY-MM-DD';

// logo upload
function setLogo(src){
  logoPreview.src = src || '';
  coverLogo.src = src || '';
  coverLogo.style.background = src ? 'transparent' : '#f1f5f9';
}
clearLogo.addEventListener('click', ()=> setLogo(''));
logoInput.addEventListener('change', (e)=>{
  const file = e.target.files?.[0];
  if(!file) return;
  const r = new FileReader();
  r.onload = () => setLogo(r.result);
  r.readAsDataURL(file);
});

// block creators
function addTextBlock(card, initialText = ''){
  const wrapper = create('div','block-editor edit-only');
  const top = create('div','row');
  const label = create('div','label'); label.textContent = 'Text';
  const kill = create('button','kill'); kill.textContent = 'Remove';
  top.append(label, kill);

  const ta = create('textarea','textarea'); ta.placeholder = 'Write the answer here'; ta.value = initialText;

  wrapper.append(top, ta);
  card.editBlocks.appendChild(wrapper);

  kill.addEventListener('click', ()=>{
    wrapper.remove();
    card.render && card.render();
  });
  ta.addEventListener('input', ()=> card.render && card.render());

  card.render && card.render();
}

function addCodeBlock(card, lang = 'auto', initial = ''){
  const wrapper = create('div','block-editor edit-only');
  const top = create('div','row');
  const label = create('div','label'); label.textContent = 'Code';
  const kill = create('button','kill'); kill.textContent = 'Remove';

  const sel = create('select','select');
  ['auto','sql','csharp','cpp','python','javascript','html','css','bash','json'].forEach(l=>{
    const opt = create('option');
    opt.value = l; opt.textContent = l.toUpperCase();
    sel.appendChild(opt);
  });
  sel.value = lang || 'auto';

  top.append(label, sel, kill);

  const ta = create('textarea','textarea'); ta.placeholder = 'Paste code here'; ta.value = initial;

  wrapper.append(top, ta);
  card.editBlocks.appendChild(wrapper);

  kill.addEventListener('click', ()=>{
    wrapper.remove();
    card.render && card.render();
  });
  [ta, sel].forEach(el=> el.addEventListener('input', ()=> card.render && card.render()));

  card.render && card.render();
}

// item factory
function makeItem({question = '', texts = [''], codes = []} = {}){
  const card = create('div','card');

  // question editor
  const qLbl = create('div','q'); qLbl.textContent = 'Question';
  const qEdit = create('textarea','input edit-only');
  qEdit.style.width = '100%';
  qEdit.style.minHeight = '60px';
  qEdit.placeholder = 'Question is required';
  qEdit.value = question;

  // tools
  const cardTools = create('div','card-tools edit-only');
  const addTextBtn = create('button','mini primary'); addTextBtn.textContent = 'Add text';
  const addCodeBtn = create('button','mini primary'); addCodeBtn.textContent = 'Add code';
  const up = create('button','mini ghost'); up.textContent = 'Move up';
  const down = create('button','mini ghost'); down.textContent = 'Move down';
  const collapse = create('button','mini ghost'); collapse.textContent = 'Collapse';
  const del = create('button','mini ghost'); del.textContent = 'Delete';
  cardTools.append(addTextBtn, addCodeBtn, up, down, collapse, del);

  // blocks container
  const editBlocks = create('div'); editBlocks.className = 'edit-blocks'; card.editBlocks = editBlocks;

  // rendered view
  const view = create('div');
  const vTitle = create('div','item-title'); // Question N
  const vQ = create('div','q');              // question text
  const vA = create('div','a');              // holds answers and code
  view.append(vTitle, vQ, vA);

  // compose
  card.append(qLbl, qEdit, cardTools, editBlocks, view);
  qaList.append(card);

  // renderer
  function render(){
    // numbering
    const idx = [...qaList.children].indexOf(card) + 1;
    vTitle.textContent = `Question ${idx}`;

    // question text
    const qText = qEdit.value.trim();
    vQ.textContent = qText || 'Untitled question';

    // gather blocks
    vA.innerHTML = '';
    const blocks = [...editBlocks.children];

    const textBlocks = blocks.filter(b => b.querySelector('.label')?.textContent === 'Text');
    const codeBlocks = blocks.filter(b => b.querySelector('.label')?.textContent === 'Code');

    // render text blocks with headings
    textBlocks.forEach((b, i)=>{
      const title = create('div','subhead');
      title.textContent = textBlocks.length > 1 ? `Answer ${i+1}` : 'Answer';
      const text = b.querySelector('textarea')?.value || '';
      const p = create('div'); p.className = 'a'; p.textContent = text;
      vA.append(title, p);
    });

    // render code blocks with headings
    codeBlocks.forEach((b, i)=>{
      const title = create('div','subhead');
      title.textContent = codeBlocks.length > 1 ? `Code ${i+1}` : 'Code';
      const ta = b.querySelector('textarea');
      const sel = b.querySelector('select');
      const pre = create('pre');
      const code = create('code');
      const chosen = sel?.value || 'auto';
      if(chosen && chosen !== 'auto'){ code.className = 'language-' + chosen; }
      code.textContent = ta?.value || '';
      pre.append(code);
      vA.append(title, pre);
      try{ hljs.highlightElement(code) }catch(e){}
    });

    updateCount();
  }
  card.render = render;

  // seed after renderer exists
  if(texts.length === 0) texts = [''];
  texts.forEach(t => addTextBlock(card, t));
  codes.forEach(c => addCodeBlock(card, c.lang, c.code));

  // events
  qEdit.addEventListener('input', ()=>{
    qEdit.classList.remove('error');
    render();
  });

  addTextBtn.addEventListener('click', ()=> addTextBlock(card, ''));
  addCodeBtn.addEventListener('click', ()=> addCodeBlock(card, 'auto', ''));

  up.addEventListener('click', ()=>{
    const prev = card.previousElementSibling;
    if(prev){ qaList.insertBefore(card, prev); renumber(); }
  });
  down.addEventListener('click', ()=>{
    const next = card.nextElementSibling;
    if(next){ qaList.insertBefore(next, card); renumber(); }
  });
  del.addEventListener('click', ()=> { card.remove(); renumber(); });

  let collapsed = false;
  collapse.addEventListener('click', ()=>{
    collapsed = !collapsed;
    qEdit.style.display = collapsed ? 'none' : '';
    editBlocks.style.display = collapsed ? 'none' : '';
    collapse.textContent = collapsed ? 'Expand' : 'Collapse';
  });

  render();
  renumber(); // make sure numbering shows on add
}

function updateCount(){
  vCount.textContent = String(qaList.children.length);
}

function renumber(){
  [...qaList.children].forEach(card=>{
    if(card.render) card.render();
  });
  updateCount();
}

// add item
btnAddItem.addEventListener('click', ()=> makeItem({}));

btnClearAll.addEventListener('click', ()=>{
  if(confirm('Remove all items, continue')){ qaList.innerHTML=''; updateCount(); }
});

btnCollapseAll.addEventListener('click', ()=>{
  [...qaList.children].forEach(card=>{
    const btn = [...card.querySelectorAll('.card-tools button')].find(b => b.textContent.trim() === 'Collapse');
    if(btn) btn.click();
  });
});
btnExpandAll.addEventListener('click', ()=>{
  [...qaList.children].forEach(card=>{
    const btn = [...card.querySelectorAll('.card-tools button')].find(b => b.textContent.trim() === 'Expand');
    if(btn) btn.click();
  });
});

btnAutoNumber.addEventListener('click', ()=>{
  [...qaList.children].forEach((card, i)=>{
    const qEdit = card.querySelector('textarea.input');
    if(qEdit){
      const base = qEdit.value.replace(/^\d+\)\s*/, '');
      qEdit.value = `${i+1}) ${base}`;
      qEdit.dispatchEvent(new Event('input'));
    }
  });
});

// local save, load
function snapshot(){
  return {
    logo: coverLogo.src || '',
    uni: fldUni.value,
    course: fldCourse.value,
    number: fldNumber.value,
    name: fldName.value,
    roll: fldRoll.value,
    date: fldDate.value,
    title: fldDocTitle.value,
    items: [...qaList.children].map(card=>{
      const q = card.querySelector('textarea.input')?.value || '';
      const blocks = [...card.querySelectorAll('.block-editor')].map(b=>{
        const kind = b.querySelector('.label')?.textContent || 'Text';
        if(kind === 'Text'){
          return { type:'text', text: b.querySelector('textarea')?.value || '' };
        }else{
          return {
            type:'code',
            lang: b.querySelector('select')?.value || 'auto',
            code: b.querySelector('textarea')?.value || ''
          };
        }
      });
      return { question:q, blocks };
    })
  };
}
function hydrate(s){
  try{
    setLogo(s.logo || '');
    fldUni.value = s.uni || '';
    fldCourse.value = s.course || '';
    fldNumber.value = s.number || '';
    fldName.value = s.name || '';
    fldRoll.value = s.roll || '';
    fldDate.value = s.date || '';
    fldDocTitle.value = s.title || '';
    [fldUni,fldCourse,fldNumber,fldName,fldRoll,fldDate,fldDocTitle].forEach(x=> x.dispatchEvent(new Event('input')));
    qaList.innerHTML='';
    (s.items||[]).forEach(it=>{
      const texts = [];
      const codes = [];
      (it.blocks||[]).forEach(b=>{
        if(b.type === 'code') codes.push({lang:b.lang||'auto', code:b.code||''});
        else texts.push(b.text||'');
      });
      makeItem({question: it.question||'', texts: texts.length?texts:[''], codes});
    });
    renumber();
  }catch(e){
    alert('Failed to load saved state');
  }
}
btnSaveLocal.addEventListener('click', ()=>{
  localStorage.setItem('assignment_builder_v2', JSON.stringify(snapshot()));
  alert('Saved locally');
});
btnLoadLocal.addEventListener('click', ()=>{
  const raw = localStorage.getItem('assignment_builder_v2');
  if(!raw) return alert('No saved state found');
  hydrate(JSON.parse(raw));
});
btnResetLocal.addEventListener('click', ()=>{
  localStorage.removeItem('assignment_builder_v2');
  alert('Saved state cleared');
});

// export with clean view only
btnExport.addEventListener('click', async ()=>{
  let ok = true;
  [...qaList.children].forEach(card=>{
    const qEdit = card.querySelector('textarea.input');
    if(!qEdit.value.trim()){
      ok = false;
      qEdit.classList.add('error');
      qEdit.scrollIntoView({behavior:'smooth', block:'center'});
    }
  });
  if(!ok){ alert('Every item must have a Question'); return; }

  document.body.classList.add('exporting');
  await new Promise(r=> setTimeout(r, 150));

  const opt = {
    margin: [10,10,10,10],
    filename: (fldDocTitle.value?.trim() || 'assignment') + '.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  await html2pdf().set(opt).from(paper).save();

  document.body.classList.remove('exporting');
});

// initial example
makeItem({
  question:'Write SQL to select name and age from students where age is greater than 20',
  texts:['We filter rows using a WHERE clause on the age column'],
  codes:[{lang:'sql', code:'SELECT name, age\nFROM students\nWHERE age > 20;'}]
});
