/*
  OS-aware download buttons.

  The installers are NOT hosted here — they're served straight from the
  GitHub Release's asset URLs, which are direct file links: clicking one
  starts the download immediately, the visitor never lands on a GitHub page.
  Self-hosting them isn't an option anyway; the AppImage alone is 114 MB and
  GitHub Pages rejects any file over 100 MB.

  Progressive enhancement, deliberately:
    - With JS off, the markup already renders all three platforms as equal
      buttons with correct direct hrefs. Nothing is broken, just unsorted.
    - With JS on, we promote the visitor's platform to a single primary
      button and demote the rest to a small "also available" row.

  When you cut a new release, edit RELEASE below and nothing else. Its
  filenames must match the assets electron-builder uploaded — they carry the
  version number, so they change every release. To stop hand-editing this,
  set a version-less `artifactName` in the app's electron-builder.yml (e.g.
  Mailbun-Setup.exe); the URLs can then use GitHub's /releases/latest/download/
  redirect and never need touching again.
*/

var RELEASE = {
  version: '0.1.3',
  base: 'https://github.com/magnus530/mailbun/releases/download/v0.1.3/',
  assets: {
    win:   'Mailbun-Setup-0.1.3.exe',
    mac:   'Mailbun-0.1.3-arm64.dmg',
    linux: 'Mailbun-0.1.3.AppImage'
  }
};

/*
  Returns 'win' | 'mac' | 'linux', or null when we can't tell or there's no
  build for the device. Null is a real answer, not a failure: phones and
  tablets get the untouched three-button list rather than a big button
  offering them a desktop installer they can't run.
*/
function detectOS() {
  var ua = navigator.userAgent || '';
  var uaData = navigator.userAgentData;
  var hay = ((uaData && uaData.platform) || '') + ' ' + ua;

  if (/Android|iPhone|iPod/i.test(ua)) return null;

  // iPadOS asks for desktop sites by default and reports itself as
  // "Macintosh". Touch points are what actually separate it from a Mac.
  if (/Mac/i.test(hay) && navigator.maxTouchPoints > 1) return null;

  if (/Win/i.test(hay)) return 'win';
  if (/Mac/i.test(hay)) return 'mac';
  if (/Linux|X11|CrOS/i.test(hay)) return 'linux';
  return null;
}

function applyDetection() {
  var os = detectOS();
  if (!os) return;

  var groups = document.querySelectorAll('[data-downloads]');
  for (var i = 0; i < groups.length; i++) {
    var group = groups[i];
    var links = group.querySelectorAll('[data-os]');
    var matched = false;

    for (var j = 0; j < links.length; j++) {
      var link = links[j];
      if (link.getAttribute('data-os') === os) {
        link.classList.add('is-primary');
        matched = true;
      } else {
        link.classList.add('is-secondary');
      }
    }

    // Only collapse the group once we've actually promoted something —
    // otherwise a build we forgot to list would leave every button demoted.
    if (!matched) continue;

    // Move the demoted links into their own row so they sit side by side
    // under the primary button rather than stacking down the page. A flex
    // column can't do this without a wrapper, so we make one.
    var alt = document.createElement('div');
    alt.className = 'downloads-alt';
    var secondary = group.querySelectorAll('.is-secondary');
    for (var k = 0; k < secondary.length; k++) alt.appendChild(secondary[k]);
    group.appendChild(alt);

    group.setAttribute('data-detected', os);
  }
}

// Fill in hrefs from RELEASE so the version lives in exactly one place.
// The markup ships with the same URLs hardcoded as a no-JS fallback; this
// just keeps them in sync when you bump the version above.
function applyHrefs() {
  var links = document.querySelectorAll('[data-os]');
  for (var i = 0; i < links.length; i++) {
    var asset = RELEASE.assets[links[i].getAttribute('data-os')];
    if (asset) links[i].href = RELEASE.base + asset;
  }
  var stamps = document.querySelectorAll('[data-version]');
  for (var k = 0; k < stamps.length; k++) {
    stamps[k].textContent = 'v' + RELEASE.version;
  }
}

applyHrefs();
applyDetection();
