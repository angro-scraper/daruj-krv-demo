/* Završni prikaz dnevnog izveštaja. Učitava se nakon glavne aplikacije. */
portalTemplates.reports = () => {
  const counts = intakeCounts();
  const active = counts.checkedIn + counts.medical;
  const total = adminIntakeRows.length;
  const capacity = Math.round(active / total * 100);
  const actions = `<button class="ghost-button" data-portal-screen="operations">Otvori operativni tok</button><button class="primary-button compact" data-action="export-report">${workIcon('report')} Preuzmi izveštaj</button>`;
  return `${portalHeader('IZVEŠTAJI I ANALITIKA', 'Dnevni izveštaj', actions)}
    <section class="daily-report-hero">
      <div><span class="eyebrow">DOM OMLADINE · BEOGRAD · 12. OKTOBAR 2026.</span><h2>Akcija je u toku.<br><em>Odluke ostaju jasne.</em></h2><p>Zbirni pregled prijema, kapaciteta i sledećih koraka — bez identifikacionih i zdravstvenih podataka.</p><div class="daily-report-meta"><span>${workIcon('calendar')} Ažurirano danas u 10:42</span><span>${workIcon('shield')} Zbirni demonstracioni podaci</span></div></div>
      <aside><span class="live-status"><i></i> Aktivna akcija</span><strong>${active}</strong><span>od ${total} osoba u operativnom toku</span><div><i style="width:${capacity}%"></i></div><small>${capacity}% trenutnog kapaciteta</small></aside>
    </section>
    <section class="daily-report-metrics">
      <button data-portal-screen="operations"><span class="report-metric-icon wine">${workIcon('calendar')}</span><div><small>ZAKAZANO</small><strong>${counts.scheduled}</strong><em>čeka prijem</em></div>${workIcon('arrow')}</button>
      <button data-portal-screen="checkin"><span class="report-metric-icon aqua">${workIcon('queue')}</span><div><small>U TOKU</small><strong>${active}</strong><em>prijem i medicinski red</em></div>${workIcon('arrow')}</button>
      <button data-portal-screen="medical"><span class="report-metric-icon mint">${workIcon('medical')}</span><div><small>KOD TIMA</small><strong>${counts.medical}</strong><em>zaštićen radni tok</em></div>${workIcon('arrow')}</button>
      <button data-portal-screen="events"><span class="report-metric-icon amber">${workIcon('report')}</span><div><small>KAPACITET</small><strong>${capacity}%</strong><em>${total - active} termina raspoloživo</em></div>${workIcon('arrow')}</button>
    </section>
    <section class="daily-report-layout">
      <section class="premium-panel daily-flow-panel"><header class="premium-panel-head"><div><span class="eyebrow">OPERATIVNI TOK</span><h2>Gde je akcija sada</h2><p>Svaka faza ima vlasnika i sledeći radni prostor.</p></div><button class="table-button" data-portal-screen="operations">Prikaži red</button></header><div class="daily-flow-list">
        <button class="complete" data-portal-screen="events"><span>01</span><div><strong>Priprema akcije</strong><small>Smene, punkt i javna objava su potvrđeni.</small></div><b>${workIcon('check')}</b></button>
        <button class="active" data-portal-screen="checkin"><span>02</span><div><strong>Prijem davalaca</strong><small>${counts.scheduled} osoba čeka, ${counts.checkedIn} je prijavljeno.</small></div><b>${workIcon('arrow')}</b></button>
        <button data-portal-screen="medical"><span>03</span><div><strong>Medicinski radni tok</strong><small>${counts.medical} osobe su predate timu kroz zaštićen red.</small></div><b>${workIcon('arrow')}</b></button>
        <button data-portal-screen="reports"><span>04</span><div><strong>Zatvaranje i audit</strong><small>Planirano po završetku smene i potvrdi zbira.</small></div><b>${workIcon('report')}</b></button>
      </div></section>
      <section class="premium-panel daily-capacity-panel"><header class="premium-panel-head"><div><span class="eyebrow">KAPACITET PUNKTA</span><h2>Termini po vremenu</h2><p>Jasan raspored za sledeću odluku.</p></div><button class="table-button" data-portal-screen="events">Raspored</button></header><div class="daily-capacity-ring" style="--capacity:${capacity}%"><div><strong>${capacity}%</strong><small>popunjeno</small></div></div><div class="daily-capacity-list"><button data-portal-screen="events"><span>Jutro</span><i><b style="width:72%"></b></i><strong>72%</strong></button><button data-portal-screen="events"><span>Podne</span><i><b style="width:58%"></b></i><strong>58%</strong></button><button data-portal-screen="events"><span>Popodne</span><i><b style="width:36%"></b></i><strong>36%</strong></button></div></section>
    </section>
    <section class="premium-panel daily-report-footer"><div><span class="report-metric-icon wine">${workIcon('campaign')}</span><div><span class="eyebrow">KAMPANJA · OD PORUKE DO TERMINA</span><h2>168 realizovanih dolazaka</h2><p>1.240 dostavljenih obaveštenja → 746 otvaranja → 214 rezervacija → 168 realizovanih dolazaka.</p></div><button class="table-button" data-portal-screen="campaigns">Otvori kampanje</button></div><aside><span class="eyebrow">SLEDEĆA ODLUKA</span><strong>Proveri kapacitet pre sledećeg talasa.</strong><button data-portal-screen="command">Otvori prioritete ${workIcon('arrow')}</button></aside></section>`;
};
