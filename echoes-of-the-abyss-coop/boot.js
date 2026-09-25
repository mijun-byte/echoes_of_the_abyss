/* A fresh manifest selects matching assets without touching the player's saves. */
(async function () {
  const status = document.getElementById('bootStatus');
  try {
    let version = '20260925-lobby';
    if (location.protocol !== 'file:') {
      const response = await fetch('build.json', {cache: 'no-store'});
      if (!response.ok) throw new Error('manifest');
      const build = await response.json();
      if (typeof build.version !== 'string') throw new Error('version');
      version = build.version;
    }
    window.ABYSS_BUILD = version;
    document.getElementById('gameStyle').href = 'style.css?v=' + encodeURIComponent(version);
    for (const file of ['coop-config.js', 'game.js']) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = file + '?v=' + encodeURIComponent(version);
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    }
    status.remove();
  } catch {
    status.textContent = 'Le jeu n’a pas pu se charger. Vérifie ta connexion.';
    const retry = document.createElement('button');
    retry.textContent = 'Réessayer le chargement';
    retry.onclick = () => {const url = new URL(location.href);url.searchParams.set('refresh', Date.now());location.replace(url.href);};
    status.appendChild(retry);
  }
})();
