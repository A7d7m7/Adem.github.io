// Both experiences use the same portfolio content and CV catalog.
let experienceMode='intro';
const choiceDialog=document.getElementById('experience-choice');
const cvChoiceDialog=document.getElementById('cv-choice');
const workspace=document.getElementById('terminal-experience');
const explorerInput=document.getElementById('explorer-command');
const explorerLog=document.getElementById('explorer-log');
const modeSwitch=document.getElementById('mode-switch');
const commandHistory=[];
let historyPosition=0;
const projectContent=Array.from(document.querySelectorAll('.project')).map(article=>({
 title:article.querySelector('h3').textContent,
 description:article.querySelector('.projectbody>p').textContent,
 tools:article.querySelector('.project-tech').textContent,
 details:article.querySelector('details p').textContent,
 link:article.querySelector('.project-link')
}));
const profileText=Array.from(document.querySelectorAll('#profil .about>div:first-child>p')).map(el=>el.textContent).join('\n\n');
const skillText=Array.from(document.querySelectorAll('#profil .about>div:last-child .smalltitle')).map(label=>label.textContent+'\n'+Array.from(label.nextElementSibling.querySelectorAll('.tag')).map(el=>el.textContent).join(' · ')).join('\n\n');
const pathItems=Array.from(document.querySelectorAll('#parcours .timeline')).map(el=>({date:el.querySelector('.date').textContent,text:Array.from(el.querySelector('div').children).map(item=>item.textContent).join('\n')}));
const ctfText=Array.from(document.querySelectorAll('.ctf-record p')).map(el=>el.textContent).join('\n');
function plainLines(node){if(node.nodeType===3)return node.textContent;if(node.nodeName==='BR')return '\n';return Array.from(node.childNodes).map(plainLines).join('')+(['P','DIV'].includes(node.nodeName)?'\n':'')}
const personalText=plainLines(document.querySelector('.personal-notes')).trim();

function appendTerminalEntry(command,text,links=[]){
 const entry=document.createElement('div');entry.className='explorer-entry';
 if(command){const echo=document.createElement('p');echo.className='explorer-command-echo';echo.textContent='visiteur@adem:~$ '+command;entry.append(echo)}
 const output=document.createElement('pre');output.className='explorer-output';output.textContent=text;entry.append(output);
 if(links.length){
  const row=document.createElement('div');row.className='explorer-links';
  for(const item of links){const link=document.createElement('a');link.textContent=item.label;link.href=item.href;if(item.download)link.download=item.download;else if(item.href.startsWith('https://')){link.target='_blank';link.rel='noopener noreferrer'}row.append(link)}
  entry.append(row);
 }
 explorerLog.append(entry);explorerLog.scrollTop=explorerLog.scrollHeight;
 return entry;
}
function terminalWelcome(){
 appendTerminalEntry('',"ADEM MAKHTOUR / PORTFOLIO\n\nBienvenue dans mon univers. Ici, tout se découvre au terminal.\n\nTape aide pour afficher les commandes ou commence par whoami.\nPour mon CV : cv, puis le numéro du domaine.\nPour revenir aux sections : simple.");
}
function selectExperience(mode){
 experienceMode=mode;
 if(choiceDialog.open)choiceDialog.close();
 document.body.classList.remove('experience-intro','simple-experience','terminal-experience');
 document.body.classList.add(mode+'-experience');
 workspace.hidden=mode!=='terminal';modeSwitch.hidden=false;
 document.querySelector('main').inert=mode==='terminal';
 window.scrollTo({top:0,behavior:'instant'});
 fieldSize();sizeOrb();previousFrame=-1;configureMotion();schedule();
 if(mode==='terminal'){
  if(!explorerLog.children.length)terminalWelcome();
  explorerInput.focus({preventScroll:true});
 }else{
  const heading=document.getElementById('identity-name');heading.tabIndex=-1;heading.focus({preventScroll:true});
 }
}
function openExperienceChoice(){
 if(cvChoiceDialog.open)cvChoiceDialog.close();
 if(!choiceDialog.open)choiceDialog.showModal();
}
for(const button of document.querySelectorAll('[data-experience]'))button.addEventListener('click',()=>selectExperience(button.dataset.experience));
modeSwitch.addEventListener('click',openExperienceChoice);
choiceDialog.addEventListener('cancel',event=>{event.preventDefault();selectExperience(experienceMode==='intro'?'simple':experienceMode)});
// Keep the full name visible before asking the visitor to choose.
setTimeout(()=>{if(experienceMode==='intro')openExperienceChoice()},reducedQuery.matches?400:1800);

function openCvDialog(){
 if(!cvChoiceDialog.open)cvChoiceDialog.showModal();
}
document.getElementById('cv-close').addEventListener('click',()=>cvChoiceDialog.close());
for(const cv of CV_CATALOG){
 const link=document.createElement('a');link.className='cv-domain-link';link.href=cv.file;link.download=cv.downloadName;
 const title=document.createElement('strong');title.textContent=cv.domain;
 const format=document.createElement('small');format.textContent='PDF ↓';link.append(title,format);document.getElementById('simple-cv-options').append(link);
}
function showExplorerCv(command){
 appendTerminalEntry(command,'CV DISPONIBLES\n\n'+CV_CATALOG.map(cv=>cv.id+'. '+cv.domain+' (PDF)').join('\n')+'\n\nSaisis le numéro du domaine pour télécharger le CV.');
}
function downloadExplorerCv(cv,command){
 const entry=appendTerminalEntry(command,'Téléchargement demandé : CV '+cv.domain+'.\nSi le téléchargement ne démarre pas, utilise le lien ci-dessous.',[{label:'Télécharger le PDF',href:cv.file,download:cv.downloadName}]);
 entry.querySelector('a').click();
}
function runExplorerCommand(raw){
 const value=raw.trim();if(!value)return;
 commandHistory.push(value);historyPosition=commandHistory.length;
 const command=value.toLocaleLowerCase('fr').replace(/\s+/g,' ');
 const aliases={'cat profil.txt':'profil','cat competences.txt':'competences','cat parcours.log':'parcours','cat contact.txt':'contact','ls':'aide','help':'aide','compétences':'competences','formation':'formations','intérêts':'interets','cv cyber':'cv 1','cv cybersecurite':'cv 1','cv cybersécurité':'cv 1'};
 const cmd=aliases[command]||command;
 const chosen=CV_CATALOG.find(cv=>cv.id===cmd||'cv '+cv.id===cmd);
 if(chosen){downloadExplorerCv(chosen,value);return}
 if(cmd==='aide')appendTerminalEntry(value,'COMMANDES\n\nwhoami / profil   Mon profil et ma recherche de stage\ncompetences       Réseaux, sécurité, programmation et web\nprojets           Liste de mes 6 projets\nprojets 1         Détails du projet numéro 1\nparcours          Expérience et formations\nformations        Mon parcours universitaire\nctf               Pratique et résultats en CTF\ninterets          Langues, musique et sports\ncontact           E-mail et liens professionnels\ncv                Choisir un CV par domaine\nclear             Effacer le terminal\nhistory           Historique des commandes\nsimple            Afficher le portfolio classique\nmode              Changer de mode\n\nLes flèches ↑ et ↓ permettent de retrouver tes commandes.');
 else if(cmd==='whoami'||cmd==='profil')appendTerminalEntry(value,profileText+'\n\nSTAGE / 4 À 6 MOIS / DÈS AVRIL 2027\nCréteil (94) · Cybersécurité, réseaux et systèmes.');
 else if(cmd==='competences')appendTerminalEntry(value,skillText);
 else if(cmd==='projets')appendTerminalEntry(value,projectContent.map((project,i)=>(i+1)+'. '+project.title+'\n   '+project.description+'\n   '+project.tools).join('\n\n')+'\n\nTape projets suivi du numéro pour en savoir plus.');
 else if(/^projets \d+$/.test(cmd)){
  const number=Number(cmd.split(' ')[1]),project=projectContent[number-1];
  if(project)appendTerminalEntry(value,project.title+'\n\n'+project.details+'\n\nOutils : '+project.tools,project.link?[{label:'Visiter le projet ↗',href:project.link.href}]:[]);
  else appendTerminalEntry(value,'Ce projet n’existe pas. Tape projets pour voir la liste.');
 }
 else if(cmd==='parcours'||cmd==='formations')appendTerminalEntry(value,pathItems.filter(item=>cmd==='parcours'||item.date.includes('FORMATION')).map(item=>item.date+'\n'+item.text).join('\n\n'));
 else if(cmd==='ctf')appendTerminalEntry(value,ctfText);
 else if(cmd==='interets')appendTerminalEntry(value,personalText);
 else if(cmd==='contact')appendTerminalEntry(value,'ADEM MAKHTOUR\nCréteil (94) · Permis B\nE-mail : maktouradem@gmail.com\nTéléphone : +33 6 78 53 38 00',[{label:'Envoyer un e-mail',href:'mailto:maktouradem@gmail.com'},{label:'GitHub ↗',href:'https://github.com/A7d7m7'},{label:'LinkedIn ↗',href:'https://www.linkedin.com/in/makhtour-adem'}]);
 else if(cmd==='cv'||cmd==='menu')showExplorerCv(value);
 else if(cmd==='clear')explorerLog.replaceChildren();
 else if(cmd==='history')appendTerminalEntry(value,commandHistory.map((item,i)=>(i+1)+'  '+item).join('\n'));
 else if(cmd==='simple'){selectExperience('simple');return}
 else if(cmd==='mode'){openExperienceChoice();return}
 else if(cmd==='bonjour')appendTerminalEntry(value,'Bonjour ! Moi, c’est Adem. Tape whoami pour faire connaissance.');
 else appendTerminalEntry(value,'Commande inconnue. Tape aide pour découvrir les commandes disponibles.');
}
document.getElementById('explorer-form').addEventListener('submit',event=>{event.preventDefault();const value=explorerInput.value;explorerInput.value='';runExplorerCommand(value)});
explorerInput.addEventListener('keydown',event=>{
 if(event.key==='ArrowUp'){event.preventDefault();historyPosition=Math.max(0,historyPosition-1);explorerInput.value=commandHistory[historyPosition]||''}
 else if(event.key==='ArrowDown'){event.preventDefault();historyPosition=Math.min(commandHistory.length,historyPosition+1);explorerInput.value=commandHistory[historyPosition]||''}
});
