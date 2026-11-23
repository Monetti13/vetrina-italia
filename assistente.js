/* Mercatale, assistente di ricerca per i buyer (versione senza AI: tutto gira nel browser).
   Per spegnerlo: window.MERCATALE_ASSISTENTE = {attivo:false} prima di questo file, oppure togliere il file dalla pagina.
   Per collegare un servizio AI (dopo approvazione): window.MERCATALE_ASSISTENTE = {ai:"https://..."}.
   Se il servizio non risponde, la ricerca continua con le regole qui sotto. */
(function(){
"use strict";
var CFG = Object.assign({attivo:true, ai:"", maxLen:300}, window.MERCATALE_ASSISTENTE||{});
if(!CFG.attivo || typeof EX==="undefined" || typeof T==="undefined") return;
var DEMO = /[?&]demo=1/.test(location.search);

/* ---------- testi ---------- */
var L = {
 it:{lbl:"Descrivi il prodotto che cerchi", ph:"Es. olio extravergine biologico per la Germania", go:"Cerca", mic:"Detta la richiesta",
  try:"Prova:", ex:["vino rosso del Piemonte","olio biologico per la Germania","pasta di grano duro, minimo 20 cartoni"],
  got:"Ho capito:", unused:"Parole non usate:", none0:"Non ho capito cosa cerchi. Indica un prodotto, una certificazione, una regione o un Paese di consegna.",
  gA:"Corrisponde", gB:"Possibile: manca un dato", gN:"Non presente in fiera",
  gNp:"Oggi nessuna azienda in fiera corrisponde a questa richiesta.", write:"Scrivici cosa cerchi", why:"Perché non vedo le altre aziende",
  open:"Apri la vetrina", add:"Aggiungi alla selezione", rem:"Togli dalla selezione", sel:"La tua selezione", copy:"Copia il link", copied:"Link copiato", clear:"Svuota", shared:"Selezione condivisa",
  noData:"Dati che la fiera non ha ancora: {x}. Chiedili direttamente al produttore.",
  vl:"Lingua della dettatura", wait:"Sto interpretando la richiesta…", only:"Senza il servizio AI capisco solo italiano, inglese e tedesco.", micOn:"Ti ascolto: parla, poi controlla il testo.", micOk:"Controlla il testo e premi Cerca.", micErr:"Non riesco a usare il microfono. Puoi scrivere la richiesta.",
  es:"Esempio", esm:"Azienda di esempio, non reale: serve solo a provare la ricerca.", demoB:"<b>Demo</b> Le aziende con l'etichetta Esempio non sono reali. Vetrine non ancora pubblicate sul sito ufficiale.",
  facts:function(n){return n+" stand in modalità demo, quasi tutti di esempio.";},
  c:{cat:"Categoria", reg:"Regione", cert:"Certificazione", exp:"Consegna in", lg:"Lingua", moq:"Ordine minimo fino a", kw:"Parole", ct:"cartoni"},
  ok:{kw:"In vetrina: {x}", cert:"Certificazione {x}", exp:"Esporta già in {x}", moq:"Ordine minimo: {x} cartoni", lg:"Parla {x}"},
  gap:{cert:"Certificazione {x}: dato da completare", exp0:"Paesi di export: dato da completare", expN:"Non indica export in {x}: da chiedere", moq:"Ordine minimo: dato da completare", lg:"Lingua {x}: non indicata", kw:"«{x}» non è tra i prodotti in vetrina", mix:"Specialità miste: prodotto da verificare"},
  no:{cat:"altra categoria ({x})", reg:"altra regione ({x})", cert:"non ha la certificazione {x}", moq:"ordine minimo di {x} cartoni", kw:"nessuna corrispondenza con «{x}»"},
  nd:{age:"stagionatura", shelf:"shelf-life", price:"prezzi", pallet:"pallet e trasporto", pl:"private label", diet:"requisiti alimentari (senza glutine, vegano e simili)", qty:"quantità disponibili"},
  lgn:{it:"italiano",en:"inglese",de:"tedesco",fr:"francese",es:"spagnolo"},
  pf:"Profilo export", pfMiss:"Mancano:", pfFull:"Profilo completo.", pfNote:"Misura quanto è completo il profilo, non la qualità dell'azienda.",
  pfp:{prod:"Prodotti e formati", merc:"Mercati e lingue", log:"Logistica", cap:"Ordine minimo e capacità", cert:"Certificazioni"},
  mf:{y:"anno di fondazione", fmt:"formato dei prodotti", pdesc:"descrizione dei prodotti", exp:"Paesi in cui esportate", lg:"lingue parlate", ship:"termini di consegna", shelf:"shelf-life dei prodotti", moq:"ordine minimo (cartoni)", cap:"capacità produttiva", certs:"certificazioni", certp:"prova delle certificazioni (link o file)", b2b:"listino prezzi per i buyer"}},
 en:{lbl:"Describe the product you are looking for", ph:"E.g. organic extra virgin olive oil for Germany", go:"Search", mic:"Dictate your request",
  try:"Try:", ex:["red wine from Piedmont","organic olive oil for Germany","durum wheat pasta, minimum 20 cartons"],
  got:"I understood:", unused:"Words not used:", none0:"I did not understand what you are looking for. Name a product, a certification, a region or a delivery country.",
  gA:"Matches", gB:"Possible: a detail is missing", gN:"Not at the fair",
  gNp:"No company at the fair matches this request today.", write:"Tell us what you need", why:"Why I do not see the other companies",
  open:"Open the stand", add:"Add to selection", rem:"Remove from selection", sel:"Your selection", copy:"Copy link", copied:"Link copied", clear:"Clear", shared:"Shared selection",
  noData:"Details the fair does not have yet: {x}. Ask the producer directly.",
  vl:"Dictation language", wait:"Interpreting your request…", only:"Without the AI service I only understand Italian, English and German.", micOn:"Listening: speak, then check the text.", micOk:"Check the text and press Search.", micErr:"I cannot use the microphone. You can type your request.",
  es:"Example", esm:"Example company, not real: it is only here to try the search.", demoB:"<b>Demo</b> Companies tagged Example are not real. Stands not yet published on the official site.",
  facts:function(n){return n+" stands in demo mode, almost all examples.";},
  c:{cat:"Category", reg:"Region", cert:"Certification", exp:"Delivery to", lg:"Language", moq:"Minimum order up to", kw:"Words", ct:"cartons"},
  ok:{kw:"On the stand: {x}", cert:"{x} certification", exp:"Already exports to {x}", moq:"Minimum order: {x} cartons", lg:"Speaks {x}"},
  gap:{cert:"{x} certification: to be completed", exp0:"Export countries: to be completed", expN:"No export to {x} listed: ask the producer", moq:"Minimum order: to be completed", lg:"Language {x}: not listed", kw:"“{x}” is not among the products on the stand", mix:"Mixed specialities: product to be checked"},
  no:{cat:"other category ({x})", reg:"other region ({x})", cert:"no {x} certification", moq:"minimum order of {x} cartons", kw:"no match for “{x}”"},
  nd:{age:"ageing", shelf:"shelf life", price:"prices", pallet:"pallets and transport", pl:"private label", diet:"dietary requirements (gluten free, vegan and similar)", qty:"available quantities"},
  lgn:{it:"Italian",en:"English",de:"German",fr:"French",es:"Spanish"},
  pf:"Export profile", pfMiss:"Missing:", pfFull:"Profile complete.", pfNote:"It measures how complete the profile is, not the quality of the company.",
  pfp:{prod:"Products and formats", merc:"Markets and languages", log:"Logistics", cap:"Minimum order and capacity", cert:"Certifications"},
  mf:{y:"founding year", fmt:"product formats", pdesc:"product descriptions", exp:"countries you export to", lg:"languages spoken", ship:"delivery terms", shelf:"product shelf life", moq:"minimum order (cartons)", cap:"production capacity", certs:"certifications", certp:"proof of certifications (link or file)", b2b:"trade price list"}},
 de:{lbl:"Beschreiben Sie das gesuchte Produkt", ph:"Z. B. Bio-Olivenöl extra vergine für Deutschland", go:"Suchen", mic:"Anfrage diktieren",
  try:"Beispiele:", ex:["Rotwein aus dem Piemont","Bio-Olivenöl für Deutschland","Hartweizenpasta, mindestens 20 Kartons"],
  got:"Verstanden:", unused:"Nicht verwendete Wörter:", none0:"Ich habe nicht verstanden, was Sie suchen. Nennen Sie ein Produkt, eine Zertifizierung, eine Region oder ein Lieferland.",
  gA:"Passt", gB:"Möglich: eine Angabe fehlt", gN:"Nicht auf der Messe",
  gNp:"Heute passt kein Unternehmen auf der Messe zu dieser Anfrage.", write:"Schreiben Sie uns, was Sie suchen", why:"Warum ich die anderen Unternehmen nicht sehe",
  open:"Stand öffnen", add:"Zur Auswahl hinzufügen", rem:"Aus der Auswahl entfernen", sel:"Ihre Auswahl", copy:"Link kopieren", copied:"Link kopiert", clear:"Leeren", shared:"Geteilte Auswahl",
  noData:"Angaben, die die Messe noch nicht hat: {x}. Fragen Sie direkt beim Erzeuger nach.",
  vl:"Diktiersprache", wait:"Ich interpretiere Ihre Anfrage…", only:"Ohne den KI-Dienst verstehe ich nur Italienisch, Englisch und Deutsch.", micOn:"Ich höre zu: Sprechen Sie, dann prüfen Sie den Text.", micOk:"Prüfen Sie den Text und klicken Sie auf Suchen.", micErr:"Das Mikrofon lässt sich nicht nutzen. Sie können die Anfrage schreiben.",
  es:"Beispiel", esm:"Beispielunternehmen, nicht real: nur zum Testen der Suche.", demoB:"<b>Demo</b> Unternehmen mit dem Etikett Beispiel sind nicht real. Stände noch nicht veröffentlicht.",
  facts:function(n){return n+" Stände im Demomodus, fast alle Beispiele.";},
  c:{cat:"Kategorie", reg:"Region", cert:"Zertifizierung", exp:"Lieferung nach", lg:"Sprache", moq:"Mindestbestellung bis", kw:"Wörter", ct:"Kartons"},
  ok:{kw:"Am Stand: {x}", cert:"Zertifizierung {x}", exp:"Exportiert bereits nach {x}", moq:"Mindestbestellung: {x} Kartons", lg:"Spricht {x}"},
  gap:{cert:"Zertifizierung {x}: wird ergänzt", exp0:"Exportländer: wird ergänzt", expN:"Kein Export nach {x} angegeben: bitte nachfragen", moq:"Mindestbestellung: wird ergänzt", lg:"Sprache {x}: nicht angegeben", kw:"„{x}“ ist nicht unter den Produkten am Stand", mix:"Gemischte Spezialitäten: Produkt zu prüfen"},
  no:{cat:"andere Kategorie ({x})", reg:"andere Region ({x})", cert:"keine Zertifizierung {x}", moq:"Mindestbestellung von {x} Kartons", kw:"kein Treffer für „{x}“"},
  nd:{age:"Reifung", shelf:"Haltbarkeit", price:"Preise", pallet:"Paletten und Transport", pl:"Eigenmarke", diet:"Ernährungsanforderungen (glutenfrei, vegan und Ähnliches)", qty:"verfügbare Mengen"},
  lgn:{it:"Italienisch",en:"Englisch",de:"Deutsch",fr:"Französisch",es:"Spanisch"},
  pf:"Exportprofil", pfMiss:"Es fehlen:", pfFull:"Profil vollständig.", pfNote:"Es misst, wie vollständig das Profil ist, nicht die Qualität des Unternehmens.",
  pfp:{prod:"Produkte und Formate", merc:"Märkte und Sprachen", log:"Logistik", cap:"Mindestbestellung und Kapazität", cert:"Zertifizierungen"},
  mf:{y:"Gründungsjahr", fmt:"Produktformate", pdesc:"Produktbeschreibungen", exp:"Exportländer", lg:"gesprochene Sprachen", ship:"Lieferbedingungen", shelf:"Haltbarkeit der Produkte", moq:"Mindestbestellung (Kartons)", cap:"Produktionskapazität", certs:"Zertifizierungen", certp:"Nachweis der Zertifizierungen (Link oder Datei)", b2b:"Händlerpreisliste"}}
};
function tr(k){ var o=L[lang]||L.it, p=k.split("."); for(var i=0;i<p.length;i++){ o=o[p[i]]; if(o==null) return k; } return o; }
function fill(s,x){ return String(s).replace("{x}",x); }
function kwl(k){ return k==="granoduro" ? ({it:"grano duro",en:"durum wheat",de:"Hartweizen"}[lang]||k) : k; }

/* ---------- dizionari ---------- */
var norm = function(s){ return String(s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/ß/g,"ss").replace(/[’'`´]/g," "); };
var PHRASES = [["paesi bassi","olanda"],["regno unito","regnounito"],["united kingdom","regnounito"],["gran bretagna","regnounito"],["great britain","regnounito"],["repubblica ceca","cechia"],["czech republic","cechia"],["extra vergine","extravergine"],["extra virgin","extravergine"],["extra vergin","extravergine"],["olive oil","olivenol"],["emilia romagna","emiliaromagna"],["friuli venezia giulia","friuli"],["alto adige","sudtirol"],["south tyrol","sudtirol"],["valle d aosta","valledaosta"],["aosta valley","valledaosta"],["private label","privatelabel"],["marchio privato","privatelabel"],["shelf life","shelflife"],["senza glutine","senzaglutine"],["gluten free","senzaglutine"],["cured meats","salumi"],["cured meat","salumi"],["red wine","vino rosso"],["white wine","vino bianco"],["red wines","vino rosso"],["white wines","vino bianco"],["tomato sauce","sugo pomodoro"],["grano duro","granoduro"],["durum wheat","granoduro"]];
var CATW = {
 vino:{g:"vino vini wine wines wein weine cantina cantine winery weingut vinicola", s:"rosso rossi bianco bianchi rosato rosati rose spumante spumanti prosecco barbera nebbiolo pinot chianti amarone primitivo aglianico montepulciano vermentino lambrusco sangiovese rotwein rotweine weisswein weissweine sekt bollicine sparkling passito"},
 olio:{g:"olio oli oil olivenol evo extravergine frantoio olivenole", s:"taggiasca coratina leccino monocultivar"},
 pasta:{g:"pasta nudeln pastificio teigwaren", s:"spaghetti penne fusilli orecchiette tagliatelle farina farine flour mehl riso rice reis gnocchi semola granoduro hartweizen hartweizenpasta trafilata"},
 formaggi:{g:"formaggio formaggi cheese cheeses kase caseificio latticini dairy", s:"pecorino parmigiano grana mozzarella burrata ricotta gorgonzola caciocavallo provolone"},
 salumi:{g:"salumi salume wurst schinken charcuterie salumificio wurstwaren", s:"prosciutto salame salami speck nduja mortadella guanciale pancetta bresaola culatello"},
 dolci:{g:"dolci dolce sweets susswaren pasticceria confectionery dessert desserts", s:"biscotti cantucci panettone torrone cioccolato chocolate schokolade cookies kekse amaretti"},
 conserve:{g:"conserve conserva preserves konserven", s:"sugo sughi passata pomodoro pomodori tomato tomatoes tomaten pesto marmellata marmellate confettura confetture jam marmelade sottoli sottolio sauce sauces sosse sossen"},
 caffe:{g:"caffe coffee kaffee torrefazione rosterei", s:"espresso moka cialde capsule kapseln"},
 liquori:{g:"liquore liquori spirits spirituosen likor likore distillati distillato", s:"grappa grappe amaro amari gin limoncello vermouth"}
};
var SYN = {
 rosso:"rosso rossi red rot rotwein rotweine nebbiolo barbera amarone primitivo aglianico montepulciano chianti sangiovese lambrusco valpolicella",
 bianco:"bianco bianchi white weiss weisswein weissweine vermentino",
 spumante:"spumante spumanti sekt bollicine sparkling prosecco",
 pomodoro:"pomodoro pomodori tomato tomatoes tomaten passata pelati",
 sugo:"sugo sughi sauce sauces sosse sossen ragu",
 marmellata:"marmellata marmellate confettura confetture jam marmelade",
 biscotti:"biscotti biscotto cookies kekse cantucci",
 cioccolato:"cioccolato chocolate schokolade",
 farina:"farina farine flour mehl",
 riso:"riso rice reis",
 granoduro:"granoduro hartweizen hartweizenpasta semola",
 prosciutto:"prosciutto schinken ham",
 salame:"salame salami",
 capsule:"capsule kapseln capsules cialde",
 grappa:"grappa grappe", amaro:"amaro amari"
};
var CON = {}, SYNL = {}; Object.keys(SYN).forEach(function(k){ SYNL[k]=SYN[k].split(" "); SYNL[k].forEach(function(w){ CON[w]=k; }); });
var WORD = {}; Object.keys(CATW).forEach(function(c){ CATW[c].g.split(" ").forEach(function(w){ WORD[w]={cat:c,spec:false}; }); CATW[c].s.split(" ").forEach(function(w){ WORD[w]={cat:c,spec:true}; }); });
var CERTW = {bio:"Bio",biologico:"Bio",biologica:"Bio",biologici:"Bio",biologiche:"Bio",organic:"Bio",okologisch:"Bio",oko:"Bio",dop:"DOP",pdo:"DOP",igp:"IGP",pgi:"IGP",docg:"DOCG",doc:"DOC",igt:"IGT"};
var CTRYW = {DE:"germania germany deutschland tedesco tedesca tedeschi tedesche german deutsch deutsche deutscher deutschen", AT:"austria osterreich austriaco austriaca austrian osterreichisch", CH:"svizzera switzerland schweiz svizzero swiss schweizer", NL:"olanda holland netherlands niederlande olandese dutch niederlandisch", BE:"belgio belgium belgien belga belgian belgisch", FR:"francia france frankreich francese french franzosisch", DK:"danimarca denmark danemark danese danish danisch", SE:"svezia sweden schweden svedese swedish schwedisch", PL:"polonia poland polen polacco polacca polish polnisch", ES:"spagna spain spanien spagnolo spagnola spanish spanisch"};
var CN = {PT:["Portogallo","Portugal","Portugal","portogallo portugal portoghese portuguese portugiesisch"],IE:["Irlanda","Ireland","Irland","irlanda ireland irland irlandese irish irisch"],LU:["Lussemburgo","Luxembourg","Luxemburg","lussemburgo luxembourg luxemburg"],FI:["Finlandia","Finland","Finnland","finlandia finland finnland finlandese finnish finnisch"],NO:["Norvegia","Norway","Norwegen","norvegia norway norwegen norvegese norwegian norwegisch"],GB:["Regno Unito","United Kingdom","Vereinigtes Königreich","regnounito inghilterra england britain grossbritannien britannico british britisch"],CZ:["Repubblica Ceca","Czechia","Tschechien","cechia czechia tschechien ceco czech tschechisch"],SK:["Slovacchia","Slovakia","Slowakei","slovacchia slovakia slowakei slovacco slovak"],SI:["Slovenia","Slovenia","Slowenien","slovenia slowenien sloveno slovenian"],HR:["Croazia","Croatia","Kroatien","croazia croatia kroatien croato croatian"],HU:["Ungheria","Hungary","Ungarn","ungheria hungary ungarn ungherese hungarian ungarisch"],RO:["Romania","Romania","Rumänien","romania rumanien rumeno romanian"],BG:["Bulgaria","Bulgaria","Bulgarien","bulgaria bulgarien bulgaro bulgarian"],GR:["Grecia","Greece","Griechenland","grecia greece griechenland greco greek griechisch"],CY:["Cipro","Cyprus","Zypern","cipro cyprus zypern"],MT:["Malta","Malta","Malta","malta maltese"],EE:["Estonia","Estonia","Estland","estonia estland estone estonian"],LV:["Lettonia","Latvia","Lettland","lettonia latvia lettland lettone latvian"],LT:["Lituania","Lithuania","Litauen","lituania lithuania litauen lituano lithuanian"]};
function cname(c){ if(COUNTRIES[c]) return COUNTRIES[c][lang]; if(CN[c]) return CN[c][{it:0,en:1,de:2}[lang]||0]; return c; }
var CTRY = {}; Object.keys(CN).forEach(function(c){ CN[c][3].split(" ").forEach(function(w){ CTRY[w]=c; }); }); Object.keys(CTRYW).forEach(function(c){ CTRYW[c].split(" ").forEach(function(w){ CTRY[w]=c; }); });
var C2L = {DE:"de",AT:"de",FR:"fr",ES:"es"};
var LGW = {inglese:"en",english:"en",englisch:"en",italiano:"it",italian:"it",italienisch:"it",deutschsprachig:"de"};
var LGCUE = "parla parlano parlare parli speaks speak speaking spricht sprechen lingua language sprache";
var REGW = {"Abruzzo":"abruzzo abruzzen abruzzese","Basilicata":"basilicata lucania lucano lucana","Calabria":"calabria kalabrien calabrese","Campania":"campania kampanien campano","Emilia-Romagna":"emiliaromagna emilia romagna emiliano romagnolo","Friuli-Venezia Giulia":"friuli friaul friulano","Lazio":"lazio latium laziale","Liguria":"liguria ligurien ligure","Lombardia":"lombardia lombardy lombardei lombardo","Marche":"marche marken marchigiano","Molise":"molise molisano","Piemonte":"piemonte piedmont piemont piemontese","Puglia":"puglia apulia apulien pugliese","Sardegna":"sardegna sardinia sardinien sardo sarda","Sicilia":"sicilia sicily sizilien siciliano siciliana sicilian","Toscana":"toscana tuscany toskana toscano tuscan","Trentino-Alto Adige/Südtirol":"trentino sudtirol","Umbria":"umbria umbrien umbro","Valle d'Aosta":"valledaosta aosta aostatal","Veneto":"veneto venetien"};
var REG = {}; Object.keys(REGW).forEach(function(r){ REGW[r].split(" ").forEach(function(w){ REG[w]=r; }); });
var NDW = {age:"stagionato stagionata stagionatura invecchiato aged ageing aging gereift reifung mesi months monate anni years jahre", shelf:"shelflife scadenza haltbarkeit haltbar", price:"prezzo prezzi price prices preis preise euro eur listino", pallet:"pallet pallets palette paletten bancale bancali trasporto transport spedizione shipping versand", pl:"privatelabel eigenmarke", diet:"senzaglutine glutenfrei vegano vegan vegana lattosio lactose laktosefrei", qty:"tonnellate tons tonnen quintali disponibilita availability"};
var ND = {}; Object.keys(NDW).forEach(function(k){ NDW[k].split(" ").forEach(function(w){ ND[w]=k; }); });
var STOP = {}; ("cerco cerchiamo cerca cercare vorrei voglio vogliamo serve servono looking searching search need needs want wanted suche suchen sucht brauche brauchen mochte wir ich sie noi per con senza with without mit ohne and und oder dei delle degli della dello del dal dalla dai nel nella nei sul sulla che the an der die das den dem ein eine einen einem einer von aus fur for from zum zur nach bei prodotto prodotti product products produkt produkte produttore produttori producer producers supplier suppliers fornitore fornitori lieferant lieferanten hersteller erzeuger azienda aziende company companies firma firmen unternehmen italiano italiana italiani italiane italian italienisch italienische italienischen italienischer italia italy italien consegna consegnare delivery deliver lieferung liefern lieferbar possibile possible moglich almeno least mindestens minimo minimum massimo maximum fino certificato certificata certificati certified zertifiziert confezioni confezione packaging verpackung retail dettaglio horeca ristoranti ristorante restaurant restaurants pizzeria pizzerie negozio negozi shop shops importatore importer importeur distributore distributor grossista wholesaler grosshandler buyer ordine order bestellung cartoni cartone cartons carton kartons karton buono buona good gute guter qualita quality qualitat premium artigianale artisan piccolo piccola small kleine kleiner nuovo nuovi new neue anche also auch solo only nur molto very sehr essere sono have haben abbiamo nostro nostra our unser unsere quale which welche dove where come that this dieser diese questo questa mio meine tipo type art regione region paese country land paesi countries lander export exportiert esporta esportano esportare exports esportazione ").split(" ").forEach(function(w){ if(w) STOP[w]=1; });
var CUE = {}; LGCUE.split(" ").forEach(function(w){ CUE[w]=1; STOP[w]=1; });

function stem(w){ return w.length>4 ? w.replace(/(en|er|es|i|e|a|o|s)$/,"") : w; }
var HAY = {}, VOCAB = {};
function index(){
  HAY = {}; VOCAB = {};
  EX.forEach(function(e){
    var names = norm([e.n].concat((e.p||[]).map(function(p){return p[0];})).join(" "));
    var txt = " "+norm([e.n,e.city,(e.d&&e.d.it)||"",(e.d&&e.d.en)||"",(e.d&&e.d.de)||(typeof D_DE!=="undefined"&&D_DE[e.id])||""].concat((e.p||[]).map(function(p){return p[0];})).join(" "))+" ";
    PHRASES.forEach(function(p){ txt = txt.split(p[0]).join(p[1]); names = names.split(p[0]).join(p[1]); });
    var st = {}; txt.split(/[^a-z0-9]+/).forEach(function(w){ if(w.length>=3) st[stem(w)]=1; });
    names.split(/[^a-z0-9]+/).forEach(function(w){ if(w.length>=4) VOCAB[stem(w)]=1; });
    HAY[e.id] = {txt:txt, st:st};
  });
}
function hit1(h,k){ return !!h.st[stem(k)] || (k.length>=5 && h.txt.indexOf(k)>=0); }
function hit(e,k){ var h=HAY[e.id]; if(!h) return false; return SYNL[k] ? SYNL[k].some(function(w){return hit1(h,w);}) : hit1(h,k); }

/* ---------- interpretazione della richiesta ---------- */
function parse(text){
  var raw = String(text||"").slice(0,CFG.maxLen), s = " "+norm(raw)+" ";
  PHRASES.forEach(function(p){ s = s.split(p[0]).join(p[1]); });
  var P = {raw:raw, cats:[], reg:"", certs:[], exp:[], lg:[], moq:null, kw:[], notes:[], unused:[]};
  var m = s.match(/(\d+)\s*(cartoni|cartone|cartons|carton|kartons|karton)/); if(m) P.moq = Number(m[1]);
  var toks = s.split(/[^a-z0-9]+/).filter(Boolean), prev = "";
  var add = function(a,v){ if(a.indexOf(v)<0) a.push(v); };
  toks.forEach(function(w){
    var used = false;
    if(CERTW[w]){ add(P.certs,CERTW[w]); used=true; }
    if(w.indexOf("bio")===0 && w.length>3 && !CERTW[w] && WORD[w.slice(3)]){ add(P.certs,"Bio"); w=w.slice(3); }
    if(!used && LGW[w]){ add(P.lg,LGW[w]); used=true; }
    if(!used && CTRY[w]){ if(CUE[prev] && C2L[CTRY[w]]) add(P.lg,C2L[CTRY[w]]); else add(P.exp,CTRY[w]); used=true; }
    if(!used && REG[w]){ if(!P.reg) P.reg=REG[w]; used=true; }
    if(!used && ND[w]){ add(P.notes,ND[w]); used=true; }
    if(WORD[w]){ add(P.cats,WORD[w].cat); if(WORD[w].spec) add(P.kw,CON[w]||w); used=true; }
    else if(CON[w] && !used){ add(P.kw,CON[w]); used=true; }
    if(!used && !STOP[w] && w.length>=4 && !/^\d+$/.test(w)){ if(VOCAB[stem(w)]) add(P.kw,CON[w]||w); else add(P.unused,w); }
    prev = w;
  });
  if(/€/.test(raw)) add(P.notes,"price");
  return P;
}
function isEmpty(P){ return !P.cats.length && !P.reg && !P.certs.length && !P.exp.length && !P.lg.length && P.moq==null && !P.kw.length; }
function conf(e,f){ return !!e.es || !!(e.stato && (e.stato[f]==="verificato" || e.stato[f]==="dichiarato")); }

/* ---------- confronto con le vetrine ---------- */
function match(P){
  var A=[], B=[], X=[];
  EX.forEach(function(e){
    var ok=[], gap=[], no="", hits=[], miss=[];
    P.kw.forEach(function(k){ (hit(e,k)?hits:miss).push(k); });
    var catOk = !P.cats.length || P.cats.indexOf(e.cat)>=0;
    if(!catOk){ if(e.cat==="misti" && (hits.length || !P.kw.length)) gap.push(tr("gap.mix")); else no = fill(tr("no.cat"),catName(e.cat)); }
    if(!no && P.reg && e.reg!==P.reg) no = fill(tr("no.reg"),regLabel(e.reg));
    if(!no) P.certs.forEach(function(c){ if(no) return; if(e.certs.indexOf(c)>=0) ok.push(fill(tr("ok.cert"),c)); else if(conf(e,"certs")) no = fill(tr("no.cert"),c); else gap.push(fill(tr("gap.cert"),c)); });
    if(!no && P.moq!=null){ if(e.moq==null) gap.push(tr("gap.moq")); else if(e.moq<=P.moq) ok.push(fill(tr("ok.moq"),e.moq)); else no = fill(tr("no.moq"),e.moq); }
    if(!no && P.kw.length){
      if(hits.length) ok.push(fill(tr("ok.kw"),hits.map(kwl).join(", ")));
      if(!hits.length && !(P.cats.length && catOk)) no = fill(tr("no.kw"),P.kw.map(kwl).join(", "));
      else miss.forEach(function(k){ gap.push(fill(tr("gap.kw"),kwl(k))); });
    }
    if(!no) P.exp.forEach(function(c){ var n=cname(c); if(e.exp.indexOf(c)>=0) ok.push(fill(tr("ok.exp"),n)); else if(e.exp.length || conf(e,"exp")) gap.push(fill(tr("gap.expN"),n)); else gap.push(tr("gap.exp0")); });
    if(!no) P.lg.forEach(function(l){ var n=tr("lgn."+l); if((e.lg||[]).indexOf(l)>=0) ok.push(fill(tr("ok.lg"),n)); else gap.push(fill(tr("gap.lg"),n)); });
    var r = {e:e, ok:ok, gap:gap, no:no, score:ok.length*2+hits.length-gap.length};
    (no?X:gap.length?B:A).push(r);
  });
  var by = function(a,b){ return b.score-a.score || a.e.n.localeCompare(b.e.n); };
  return {A:A.sort(by), B:B.sort(by), X:X};
}

/* ---------- profilo export (indice di completezza 0-100) ---------- */
function profilo(e){
  var pd = (typeof PD!=="undefined") ? PD : {}, p = e.p||[];
  var fmt = p.length>0 && p.every(function(x){return !!x[1];}), pdesc = p.some(function(x,i){ var d=pd[e.id+"-"+i]; return d && d.d && d.d.it; });
  var hasExp = (e.exp||[]).length>0 || conf(e,"exp"), hasCert = (e.certs||[]).length>0 || conf(e,"certs");
  var parts = [
    {k:"prod", max:25, got:(p.length>=3?10:p.length?5:0)+(fmt?10:0)+(pdesc?5:0)},
    {k:"merc", max:20, got:(hasExp?12:0)+((e.lg||[]).length?8:0)},
    {k:"log",  max:20, got:(e.ship?10:0)+(e.shelf?10:0)},
    {k:"cap",  max:20, got:(e.moq!=null?12:0)+(e.cap?8:0)},
    {k:"cert", max:15, got:(hasCert?10:0)+(e.certp?5:0)}
  ];
  var miss = [];
  if(!e.y) miss.push("y"); if(!fmt) miss.push("fmt"); if(!pdesc) miss.push("pdesc"); if(!hasExp) miss.push("exp"); if(!(e.lg||[]).length) miss.push("lg");
  if(!e.ship) miss.push("ship"); if(!e.shelf) miss.push("shelf"); if(e.moq==null) miss.push("moq"); if(!e.cap) miss.push("cap"); if(!hasCert) miss.push("certs"); if(!e.certp) miss.push("certp"); if(!e.b2b) miss.push("b2b");
  return {tot:parts.reduce(function(a,x){return a+x.got;},0), parts:parts, miss:miss};
}
function profileHTML(e){
  if(e.es) return "";
  var p = profilo(e), need = p.miss.filter(function(k){return k!=="y";});
  return '<div class="pf"><div class="pf-h"><b>'+esc(tr("pf"))+'</b><span>'+p.tot+'/100</span></div><div class="pf-bar"><i style="width:'+p.tot+'%"></i></div>'+
    '<ul class="pf-parts">'+p.parts.map(function(x){ return '<li><span>'+esc(tr("pfp."+x.k))+'</span><b>'+x.got+'/'+x.max+'</b></li>'; }).join("")+'</ul>'+
    '<p class="pf-m">'+(need.length ? esc(tr("pfMiss"))+" "+esc(need.map(function(k){return tr("mf."+k);}).join(", "))+"." : esc(tr("pfFull")))+'</p><p class="pf-n">'+esc(tr("pfNote"))+'</p></div>';
}
function missingFields(e){ return profilo(e).miss.map(function(k){ return {k:k, label:tr("mf."+k)}; }); }

/* ---------- interfaccia ---------- */
var css = ".as{margin:6px 0 22px;padding:20px;border:1.5px solid #CFE0D8;border-radius:18px;background:#fff;color:#17302E}"+
".as-l{display:block;font:800 19px/1.2 var(--display,system-ui);margin-bottom:10px}"+
".as-bar{display:flex;gap:8px;align-items:stretch}.as-bar input{flex:1;min-width:0;padding:13px 14px;border:1.5px solid #B9CEC4;border-radius:12px;font:inherit;font-size:16px;background:#FBFCF9;color:#17302E}"+
".as-bar input:focus{outline:2px solid #1E5B47;outline-offset:1px}.as-mic{flex:none;width:48px;border:1.5px solid #B9CEC4;border-radius:12px;background:#fff;color:#1E5B47;cursor:pointer;display:grid;place-items:center}"+
".as-vl{flex:none;max-width:118px;padding:0 6px;border:1.5px solid #B9CEC4;border-radius:12px;background:#fff;color:#17302E;font:inherit;font-size:14px}.as-mic.on{background:#C0392B;border-color:#C0392B;color:#fff;animation:aspulse 1.1s ease-in-out infinite}@keyframes aspulse{50%{opacity:.6}}"+
".as-go{flex:none;padding:0 20px;border:0;border-radius:12px;background:#1E5B47;color:#fff;font:700 16px var(--body,system-ui);cursor:pointer}"+
".as-hint{margin:8px 0 0;font-size:14px;color:#7A5300;min-height:0}.as-hint:empty{display:none}"+
".as-ex{margin-top:10px;display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:14px;color:#4A5F5B}.as-ex button,.as-chip{border:1px solid #CFE0D8;background:#F1F6F3;color:#17302E;border-radius:999px;padding:5px 11px;font:inherit;font-size:14px;cursor:pointer}"+
".as-out{margin-top:14px}.as-got{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:14px;margin-bottom:8px}.as-chip b{font-weight:700}.as-chip i{font-style:normal;margin-left:6px;color:#7A8C86}"+
".as-note{margin:6px 0;padding:9px 12px;border-radius:10px;background:#FFF6DC;color:#5C3F00;font-size:14px}.as-un{margin:4px 0 8px;font-size:13px;color:#7A8C86}"+
".as-g{margin:16px 0 8px;font:800 17px/1.2 var(--display,system-ui)}.as-g span{font:400 14px var(--body,system-ui);color:#4A5F5B;margin-left:6px}"+
".as-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:10px}"+
".as-card{border:1px solid #D5E0DA;border-left:5px solid var(--c,#1E5B47);border-radius:12px;padding:12px 14px;background:#FBFCF9;display:flex;flex-direction:column;gap:6px}"+
".as-card h4{margin:0;font:800 16.5px/1.25 var(--display,system-ui)}.as-card .m{font-size:13px;color:#4A5F5B}.as-card ul{margin:0;padding:0;list-style:none;font-size:14px;line-height:1.35}"+
".as-card li.o:before{content:'✓ ';color:#1E8E5A;font-weight:800}.as-card li.g:before{content:'? ';color:#B07D1F;font-weight:800}"+
".as-tag{display:inline-block;margin-left:6px;padding:1px 8px;border-radius:999px;background:#FFE9B0;color:#5C3F00;font:700 11.5px var(--body,system-ui);vertical-align:middle;text-transform:uppercase;letter-spacing:.04em}"+
".as-act{display:flex;gap:8px;flex-wrap:wrap;margin-top:auto;padding-top:4px}.as-act button{border:1px solid #1E5B47;background:#fff;color:#1E5B47;border-radius:9px;padding:6px 10px;font:700 13.5px var(--body,system-ui);cursor:pointer}.as-act button.p{background:#1E5B47;color:#fff}.as-act button[aria-pressed=true]{background:#DFF7EC}"+
".as-empty{padding:14px;border-radius:12px;background:#F1F6F3}.as-empty a{display:inline-block;margin-top:8px;font-weight:700;color:#1E5B47}"+
".as details{margin-top:12px;font-size:14px;color:#4A5F5B}.as summary{cursor:pointer;font-weight:700}.as details ul{margin:8px 0 0;padding-left:18px;line-height:1.5}"+
".as-sel{margin-top:14px;padding:12px 14px;border-radius:12px;background:#0C2622;color:#fff;display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-size:14px}.as-sel:empty{display:none}.as-sel b{font:800 15px var(--display,system-ui);color:#3DFFB0}.as-sel .as-chip{background:#17302E;border-color:#2E4A44;color:#fff}.as-sel .x{background:none;border:1px solid #3DFFB0;color:#3DFFB0;border-radius:9px;padding:5px 10px;font:700 13px var(--body,system-ui);cursor:pointer}.as-sel input{flex:1 1 220px;min-width:0;padding:6px 8px;border-radius:8px;border:0;font:13px monospace}"+
".pf{margin:10px 0;padding:12px 14px;border:1px solid #D5E0DA;border-radius:12px;background:#F6FAF8;color:#17302E;font-size:14px}.pf-h{display:flex;justify-content:space-between;align-items:baseline}.pf-h b{font:800 15px var(--display,system-ui)}.pf-h span{font:800 18px var(--display,system-ui);color:#1E5B47}.pf-bar{height:8px;border-radius:99px;background:#DDE7E2;margin:6px 0 8px;overflow:hidden}.pf-bar i{display:block;height:100%;background:#1E8E5A;border-radius:99px}.pf-parts{list-style:none;margin:0 0 8px;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:2px 16px}.pf-parts li{display:flex;justify-content:space-between;gap:8px}.pf-m{margin:0 0 4px}.pf-n{margin:0;font-size:12.5px;color:#7A8C86}"+
"@media (max-width:640px){.as-bar{flex-wrap:wrap}.as-bar input{flex:1 1 100%}.as-vl{flex:1 1 auto;max-width:none;height:46px}.as-mic{height:46px}.as-go{flex:1 1 auto;height:46px}.as{padding:14px}.as-go{padding:0 14px}.as-list{grid-template-columns:1fr}}";
var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

var host = document.querySelector("#esplora .wrap"), tb = document.getElementById("toolbar");
if(!host || !tb) { window.ASSIST = {parse:parse, match:match, profilo:profilo, profileHTML:profileHTML, missingFields:missingFields}; return; }
var box = document.createElement("div"); box.className = "as"; box.id = "as";
box.innerHTML = '<label class="as-l" for="as-q"></label><div class="as-bar"><input id="as-q" type="text" maxlength="'+CFG.maxLen+'" autocomplete="off" enterkeyhint="search"><select id="as-vl" class="as-vl" hidden></select><button type="button" class="as-mic" id="as-mic" hidden><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button><button type="button" class="as-go" id="as-go"></button></div><p class="as-hint" id="as-hint" role="status"></p><div class="as-ex" id="as-ex"></div><div class="as-out" id="as-out" aria-live="polite"></div><div class="as-sel" id="as-sel"></div>';
host.insertBefore(box, tb);
var $q = box.querySelector("#as-q"), $out = box.querySelector("#as-out"), $sel = box.querySelector("#as-sel"), $hint = box.querySelector("#as-hint"), $mic = box.querySelector("#as-mic"), $vl = box.querySelector("#as-vl");
var last = null, sel = [], shared = false, spoke = "";
try{ sel = JSON.parse(localStorage.getItem("mercatale_sel")||"[]").filter(function(x){return typeof x==="string";}); }catch(err){ sel = []; }
var hm = location.hash.match(/sel=([A-Za-z0-9,\-]+)/); if(hm){ sel = hm[1].split(","); shared = true; }
function known(id){ return EX.some(function(e){return e.id===id;}); }
function saveSel(){ try{ localStorage.setItem("mercatale_sel", JSON.stringify(sel)); }catch(err){} }

function labels(){
  box.querySelector(".as-l").textContent = tr("lbl"); $q.placeholder = tr("ph"); box.querySelector("#as-go").textContent = tr("go");
  $mic.setAttribute("aria-label", tr("mic")); $mic.title = tr("mic"); $vl.setAttribute("aria-label", tr("vl")); $vl.title = tr("vl");
  box.querySelector("#as-ex").innerHTML = '<span>'+esc(tr("try"))+'</span>'+tr("ex").map(function(x){ return '<button type="button" data-ex="'+esc(x)+'">'+esc(x)+'</button>'; }).join("");
  box.querySelectorAll("[data-ex]").forEach(function(b){ b.onclick = function(){ $q.value = b.dataset.ex; run(); }; });
}
function chip(k,label,val){ return '<button type="button" class="as-chip" data-rm="'+esc(k)+'" title="×"><b>'+esc(label)+':</b> '+esc(val)+'<i>×</i></button>'; }
function card(r){
  var e = r.e, on = sel.indexOf(e.id)>=0;
  return '<div class="as-card" style="--c:'+CATS[e.cat].c+'"><h4>'+esc(e.n)+(e.es?'<span class="as-tag">'+esc(tr("es"))+'</span>':'')+'</h4><p class="m">'+esc(catName(e.cat))+' · '+esc(regLabel(e.reg))+'</p>'+
    ((r.ok.length||r.gap.length)?'<ul>'+r.ok.map(function(x){return '<li class="o">'+esc(x)+'</li>';}).join("")+r.gap.map(function(x){return '<li class="g">'+esc(x)+'</li>';}).join("")+'</ul>':'')+
    '<div class="as-act"><button type="button" class="p" data-open="'+esc(e.id)+'">'+esc(tr("open"))+'</button><button type="button" data-sel="'+esc(e.id)+'" aria-pressed="'+on+'">'+esc(on?tr("rem"):tr("add"))+'</button></div></div>';
}
function render(P){
  last = P;
  if(!P){ $out.innerHTML = ""; return; }
  if(isEmpty(P)){ $out.innerHTML = '<div class="as-empty">'+esc(tr("none0"))+(P.unused.length?'<p class="as-un">'+esc(tr("unused"))+' '+esc(P.unused.join(", "))+'</p>':'')+'</div>'; return; }
  var R = match(P), h = '<div class="as-got"><span>'+esc(tr("got"))+'</span>';
  P.cats.forEach(function(c){ h += chip("cat:"+c, tr("c.cat"), catName(c)); });
  if(P.reg) h += chip("reg", tr("c.reg"), regLabel(P.reg));
  P.certs.forEach(function(c){ h += chip("cert:"+c, tr("c.cert"), c); });
  P.exp.forEach(function(c){ h += chip("exp:"+c, tr("c.exp"), cname(c)); });
  P.lg.forEach(function(l){ h += chip("lg:"+l, tr("c.lg"), tr("lgn."+l)); });
  if(P.moq!=null) h += chip("moq", tr("c.moq"), P.moq+" "+tr("c.ct"));
  P.kw.forEach(function(k){ h += chip("kw:"+k, tr("c.kw"), kwl(k)); });
  h += '</div>';
  if(P.unused.length) h += '<p class="as-un">'+esc(tr("unused"))+' '+esc(P.unused.join(", "))+'</p>';
  if(P.notes.length) h += '<p class="as-note">'+esc(fill(tr("noData"), P.notes.map(function(k){return tr("nd."+k);}).join(", ")))+'</p>';
  if(R.A.length) h += '<h3 class="as-g">'+esc(tr("gA"))+'<span>'+R.A.length+'</span></h3><div class="as-list">'+R.A.map(card).join("")+'</div>';
  if(R.B.length) h += '<h3 class="as-g">'+esc(tr("gB"))+'<span>'+R.B.length+'</span></h3><div class="as-list">'+R.B.map(card).join("")+'</div>';
  if(!R.A.length && !R.B.length) h += '<div class="as-empty"><b>'+esc(tr("gN"))+'</b><br>'+esc(tr("gNp"))+'<br><a href="mailto:info@mercatale.eu?subject='+encodeURIComponent("Mercatale: "+tr("write"))+'&body='+encodeURIComponent(P.raw)+'">'+esc(tr("write"))+'</a></div>';
  if(R.X.length) h += '<details><summary>'+esc(tr("why"))+' ('+R.X.length+')</summary><ul>'+R.X.slice(0,60).map(function(r){ return '<li><b>'+esc(r.e.n)+'</b>: '+esc(r.no)+'</li>'; }).join("")+'</ul></details>';
  $out.innerHTML = h;
  $out.dataset.a = R.A.length; $out.dataset.b = R.B.length; $out.dataset.x = R.X.length;
}
function renderSel(){
  var ids = sel.filter(known);
  if(!ids.length){ $sel.innerHTML = ""; return; }
  var url = location.origin+location.pathname+(DEMO?"?demo=1":"")+"#sel="+ids.join(",");
  $sel.innerHTML = '<b>'+esc(shared?tr("shared"):tr("sel"))+' ('+ids.length+')</b>'+ids.map(function(id){ var e=EX.find(function(x){return x.id===id;}); return '<button type="button" class="as-chip" data-open="'+esc(id)+'">'+esc(e.n)+'</button>'; }).join("")+
    '<button type="button" class="x" id="as-copy">'+esc(tr("copy"))+'</button><button type="button" class="x" id="as-clear">'+esc(tr("clear"))+'</button><input id="as-url" readonly hidden value="'+esc(url)+'">';
  $sel.querySelector("#as-copy").onclick = function(){
    var b = this, inp = $sel.querySelector("#as-url"), done = function(){ b.textContent = tr("copied"); };
    if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, function(){ inp.hidden=false; inp.select(); });
    else { inp.hidden=false; inp.select(); }
  };
  $sel.querySelector("#as-clear").onclick = function(){ sel = []; shared = false; saveSel(); if(/sel=/.test(location.hash)) history.replaceState(null,"",location.pathname+location.search); renderSel(); render(last); };
}
box.addEventListener("click", function(ev){
  var o = ev.target.closest("[data-open]"), s = ev.target.closest("[data-sel]"), rm = ev.target.closest("[data-rm]");
  if(o && typeof openStand==="function"){ openStand(o.dataset.open); return; }
  if(s){ var id = s.dataset.sel, i = sel.indexOf(id); if(i>=0) sel.splice(i,1); else sel.push(id); shared = false; saveSel(); renderSel(); render(last); return; }
  if(rm && last){ var k = rm.dataset.rm.split(":"), v = k[1]; k = k[0];
    var drop = function(a){ var j=a.indexOf(v); if(j>=0) a.splice(j,1); };
    if(k==="cat") drop(last.cats); else if(k==="reg") last.reg=""; else if(k==="cert") drop(last.certs); else if(k==="exp") drop(last.exp); else if(k==="lg") drop(last.lg); else if(k==="moq") last.moq=null; else if(k==="kw") drop(last.kw);
    render(last); }
});
function sanitize(j, P){
  if(!j || typeof j!=="object") return P;
  var arr = function(x){ return Array.isArray(x)?x.filter(function(v){return typeof v==="string";}).slice(0,8):[]; };
  var o = {raw:P.raw, cats:arr(j.cats).filter(function(c){return !!CATS[c];}), reg:REGW[j.reg]?j.reg:"", certs:arr(j.certs).filter(function(c){return CERTS.indexOf(c)>=0;}), exp:arr(j.exp).filter(function(c){return !!COUNTRIES[c]||!!CN[c];}), lg:arr(j.lg).filter(function(l){return !!L.it.lgn[l];}), moq:(j.moq!=null&&isFinite(Number(j.moq))&&Number(j.moq)>0&&Number(j.moq)<100000)?Math.round(Number(j.moq)):null, kw:arr(j.kw).map(norm).filter(function(w){return /^[a-z0-9 ]{3,30}$/.test(w);}).map(function(w){return CON[w]||w;}).slice(0,5), notes:arr(j.notes).filter(function(n){return !!NDW[n];}), unused:[]};
  return isEmpty(o) ? P : o;
}
function done(P, via){
  render(P);
  if(typeof track==="function" && P){ var R = isEmpty(P) ? {A:[],B:[]} : match(P);
    track("assistente", {esito:isEmpty(P)?"non capito":R.A.length?"corrisponde":R.B.length?"possibile":"non presente", lingua:lang, voce:spoke||"no", via:via}); }
  if(isEmpty(P) && !CFG.ai && spoke && ["it","en","de"].indexOf(spoke)<0) $hint.textContent = tr("only");
}
function run(){
  var text = $q.value.trim().slice(0,CFG.maxLen); $hint.textContent = "";
  if(!text){ render(null); return; }
  var P = parse(text), other = spoke && ["it","en","de"].indexOf(spoke)<0;
  if(!CFG.ai || !(isEmpty(P) || P.unused.length || other)){ done(P,"regole"); return; }
  $hint.textContent = tr("wait");
  var ctl = ("AbortController" in window) ? new AbortController() : null, tm = setTimeout(function(){ if(ctl) ctl.abort(); }, 7000);
  fetch(CFG.ai, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({q:text, lang:lang, voce:spoke}), signal:ctl?ctl.signal:undefined})
    .then(function(r){ if(!r.ok) throw new Error("ai"); return r.json(); })
    .then(function(j){ clearTimeout(tm); $hint.textContent = ""; var Q = sanitize(j,P); done(Q, Q===P?"regole":"ai"); })
    .catch(function(){ clearTimeout(tm); $hint.textContent = ""; done(P,"regole"); });
}
box.querySelector("#as-go").onclick = run;
$q.addEventListener("keydown", function(ev){ if(ev.key==="Enter"){ ev.preventDefault(); run(); } });
$q.addEventListener("input", function(ev){ if(ev.isTrusted && !rec) spoke = ""; });

var VL = [["bg-BG","Български"],["cs-CZ","Čeština"],["da-DK","Dansk"],["de-DE","Deutsch"],["el-GR","Ελληνικά"],["en-GB","English"],["es-ES","Español"],["et-EE","Eesti"],["fi-FI","Suomi"],["fr-FR","Français"],["ga-IE","Gaeilge"],["hr-HR","Hrvatski"],["hu-HU","Magyar"],["it-IT","Italiano"],["lt-LT","Lietuvių"],["lv-LV","Latviešu"],["mt-MT","Malti"],["nl-NL","Nederlands"],["pl-PL","Polski"],["pt-PT","Português"],["ro-RO","Română"],["sk-SK","Slovenčina"],["sl-SI","Slovenščina"],["sv-SE","Svenska"]];
function vlDefault(){
  var saved = ""; try{ saved = localStorage.getItem("mercatale_vl")||""; }catch(err){}
  var has = function(tag){ return VL.some(function(x){return x[0]===tag;}); };
  if(saved && has(saved)) return saved;
  var nav = String(navigator.language||"").slice(0,2).toLowerCase(), byNav = VL.filter(function(x){return x[0].slice(0,2)===nav;})[0];
  if(byNav) return byNav[0];
  return {it:"it-IT",en:"en-GB",de:"de-DE"}[lang]||"it-IT";
}
/* ---------- dettatura: solo dove il browser la offre, testo sempre modificabile, nessun audio salvato ---------- */
var SR = window.SpeechRecognition || window.webkitSpeechRecognition, rec = null;
if(SR){
  $mic.hidden = false; $vl.hidden = false;
  $vl.innerHTML = VL.map(function(x){ return '<option value="'+x[0]+'">'+esc(x[1])+'</option>'; }).join(""); $vl.value = vlDefault();
  $vl.onchange = function(){ try{ localStorage.setItem("mercatale_vl",$vl.value); }catch(err){} };
  $mic.onclick = function(){
    if(rec){ rec.stop(); return; }
    try{
      rec = new SR(); rec.lang = $vl.value; spoke = $vl.value.slice(0,2); rec.interimResults = true; rec.maxAlternatives = 1;
      rec.onresult = function(ev){ var s=""; for(var i=0;i<ev.results.length;i++) s += ev.results[i][0].transcript; $q.value = s.slice(0,CFG.maxLen); };
      rec.onerror = function(){ $hint.textContent = tr("micErr"); };
      rec.onend = function(){ rec = null; $mic.classList.remove("on"); if($q.value && $hint.textContent!==tr("micErr")) $hint.textContent = tr("micOk"); $q.focus(); };
      rec.start(); $mic.classList.add("on"); $hint.textContent = tr("micOn");
    }catch(err){ rec = null; $mic.classList.remove("on"); $hint.textContent = tr("micErr"); }
  };
}

/* ---------- lingua e modalità demo ---------- */
if(DEMO){ ["it","en","de"].forEach(function(l){ T[l].facts = L[l].facts; T[l]["dm.banner"] = L[l].demoB; }); }
["it","en","de"].forEach(function(l){ T[l]["dm.es"] = L[l].es; T[l]["dm.esm"] = L[l].esm; });
function refresh(){ labels(); render(last); renderSel(); var b=document.getElementById("demo-banner"); if(b && DEMO) b.innerHTML = t("dm.banner"); var f=document.getElementById("facts"); if(f && DEMO) f.textContent = t("facts",EX.length); }
document.addEventListener("click", function(ev){ if(ev.target.closest("[data-lang]")) setTimeout(refresh, 60); });
index(); refresh();
window.ASSIST = {parse:parse, match:match, profilo:profilo, profileHTML:profileHTML, missingFields:missingFields, run:run};
})();
